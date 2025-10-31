import { sticker } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/webp2mp4.js'
import Jimp from 'jimp'
import fs from 'fs'
import os from 'os'
import path from 'path'

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

let handler = async (m, { conn, args }) => {
  let stiker = false
  let userId = m.sender
  let packstickers = global.db?.data?.users?.[userId] || {}
  let texto1 = packstickers.text1 || global.packsticker || ''
  let texto2 = packstickers.text2 || global.packsticker2 || ''
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    let txt = args.join(' ').trim()
    if (/webp|image|video/g.test(mime) && q.download) {
      if (/video/.test(mime) && (q.msg || q).seconds > 16) return conn.reply(m.chat, `${emoji} El video no puede durar más de *15 segundos*`, m, rcanal)
      const buffer = await q.download()
      await m.react('🕓')
      if (/video/.test(mime)) {
        stiker = await sticker(buffer, false, texto1, texto2)
      } else {
        if (txt) {
          const brightness = await averageBrightness(buffer)
          const textColor = brightness < 128 ? 'white' : 'black'
          const imgWithText = await makeImageWithText(buffer, txt, textColor)
          stiker = await sticker(imgWithText, false, texto1, texto2)
        } else {
          stiker = await sticker(buffer, false, texto1, texto2)
        }
      }
    } else if (args[0] && isUrl(args[0])) {
      const url = args[0]
      const resp = await fetch(url)
      const buf = Buffer.from(await resp.arrayBuffer())
      if (args.slice(1).length) {
        const brightness = await averageBrightness(buf)
        const textColor = brightness < 128 ? 'white' : 'black'
        const imgWithText = await makeImageWithText(buf, args.slice(1).join(' '), textColor)
        stiker = await sticker(imgWithText, false, texto1, texto2)
      } else {
        stiker = await sticker(buf, false, texto1, texto2)
      }
    } else {
      return conn.reply(m.chat, `${emoji} Por favor, envía una *imagen* o *video* para hacer un sticker.`, m1, rcanal)
    }
  } catch (e) {
    await conn.reply(m.chat, `⚠︎ Ocurrió un Error: ${e.message}`, m1, rcanal)
    await m.react('✖️')
  } finally {
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m1, rcanal)
      await m.react('✅')
    }
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']

export default handler