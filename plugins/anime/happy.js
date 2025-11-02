let handler = async (m, { conn }) => {
  let who
  const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

  if (mentionedJid) {
    who = mentionedJid
  } else if (m.quoted) {
    who = m.quoted.sender
  } else {
    who = m.sender
  }

  const name2 = m.sender.split('@')[0]
  const name = who.split('@')[0]

  await m.react('😊')

  let str
  if (who !== m.sender) {
    str = `😊 *@${name2}* está feliz por *@${name}*`
  } else {
    str = `😊 *@${name2}* está muy feliz... compartiendo alegría`
  }

  const videos = [
    'https://media.tenor.com/8bPhxIk_rL4AAAPo/celebrate-anime.mp4',
    'https://media.tenor.com/OiTJF1B4cokAAAPo/maomao-apothecary-diaries.mp4',
    'https://media.tenor.com/7RG3JbLdlXIAAAPo/konata-izumi-konata.mp4',
    'https://media.tenor.com/D05kuhjm9rUAAAPo/jjk-anime.mp4',
    'https://media.tenor.com/Kr6jKur1_DYAAAPo/cat.mp4'
  ]

  const videoUrl = videos[Math.floor(Math.random() * videos.length)]

  await conn.sendMessage(
    m.chat,
    {
      video: { url: videoUrl },
      gifPlayback: true,
      caption: str,
      mentions: [who, m.sender]
    },
    { quoted: m }
  )
}

handler.help = ['feliz @tag', 'happy @tag']
handler.tags = ['anime']
handler.command = ['feliz', 'happy']
handler.group = true

export default handler