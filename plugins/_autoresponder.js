import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = m => m

handler.all = async function (m, { conn }) {
  let user = global.db.data.users[m.sender]
  let chat = global.db.data.chats[m.chat]

const res = await fetch(`${kirito}/media/images/87411733_k.jpg`);
  const thumb2 = Buffer.from(await res.arrayBuffer());
const userJid = m.sender;

  const fkontak = {
    key: { fromMe: false, participant: userJid },
    message: {
      imageMessage: {
        mimetype: 'image/jpeg',
        caption: '𝗥𝗘𝗦𝗣𝗨𝗘𝗦𝗧𝗔 > 𝗕𝗢𝗧',
        jpegThumbnail: thumb2
      }
    }
  };

  m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 
          || m.id.startsWith('3EB0') && (m.id.length === 12 || m.id.length === 20 || m.id.length === 22) 
          || m.id.startsWith('B24E') && m.id.length === 20
  if (m.isBot) return 

  let prefixRegex = new RegExp('^[' + (opts?.prefix || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true

  if (m.sender?.toLowerCase().includes('bot')) return true

  if (!chat.isBanned && chat.autoresponder) {
    if (m.fromMe) return

    let query = m.text || ''
    let username = m.pushName || 'Usuario'

    let isOrBot = /bot/i.test(query)
    let isReply = m.quoted && m.quoted.sender === this.user.jid
        let isMention = m.mentionedJid && m.mentionedJid.includes(this.user.jid) 

    if (!(isOrBot || isReply || isMention)) return

    await this.sendPresenceUpdate('composing', m.chat)

    let txtDefault = `
Eres ${botname}, una inteligencia artificial avanzada creada por ${etiqueta} para WhatsApp. Tu propósito es brindar respuestas claras, pero con una actitud empática y comprensiva.
`.trim()

    let logic = chat.sAutoresponder ? chat.sAutoresponder : txtDefault

    try {
      const apiUrl = `https://g-mini-ia.vercel.app/api/mode-ia?prompt=${encodeURIComponent(query)}&id=${encodeURIComponent(username)}&logic=${encodeURIComponent(logic)}`
      const res = await fetch(apiUrl)
      const data = await res.json()
      let result = data.result || data.answer || data.response || null
      if (result && result.trim().length > 0) {
        await this.reply(m.chat, result, fkontak, rcanal)
      }
    } catch (e) {
      console.error(e)
      await this.reply(m.chat, '⚠️ Ocurrió un error con la IA.', m)
    }
  }
  return true
}

export default handler