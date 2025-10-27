import { aiLabs } from '../../lib/ailabs.js'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `🧠 *Uso correcto:*
${usedPrefix + command} <prompt>

📸 *Ejemplo:*
${usedPrefix + command} gato samurái con armadura futurista`, m, rcanal)

  await conn.reply(m.chat, `${emoji} Generando imagen...`, m, rcanal)
  const res = await aiLabs.generate({ prompt: text, type: 'image' })

  if (!res.success) {
    return conn.reply(m.chat, `❌ Error (${res.code}): ${res.result?.error || 'No se pudo generar la imagen'}`, m, rcanal)
  }

  return conn.sendMessage(
    m.chat,
    {
      image: { url: res.result.url },
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