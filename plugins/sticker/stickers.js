import { sticker } from '../../lib/sticker.js'
import uploadFile from '../../lib/uploadFile.js'
import uploadImage from '../../lib/uploadImage.js'
import { webp2png } from '../../lib/webp2mp4.js'
import Jimp from 'jimp'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const res = await fetch('https://files.catbox.moe/p87uei.jpg')
  const thumb = Buffer.from(await res.arrayBuffer())
  let user = m.sender

  const fkontak = {
    key: { fromMe: false, participant: user },
    message: {
      imageMessage: {
        jpegThumbnail: thumb,
        caption: '𝗦𝗧𝗜𝗖𝗞𝗘𝗥 𝗚𝗘𝗡𝗘𝗥𝗔𝗗𝗢 𝗖𝗢𝗡 𝗘𝗫𝗜𝗧𝗢 ✨',
      }
    }
  }

  let texto = args.filter(a => !/^(co|cc|cp|cu|es)$/i.test(a)).join(' ').trim()
  let estilo = (args.find(a => /^(co|cc|cp|cu|es)$/i.test(a)) || '').toLowerCase()
  let stiker = false

  try {
    let q = m.quoted ? m.quoted : m
    let mime = q.mimetype || q.msg?.mimetype || q.message?.imageMessage?.mimetype || q.message?.videoMessage?.mimetype || q.message?.stickerMessage?.mimetype || ''

    if (/video/.test(mime)) return m.reply('⚠️ No se permiten stickers animados o en movimiento.')

    if (/webp|image/.test(mime)) {
      let img = await q.download?.()
      if (!img) return conn.reply(m.chat, '✰ ᴘᴏʀ ғᴀᴠᴏʀ, ᴇɴᴠÍᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴘᴀʀᴀ ᴄᴏɴᴠᴇʀᴛɪʀ ᴀ sᴛɪᴄᴋᴇʀ.', m, rcanal)

      let jimg = await Jimp.read(img)
      let { width, height } = jimg.bitmap

      if (estilo === 'cp') jimg.contain(500, 500)

      if (estilo === 'cc') {
        const mask = await new Jimp(width, height, 0x00000000)
        mask.scan(0, 0, width, height, function (x, y, idx) {
          const dx = x - width / 2
          const dy = y - height / 2
          const r = Math.sqrt(dx * dx + dy * dy)
          if (r < width / 2) this.bitmap.data[idx + 3] = 255
        })
        jimg.mask(mask, 0, 0)
      }

      if (estilo === 'co') {
        const mask = await new Jimp(width, height, 0x00000000)
        const heart = (x, y, s) => {
          x = (x - width / 2) / s
          y = (y - height / 2) / s
          return Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3) <= 0
        }
        mask.scan(0, 0, width, height, function (x, y, idx) {
          if (heart(x, y, width / 16)) this.bitmap.data[idx + 3] = 255
        })
        jimg.mask(mask, 0, 0)
      }

      if (texto) {
        const brillo = jimg.bitmap.data.reduce((a, _, i) => i % 4 !== 3 ? a + jimg.bitmap.data[i] : a, 0) / (width * height * 3)
        const color = brillo > 127 ? '#000000' : '#FFFFFF'
        const fuente = await Jimp.loadFont(color === '#000000' ? Jimp.FONT_SANS_64_BLACK : Jimp.FONT_SANS_64_WHITE)
        const sombra = await Jimp.loadFont(color === '#000000' ? Jimp.FONT_SANS_64_WHITE : Jimp.FONT_SANS_64_BLACK)
        jimg.print(sombra, 3, -3, { text: texto, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM }, width, height - 20)
        jimg.print(fuente, 0, 0, { text: texto, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM }, width, height - 20)
      }

      img = await jimg.getBufferAsync(Jimp.MIME_PNG)
      stiker = await sticker(img, false, global.packsticker, global.packsticker2)
    } else if (args[0]) {
      if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packsticker, global.packsticker2)
      else return m.reply('❌ La URL es incorrecta.')
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) await conn.sendMessage(m.chat, { sticker: stiker, ...global.rcanal }, { quoted: fkontak })
    else return conn.reply(m.chat, '✰ ᴘᴏʀ ғᴀᴠᴏʀ, ᴇɴᴠÍᴀ ᴜɴᴀ ɪᴍᴀɢᴇɴ ᴘᴀʀᴀ ᴄᴏɴᴠᴇʀᴛɪʀ ᴀ sᴛɪᴄᴋᴇʀ.', m, fake)
  }
}

handler.help = ['sticker <texto opcional>', 's <texto opcional>', 'stiker <texto opcional>']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = text => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}