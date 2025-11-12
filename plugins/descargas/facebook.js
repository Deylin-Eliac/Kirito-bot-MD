import fetch from "node-fetch"

let handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, `${emoji} Necesitas enviar un enlace de *Facebook* para descargar.`, m, rcanal)

  const resThumb3 = await fetch('https://files.catbox.moe/nbkung.jpg')
  const thumb24 = Buffer.from(await resThumb3.arrayBuffer())

  const fkontak = {
    key: {
      participants: ["0@s.whatsapp.net"],
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: `𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔 𝗗𝗘 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞`,
        jpegThumbnail: thumb24
      }
    },
    participant: "0@s.whatsapp.net"
  }

  const regexFacebook = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+$/i
  if (!regexFacebook.test(args[0])) return conn.reply(m.chat, `${emoji} El enlace proporcionado no es válido o no pertenece a *Facebook*.`, m, rcanal)

  try {
    if (m.react) await m.react("⏳")

    const apiUrl = `${kirito}/api/facebook?url=${encodeURIComponent(args[0])}&apikey=by_deylin`
    const response = await fetch(apiUrl)
    const json = await response.json()

    if (!json.estado || !json.resultados?.status || !json.resultados?.data?.length) {
      return conn.reply(m.chat, `❌ No se pudo obtener información del video.`, m, rcanal)
    }

    const data = json.resultados.data[0]
    const video = data.url
    const miniatura = data.thumbnail
    const resolucion = data.resolution || "Desconocida"

    const resThumb = await fetch("https://files.catbox.moe/nbkung.jpg")
    const thumb2 = Buffer.from(await resThumb.arrayBuffer())

    const txt = `
🎥 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥  

🌐 Plataforma: Facebook  
📺 Resolución: ${resolucion}  

⚙️ Opciones de descarga:  
1️⃣ Vídeo normal 📽️  
2️⃣ Solo audio 🎵  
3️⃣ Nota de vídeo 🕳️  

💡 Responde con el número de tu elección.
`.trim()

    const sentMsg = await conn.sendMessage(
      m.chat,
      {
        image: { url: miniatura },
        caption: txt,
        ...global.rcanal
      },
      { quoted: fkontak }
    )

    conn.fbMenu = conn.fbMenu || {}
    conn.fbMenu[sentMsg.key.id] = { video }
    if (m.react) await m.react("✅")

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `⚠️ Ocurrió un error al procesar tu solicitud.\n\nDetalles: ${e.message}`, m, rcanal)
  }
}

handler.help = ['facebook <url>', 'fb <url>']
handler.tags = ['descargas']
handler.command = ['facebook', 'fb']

let before = async (m, { conn }) => {
  if (!m.quoted || !conn.fbMenu) return

  const msgId = m.quoted.id || m.quoted.key?.id
  const data = conn.fbMenu[msgId]
  if (!data) return

  const choice = m.text.trim()
  if (!["1", "2", "3"].includes(choice)) return

  const resThumb34 = await fetch('https://files.catbox.moe/nbkung.jpg')
  const thumb246 = Buffer.from(await resThumb34.arrayBuffer())

  const fkontak = {
    key: {
      participants: ["0@s.whatsapp.net"],
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: `𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔 𝗗𝗘 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞`,
        jpegThumbnail: thumb246
      }
    },
    participant: "0@s.whatsapp.net"
  }

  try {
    switch (choice) {
      case "1":
        await conn.sendMessage(
          m.chat,
          { video: { url: data.video }, caption: "🎬 Facebook Video" },
          { quoted: fkontak }
        )
        break
      case "2":
        await conn.sendMessage(
          m.chat,
          { audio: { url: data.video }, mimetype: "audio/mpeg", fileName: "facebook.mp3" },
          { quoted: fkontak }
        )
        break
      case "3":
        await conn.sendMessage(
          m.chat,
          { video: { url: data.video }, mimetype: "video/mp4", ptv: true },
          { quoted: fkontak }
        )
        break
    }
  } catch (e) {
    console.error(e)
    m.reply("❌ Error al enviar el archivo.")
  }
}

handler.before = before
export default handler