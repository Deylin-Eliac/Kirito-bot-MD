import { sticker } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/webp2mp4.js'
import Jimp from 'jimp'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { execSync } from 'child_process'

const isUrl = (text) => {
  return text && text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png|webp)/, 'gi'))
}

const tmpFile = (ext = '') => path.join(os.tmpdir(), Date.now().toString(36) + Math.random().toString(36).slice(2,8) + (ext ? '.' + ext : ''))

const averageBrightness = async (buffer) => {
  const img = await Jimp.read(buffer)
  const w = img.bitmap.width
  const h = img.bitmap.height
  const sx = Math.max(0, Math.floor(w * 0.25))
  const sy = Math.max(0, Math.floor(h * 0.25))
  const ex = Math.min(w, Math.floor(w * 0.75))
  const ey = Math.min(h, Math.floor(h * 0.75))
  let total = 0
  let count = 0
  for (let x = sx; x < ex; x += Math.max(1, Math.floor((ex - sx) / 20))) {
    for (let y = sy; y < ey; y += Math.max(1, Math.floor((ey - sy) / 20))) {
      const { r, g, b } = Jimp.intToRGBA(img.getPixelColor(x, y))
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b)
      total += brightness
      count++
    }
  }
  return total / Math.max(1, count)
}

const makeImageWithText = async (buffer, text, textColor) => {
  const image = await Jimp.read(buffer)
  const w = image.bitmap.width
  const h = image.bitmap.height
  const maxWidth = w - 40
  const fontSize = Math.min(96, Math.max(48, Math.floor(h / 6)))
  let font = textColor === 'white' ? await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE) : await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
  const lines = []
  const words = String(text || '').split(/\s+/)
  let line = ''
  for (let word of words) {
    const test = line ? line + ' ' + word : word
    const measure = Jimp.measureText(font, test)
    if (measure > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  const padding = 15
  const textHeight = lines.length * (Jimp.measureTextHeight(font, 'M', maxWidth) + 10)
  const boxHeight = textHeight + padding * 2
  const boxY = h - boxHeight - 20
  const box = new Jimp(w, boxHeight, textColor === 'white' ? 0x00000099 : 0xFFFFFF99)
  image.composite(box, 0, boxY)
  let y = boxY + padding
  for (let ln of lines) {
    const textW = Jimp.measureText(font, ln)
    const x = Math.floor((w - textW) / 2)
    image.print(font, x, y, ln)
    y += Jimp.measureTextHeight(font, ln, maxWidth) + 10
  }
  return await image.getBufferAsync(Jimp.MIME_PNG)
}

const renderVideoWithTextToWebp = async (inputPath, text, textColor) => {
  const outWebp = tmpFile('webp')
  const fontfile = ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/freefont/FreeSans.ttf','/Library/Fonts/Arial.ttf'].find(p => fs.existsSync(p)) || ''
  const safeText = String(text || '').replace(/:/g, '\\:').replace(/'/g, "\\'")
  const colorHex = textColor === 'white' ? 'FFFFFF' : '000000'
  const ffmpegCmd = [
    '-y',
    '-i', `"${inputPath}"`,
    '-vf',
    `"scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,drawbox=y=ih-130:color=black@0.4:width=iw:height=130:t=max,drawtext=fontfile='${fontfile}':text='${safeText}':fontcolor=#${colorHex}:fontsize=42:x=(w-text_w)/2:y=h-95"`,
    '-vcodec', 'libwebp',
    '-lossless', '1',
    '-loop', '0',
    '-preset', 'default',
    '-an',
    '-vsync', '0',
    `"${outWebp}"`
  ].join(' ')
  execSync(`ffmpeg ${ffmpegCmd}`, { stdio: 'pipe' })
  const data = fs.readFileSync(outWebp)
  try { fs.unlinkSync(outWebp) } catch(e){}
  return data
}

let handler = async (m, { conn, args }) => {
  let stiker = false
  let userId = m.sender
  let packstickers = global.db && global.db.data && global.db.data.users && global.db.data.users[userId] ? global.db.data.users[userId] : {}
  let texto1 = packstickers.text1 || global.packsticker || ''
  let texto2 = packstickers.text2 || global.packsticker2 || ''
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let txt = args.join(' ') || texto1 + (texto2 ? ' • ' + texto2 : '')
    if (/webp|image|video/g.test(mime) && q.download) {
      if (/video/.test(mime) && (q.msg || q).seconds > 16) return conn.reply(m.chat, `${emoji} El video no puede durar más de *15 segundos*`, m, rcanal)
      const buffer = await q.download()
      await m.react('🕓')
      if (/video/.test(mime)) {
        const inPath = tmpFile('mp4')
        fs.writeFileSync(inPath, buffer)
        const framePath = tmpFile('png')
        try {
          execSync(`ffmpeg -y -i "${inPath}" -ss 0 -vframes 1 -q:v 2 "${framePath}"`, { stdio: 'ignore' })
          const frameBuf = fs.readFileSync(framePath)
          const brightness = await averageBrightness(frameBuf)
          const textColor = brightness < 128 ? 'white' : 'black'
          const webpBuffer = await renderVideoWithTextToWebp(inPath, txt, textColor)
          stiker = webpBuffer
        } finally {
          try { fs.unlinkSync(inPath) } catch(e){}
          try { fs.unlinkSync(framePath) } catch(e){}
        }
      } else {
        const brightness = await averageBrightness(buffer)
        const textColor = brightness < 128 ? 'white' : 'black'
        const imgWithText = await makeImageWithText(buffer, txt, textColor)
        stiker = await sticker(imgWithText, false, texto1, texto2)
      }
    } else if (args[0] && isUrl(args[0])) {
      const url = args[0]
      const resp = await fetch(url)
      const buf = Buffer.from(await resp.arrayBuffer())
      const brightness = await averageBrightness(buf)
      const textColor = brightness < 128 ? 'white' : 'black'
      const imgWithText = await makeImageWithText(buf, args.slice(1).join(' ') || texto1 + (texto2 ? ' • ' + texto2 : ''), textColor)
      stiker = await sticker(imgWithText, false, texto1, texto2)
    } else {
      return conn.reply(m.chat, `${emoji} Por favor, envía una *imagen* o *video* para hacer un sticker.`, m1, rcanal)
    }
  } catch (e) {
    await conn.reply(m.chat, '⚠︎ Ocurrió un Error: ' + (e.message || e), m)
    try { await m.react('✖️') } catch {}
  } finally {
    if (stiker) {
      try {
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        await m.react('✅')
      } catch (e) {
        try { await conn.sendMessage(m.chat, { sticker: stiker, rcanal }, { quoted: m1 }) } catch {}
      }
    }
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']

export default handler