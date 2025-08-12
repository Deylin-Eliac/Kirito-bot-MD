// plugins/estilo-anuncio.js
/*import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const imgUrl = 'https://files.catbox.moe/8vxwld.jpg'
  const res = await fetch(imgUrl)
  const thumb = Buffer.from(await res.arrayBuffer())

  const anuncioPro = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "ANUNCIO_PRO"
    },
    message: {
      extendedTextMessage: {
        text: '🚨 *Prueba uno* - Este es un mensaje con estilo Anuncio Ultra Pro.\n\n¡Atención! Información VIP exclusiva para ti.',
        contextInfo: {
          externalAdReply: {
            title: '🔥 Noticia Exclusiva',
            body: 'Haz clic y entérate antes que todos',
            thumbnail: thumb,
            sourceUrl: 'https://tu-enlace.com',
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true
          },
          locationMessage: {
            name: '⚡ AVISO ULTRA IMPORTANTE ⚡',
            jpegThumbnail: thumb
          }
        }
      }
    },
    participant: "0@s.whatsapp.net"
  }

  await conn.relayMessage(m.chat, anuncioPro.message, { messageId: anuncioPro.key.id })
}

handler.command = /^prueba1$/i
export default handler*/



import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const thumb = await (await fetch('https://files.catbox.moe/8vxwld.jpg')).buffer()

  // Mensaje de plantilla con encabezado de imagen y botones
  const templateButtons = [
    { index: 1, urlButton: { displayText: 'Sitio Web', url: 'https://tubotprofesional.com' } },
    { index: 2, callButton: { displayText: 'Llamar', phoneNumber: '+525512345678' } },
    { index: 3, quickReplyButton: { displayText: '¡Quiero mi bot ahora!' } }
  ]

  const templateMessage = {
    image: thumb,
    caption: `🚀 *¡Oferta exclusiva!* 🚀\n\n🔥 Consigue tu propio bot de WhatsApp profesional, rápido y personalizable.\n\n✨ Funciones avanzadas: comandos, stickers, conexión QR, reacciones, mensajes enriquecidos y más.\n\n💼 ¡Ideal para negocios y creadores!`,
    footer: '💻 Bot Profesional WhatsApp',
    templateButtons: templateButtons,
    contextInfo: {
      externalAdReply: {
        showAdAttribution: true,
        title: '💻 Bot Profesional WhatsApp',
        body: 'Visita nuestra web y conoce todos los detalles',
        thumbnail: thumb,
        sourceUrl: 'https://tubotprofesional.com',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }

  conn.sendMessage(m.chat, templateMessage)
}

handler.command = ['comprar']
export default handler
