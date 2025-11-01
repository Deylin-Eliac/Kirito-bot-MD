import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

const frasesBienvenida = [
  "Nos alegra tenerte con nosotros, disfruta tu estadía",
  "Prepárate para compartir momentos increíbles",
  "Bienvenido, que tu energía positiva contagie al grupo",
  "Que tu presencia haga este grupo más fuerte",
  "Estamos felices de que te unas a nuestra comunidad",
  "Nuevo integrante, nuevas aventuras por vivir",
  "Tu participación será muy valiosa, bienvenido",
  "Esperamos que encuentres apoyo y diversión aquí",
  "Que cada mensaje tuyo sume alegría al grupo",
  "Bienvenido, este es un espacio de colaboración y respeto"
]

const frasesDespedida = [
  "Nos entristece verte partir, que te vaya bien",
  "Gracias por tu tiempo con nosotros, hasta luego",
  "Tu energía hará falta, hasta pronto",
  "Que encuentres nuevos caminos llenos de éxitos",
  "Esperamos verte de nuevo en otra ocasión",
  "Se va un miembro valioso, buen viaje",
  "Nos dejas un vacío, cuídate mucho",
  "Hasta la próxima, que todo te vaya excelente",
  "Tu participación siempre será recordada",
  "Despedirse es difícil, pero los recuerdos quedan"
]

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true
  const who = m.messageStubParameters?.[0]
  if (!who) return

  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return

  const tipo = 
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ? '✰ 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨 ✰' :
    (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) ? '✰ 𝐃𝐞𝐬𝐩𝐞𝐝𝐢𝐝𝐚 ✰' :
    null

  if (!tipo) return

  const frase = tipo.includes('Bienvenido')
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
    avatar = 'https://i.postimg.cc/Gm9jRysW/default-avatar.png'
  }

  const fondo = tipo.includes('Bienvenido')
    ? 'https://i.postimg.cc/0yGwZ9Gy/welcome-bg.jpg'
    : 'https://i.postimg.cc/BvccvPC8/bye-bg.jpg'

  const imgUrl = `https://canvas-8zhi.onrender.com/api/welcome3?title=${encodeURIComponent(tipo)}&desc=${encodeURIComponent(frase)}&profile=${encodeURIComponent(avatar)}&background=${encodeURIComponent(fondo)}`

  const textoDecorativo = `
╭───✰ 𝙀𝙫𝙚𝙣𝙩𝙤 𝙙𝙚 𝙂𝙧𝙪𝙥𝙤 ✰───╮
✎ 𝙐𝙨𝙪𝙖𝙧𝙞𝙤: ${taguser}
✎ 𝙂𝙧𝙪𝙥𝙤: ${grupo}
✎ 𝙈𝙞𝙚𝙢𝙗𝙧𝙤𝙨: ${total}
✎ 𝙁𝙚𝙘𝙝𝙖: ${date}
╰───────────────────────────────╯

“${frase}”

✰ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝐊𝐢𝐫𝐢𝐭𝐨-𝐁𝐨𝐭 𝐌𝐃 ✰
`.trim()

  await conn.sendMessage(m.chat, {
    text: textoDecorativo,
    mentions: [who],
    contextInfo: {
      mentionedJid: [who],
      externalAdReply: {
        title: tipo,
        body: frase,
        mediaType: 1,
        thumbnailUrl: imgUrl,
        sourceUrl: 'https://deylin.xyz/',
        showAdAttribution: true,
        renderLargerThumbnail: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302968753676@newsletter',
          newsletterName: '✰ 𝐊𝐢𝐫𝐢𝐭𝐨 𝐁𝐨𝐭 ✰',
          serverMessageId: -1
        }
      }
    }
  })
}