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

  const name2 = m.pushName || 'Anónimo'
  const name = await conn.getName(who) || 'Anónimo'

  await m.react('😔')

  let str
  if (who !== m.sender) {
    str = `😔 *${name2}* está triste por *${name}*`
  } else {
    str = `😔 *${name2}* está muy triste... necesita apoyo`
  }

  const videos = [
    'https://media.tenor.com/D--yGsQy2EsAAAPo/crying-girl-anime.mp4',
    'https://media.tenor.com/pWN680lA4LoAAAPo/sigma.mp4',
    'https://media.tenor.com/ukwvYi0Olk8AAAPo/sad-anime-guy-lonely-anime-guy.mp4',
    'https://media.tenor.com/pWQsUP6AtNgAAAPo/luffy-crying.mp4',
    'https://media.tenor.com/WpXfUhL-rZQAAAPo/horimiya-ayasaki-remi.mp4'
  ]

  const videoUrl = videos[Math.floor(Math.random() * videos.length)]

  await conn.sendMessage(
    m.chat,
    {
      video: { url: videoUrl },
      gifPlayback: true,
      caption: str,
      mentions: [who, m.sender],
      ...global.rcanal
    },
    { quoted: m }
  )
}

handler.help = ['sad @tag', 'triste @tag']
handler.tags = ['anime']
handler.command = ['sad', 'triste']
handler.group = true

export default handler