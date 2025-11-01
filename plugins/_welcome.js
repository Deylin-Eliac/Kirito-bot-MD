Import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true
  const who = m.messageStubParameters?.[0]
  if (!who) return

  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return

  const tipo =
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ? '👑 𝑩𝒊𝒆𝒏𝒗𝒆𝒏𝒊𝒅𝒂 𝑺𝒐𝒍𝒆𝒎𝒏𝒆 👑' :
    (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) ? '🥀 𝑫𝒆𝒔𝒑𝒆𝒅𝒊𝒅𝒂 𝑯𝒐𝒏𝒐𝒓𝒂𝒃𝒍𝒆 🥀' :
    null
  if (!tipo) return

  const frasesBienvenida = [
    "¡Una nueva leyenda se une a nuestras filas! Que tu camino esté lleno de éxitos. ✨",
    "El escenario está listo para ti. ¡Prepárate para brillar y compartir momentos geniales! 🌟",
    "Un miembro valioso se suma. Te damos la más cálida y entusiasta bienvenida. 🥂"
  ]
  const frasesDespedida = [
    "Nos despedimos de un compañero inolvidable. El recuerdo de tu tiempo aquí permanece. 👋",
    "Toda despedida es un nuevo comienzo. Gracias por tu contribución, ¡te deseamos lo mejor! 🌠",
    "Se va una parte de la familia. Tu huella es imborrable. ¡Vuelve pronto, amigo! 🕊️"
  ]
  const frase = tipo.includes('Bienvenida')
    ? frasesBienvenida[Math.floor(Math.random() * frasesBienvenida.length)]
    : frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)]

  const taguser = `@${who.split('@')[0]}`
  const total = participants.length
  const grupo = groupMetadata.subject
  const date = new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })

  let avatar
  try {
    avatar = await conn.profilePictureUrl(who, 'image')
  } catch {
    avatar = 'https://kirito.my/media/images/78139889_k.jpg'
  }

  const fondo = tipo.includes('Bienvenida')
    ? 'https://kirito.my/media/images/78139889_k.jpg'
    : 'https://kirito.my/media/images/78139889_k.jpg'

  const textoTarjeta = `
「 ━━━━━━ 🌟 ━━━━━━ 」
       ${tipo}
「 ━━━━━━ 🌟 ━━━━━━ 」

╭┈─────────────── •
┊ •• 👤 𝐔𝐬𝐮𝐚𝐫𝐢𝐨: ${taguser}
┊ •• 🌐 𝐆𝐫𝐮𝐩𝐨: ${grupo}
┊ •• 👥 𝐌𝐢𝐞𝐦𝐛𝐫𝐨𝐬: ${total}
┊ •• 🗓️ 𝐅𝐞𝐜𝐡𝐚: ${date}
╰┈─────────────── •

"${frase}"

━━━━━━ 🤖 ━━━━━━
✨ 𝑷𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝑲𝒊𝒓𝒊𝒕𝒐-𝑩𝒐𝒕-𝑴𝑫 ✨
`.trim()

  await conn.sendMessage(m.chat, {
    text: textoTarjeta,
    mentions: [who],
    contextInfo: {
      mentionedJid: [who],
      externalAdReply: {
        title: tipo.includes('Bienvenida') ? '🎉 ¡Nuevo Miembro! ¡Bienvenido/a! 🎉' : '💔 ¡Un Adiós! ¡Mucha Suerte! 💔',
        body: frase.length > 30 ? frase.substring(0, 30) + '...' : frase,
        thumbnailUrl: avatar,
        mediaUrl: fondo,
        sourceUrl: 'https://deylin.xyz/',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363322161441595@newsletter',
          newsletterName: '✰ Kirito-Bot Oficial ✰',
          serverMessageId: -1
        }
      }
    }
  })
}
