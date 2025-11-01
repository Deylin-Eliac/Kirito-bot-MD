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
  let botSettings = global.db.data.settings[conn.user.jid] || {}
  if (botSettings.soloParaJid) return
  if (!m.messageStubType || !m.isGroup) return true

  const totalMembers = participants.length
  const date = new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })
  const who = m.messageStubParameters?.[0]
  if (!who) return

  const user = participants.find(p => p.jid === who)
  const userName = user?.notify || ''
  const taguser = `@${who.split('@')[0]}`
  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return

  let tipo = ''
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) tipo = 'Bienvenido'
  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) tipo = 'Adiós'
  if (!tipo) return

  const tipo2 = global.img || ''

  let avatar
  try {
    avatar = await conn.profilePictureUrl(who, 'image')
  } catch {
    avatar = tipo2
  }

  const fraseAleatoria = tipo === 'Bienvenido' 
    ? frasesBienvenida[Math.floor(Math.random() * frasesBienvenida.length)]
    : frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)]

  const urlapi = `https://canvas-8zhi.onrender.com/api/welcome3?title=${encodeURIComponent(tipo)}&desc=${encodeURIComponent(fraseAleatoria)}&profile=${encodeURIComponent(avatar)}&background=${encodeURIComponent(tipo2)}`

  let fkontak
  try {
    const res2 = await fetch('https://i.postimg.cc/c4t9wwCw/1756162596829.jpg')
    const img3 = Buffer.from(await res2.arrayBuffer())
    fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: { locationMessage: { name: `${tipo} ${userName}`, jpegThumbnail: img3 } }
    }
  } catch (e) {
    console.error(e)
  }

  const groupSubject = groupMetadata.subject
  const jid = m.chat
  const number = who.split('@')[0]

  const productMessage = {
    product: {
      productImage: { url: urlapi },
      productId: '2452968910',
      title: `${tipo}, ahora somos ${totalMembers}`,
      description: '',
      currencyCode: 'USD',
      priceAmount1000: '0',
      retailerId: 1677,
      url: `https://deylin.xyz/#sitio_web_del_creador`,
      productImageCount: 1
    },
    businessOwnerJid: who || '0@s.whatsapp.net',
    caption: `✰𝙐𝙨𝙚𝙧: ${taguser}\n✎𝙂𝙧𝙪𝙥𝙤: ${groupSubject}\n✎𝙈𝙞𝙚𝙢𝙗𝙧𝙤: ${totalMembers}\n✰ 𝙁𝙚𝙘𝙝𝙖: ${date}`.trim(),
    title: 'gati',
    subtitle: '',
    footer: `✰𝙐𝙨𝙚𝙧: ${taguser}\n✎𝙂𝙧𝙪𝙥𝙤: ${groupSubject}\n✎𝙈𝙞𝙚𝙢𝙗𝙧𝙤: ${totalMembers}\n✰ 𝙁𝙚𝙘𝙝𝙖: ${date}`,
    mentions: who ? [who] : []
  }

  const mentionId = who ? [who] : []
  await conn.sendMessage(jid, productMessage, {
    quoted: fkontak,
    contextInfo: { mentionedJid: mentionId }
  })
}