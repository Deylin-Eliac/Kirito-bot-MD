import fetch from "node-fetch"

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Necesitas enviar un enlace de *Instagram* para descargar.`, m, rcanal)
  }

  const resThumb = await fetch('https://i.postimg.cc/RV6xwKt9/1760499473884.jpg')
  const thumb = Buffer.from(await resThumb.arrayBuffer())

  const fkontak = {
    key: {
      participants: ["0@s.whatsapp.net"],
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: `𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔 𝗗𝗘 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠`,
        jpegThumbnail: thumb
      }
    },
    participant: "0@s.whatsapp.net"
  };

  const regexInstagram = /^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/[^\s]+$/i
  if (!regexInstagram.test(args[0])) {
    return conn.reply(m.chat, `🚫 El enlace proporcionado no es válido o no pertenece a *Instagram*.`, m, rcanal)
  }

  try {
    if (m.react) await m.react("⏳")

    const apiUrl = `${kirito}/api/instagram?url=${encodeURIComponent(args[0])}&apikey=by_deylin`
    const response = await fetch(apiUrl)
    const json = await response.json()

    if (!json.estado || !json.resultados?.status || !json.resultados?.data?.length) {
      return conn.reply(m.chat, `❌ No se pudo obtener información del video.`, m, rcanal)
    }

    const data = json.resultados.data[0]
    const video = data.url
    const miniatura = data.thumbnail
    const tipo = data.type || "video/mp4"

    const caption = `
🎥 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥  

🌐 Plataforma: Instagram  
📺 Formato: ${tipo}  

⚙️ Opciones de descarga:  
1️⃣ Vídeo normal 📽️  
2️⃣ Solo audio 🎵  
3️⃣ Nota de vídeo 🕳️  

💡 Responde con el número de tu elección.
`.trim()

    const sentMsg = await conn.sendMessage(
      m.chat,
      { image: { url: miniatura }, caption, ...global.rcanal },
      { quoted: fkontak }
    )

    conn.igMenu = conn.igMenu || {}
    conn.igMenu[sentMsg.key.id] = { video }
    if (m.react) await m.react("✅")

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `${emoji} Ocurrió un error al procesar tu solicitud.\n\nDetalles: ${e.message}`, m, rcanal)
  }
}

handler.help = ['instagram <url>', 'ig <url>']
handler.tags = ['descargas']
handler.command = ['instagram', 'ig']

let before = async (m, { conn }) => {
  if (!m.quoted || !conn.igMenu) return

  const msgId = m.quoted.id || m.quoted.key?.id
  const data = conn.igMenu[msgId]
  if (!data) return

  const choice = m.text.trim()
  if (!["1", "2", "3"].includes(choice)) return

  const resThumb = await fetch('https://i.postimg.cc/RV6xwKt9/1760499473884.jpg')
  const thumb = Buffer.from(await resThumb.arrayBuffer())

  const fkontak = {
    key: {
      participants: ["0@s.whatsapp.net"],
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: `𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔 𝗗𝗘 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠`,
        jpegThumbnail: thumb
      }
    },
    participant: "0@s.whatsapp.net"
  };

  try {
    switch (choice) {
      case "1":
        await conn.sendMessage(
          m.chat,
          { video: { url: data.video }, caption: "🎬 Instagram Video" },
          { quoted: fkontak }
        )
        break
      case "2":
        await conn.sendMessage(
          m.chat,
          { audio: { url: data.video }, mimetype: "audio/mpeg", fileName: "instagram.mp3" },
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