import { WAMessageStubType, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
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
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD ? 'Bienvenido 🎉' :
    (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) ? 'Despedida 👋' :
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

  // Crear mensaje decorativo tipo template interactivo
  const templateMessage = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          header: {
            title: tipo,
            subtitle: grupo,
            hasMediaAttachment: true,
            ...(await conn.prepareMessageMedia({ image: { url: imgUrl } }, { upload: conn.waUploadToServer }))
          },
          body: {
            text: `✰ Usuario: ${taguser}\n✎ Fecha: ${date}\n✎ Miembros: ${total}`
          },
          footer: {
            text: "✨ Powered by Kirito-Bot-MD"
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "💖 Bienvenido",
                  copy_code: grupo
                })
              },
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "📢 Canal Oficial",
                  url: "https://whatsapp.com/channel/0029VbB46nl2ER6dZac6Nd1o"
                })
              }
            ]
          },
          contextInfo: {
            mentionedJid: [who],
            externalAdReply: {
              title: tipo,
              body: frase,
              thumbnailUrl: imgUrl,
              sourceUrl: "https://deylin.xyz/",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        })
      }
    }
  }, {})

  await conn.relayMessage(m.chat, templateMessage.message, { messageId: templateMessage.key.id })
}