const handler = async (m, { conn }) => {
  try {
    const who = m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : m.fromMe
        ? conn.user.jid
        : m.sender

    const avatarUrl = await conn.profilePictureUrl(who, "image").catch(() => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
    const processedImageUrl = `https://canvas-8zhi.onrender.com/api/gay?profile=${encodeURIComponent(avatarUrl)}`

    const frases = [
      "🏳️‍🌈 La ciencia lo confirma: un verdadero icono del orgullo ha nacido.",
      "🌈 El universo ha hablado… y dijo: *Gay Supreme detected*.",
      "💫 Las estrellas brillan más cuando este gay entra en escena.",
      "✨ Confirmado por la NASA: el aura gay más poderosa del sistema solar.",
      "⚡ No es bug, es *Energía Gay Artificial Inteligente* (EGAI).",
      "🌈 Bendecido por los dioses del glitter y la elegancia suprema.",
      "💎 Exceso de estilo detectado. Nivel de gaydad: sobre 9000.",
      "🔥 Cuando el arcoíris te ve, él se sonroja.",
      "🌟 La IA ha hablado: Gay Supremo confirmado por Kirito-Bot-MD.",
      "👑 El papá de los gays ha descendido del Olimpo digital."
    ]

    const randomFrase = frases[Math.floor(Math.random() * frases.length)]

    await conn.sendMessage(
      m.chat,
      {
        image: { url: processedImageUrl },
        caption: randomFrase
      },
      { quoted: m }
    )
  } catch (e) {
    m.reply(`⚠️ Ocurrió un error al procesar la imagen gay 😭 error: \n ${e.message} \n\nUsa el comando\`#report <error>\` para reportar el error.`)
  }
}
 
handler.help = ["marica", "gay"]
handler.tags = ["fun"]
handler.command = ["marica", "gay"]

export default handler