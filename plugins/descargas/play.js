import fetch from "node-fetch"
import yts from "yt-search"
import fs from "fs"
import { tmpdir } from "os"
import path from "path"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `⚠️ Ingresa el nombre o enlace de un video de YouTube.\n\nEjemplo:\n${usedPrefix + command} despacito`, m)

  try {
    const search = await yts(text)
    const video = search.videos && search.videos.length > 0 ? search.videos[0] : null
    if (!video) return conn.reply(m.chat, "❌ No se encontró ningún resultado.", m)

    const api = `https://api.kirito.my/api/ytmp3?url=${encodeURIComponent(video.url)}&apikey=by_deylin`
    const res = await fetch(api)
    const data = await res.json()
    if (!data?.resultado?.link_descarga) return conn.reply(m.chat, "❌ No se pudo obtener el enlace de descarga.", m)

    const infoMessage = `
🎶 *TÍTULO:* ${video.title}
📺 *CANAL:* ${video.author?.name || "Desconocido"}
⏳ *DURACIÓN:* ${video.timestamp}
👁️ *VISTAS:* ${video.views.toLocaleString()}
📅 *PUBLICADO:* ${video.ago}
🔗 *ENLACE:* ${video.url}
`.trim()

    await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: infoMessage }, { quoted: m })

    const audioUrl = data.resultado.link_descarga
    const tempPath = path.join(tmpdir(), `${video.videoId}.mp3`)

    const audioRes = await fetch(audioUrl)
    const arrayBuffer = await audioRes.arrayBuffer()
    fs.writeFileSync(tempPath, Buffer.from(arrayBuffer))

    await conn.sendMessage(
      m.chat,
      {
        audio: fs.readFileSync(tempPath),
        mimetype: "audio/mpeg",
        fileName: `${video.title}.mp3`
      },
      { quoted: m }
    )

    fs.unlinkSync(tempPath)
  } catch (err) {
    console.error(err)
    conn.reply(m.chat, "⚠️ Ocurrió un error al procesar la descarga.", m)
  }
}

handler.help = ["play", "mp3"]
handler.tags = ["descargas"]
handler.command = /^(play|mp3)$/i

export default handler