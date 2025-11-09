import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, text }) => {
  try {
    if (m.fromMe) return
    await m.react(`⏳`)

    if (m.quoted && m.quoted.mimetype) {
      const mime = m.quoted.mimetype

      if (/text|json|javascript|html|css|xml/.test(mime)) {
        let buffer = await m.quoted.download()
        let txt = buffer.toString('utf-8')
        try { txt = format(JSON.parse(txt)) } catch {}
        await m.reply('txt')
        return m.react(`👑`)
      }

      let buffer = await m.quoted.download()
      await conn.sendMessage(m.chat, { document: buffer, mimetype: mime, fileName: m.quoted.fileName || 'archivo' }, { quoted: m })
      return m.react(`⚡`)
    }

    if (!text || !/^https?:\/\//.test(text)) {
      return m.reply(`${emoji} Envía una URL válida o cita un archivo y usa get`)
    }

    const res = await fetch(text)
    const type = res.headers.get('content-type') || ''

    if (!/text|json/.test(type)) {
      await conn.sendFile(m.chat, text, 'archivo', text, m)
      return m.react(`🌟`)
    }

    let txt = (await res.buffer()).toString('utf-8')
    try { txt = format(JSON.parse(txt)) } catch {}
    await m.reply('txt')
    await m.react(`🔥`)

  } catch (err) {
    await m.react(`❌`)
    await m.reply(`${emoji} ${err.message || err}`)
  }
}

handler.help = ['get']
handler.tags = ['tools']
handler.command = ['fetch', 'get']
handler.rowner = true

export default handler