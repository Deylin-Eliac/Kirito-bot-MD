import { aiLabs } from '../../lib/ailabs.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `🧠 *Uso correcto:*
${usedPrefix + command} <prompt>

📸 *Ejemplo:*
${usedPrefix + command} gato samurái con armadura futurista`, m, rcanal)

  await conn.reply(m.chat, `${emoji} Generando imagen...`, m1, rcanal)
  const res = await aiLabs.generate({ prompt: text, type: 'image' })

  if (!res.success) {
    return conn.reply(m.chat, `❌ Error (${res.code}): ${res.result?.error || 'No se pudo generar la imagen'}`, m, rcanal)
  }
  
  let imageBuffer;
  try {
      const response = await fetch(res.result.url);
      imageBuffer = await response.buffer();
  } catch (error) {
      console.error("Error al descargar la imagen:", error);
      return conn.reply(m.chat, `❌ Error al descargar la imagen generada.`, m, rcanal);
  }

  return conn.sendMessage(
    m.chat,
    {
      image: imageBuffer,
      caption: `${emoji} *Imagen generada con IA*`
    },
    { quoted: m }
  )
}

handler.help = ['iaimg <prompt>', 'imgg <prompt>', 'aimg <prompt>', 'genimg <prompt>']
handler.tags = ['ai']
handler.command = ['iaimg', 'imgg', 'aimg', 'genimg']
handler.limit = true

export default handler
