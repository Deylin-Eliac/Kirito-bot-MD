import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    let who
    let mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender

    if (mentionedJid) {
        who = mentionedJid
    } else if (m.quoted) {
        who = m.quoted.sender
    } else {
        who = m.sender
    }

    const name2 = m.pushName || 'Anónimo'
  const name = await conn.getName(who) || 'Anónimo'

    m.react('😭')

    let str
    if (who !== m.sender) {
        str = `😭 *${name2}* está llorando por *${name}*`
    } else {
        str = `😭 *${name2}* no puede parar de llorar... necesita consuelo`
    }

    if (m.isGroup) {
        const videos = [
            'https://media.tenor.com/0qj0aqZ0nucAAAPo/anya-spy-x-family-anime-anya-crying.mp4',
            'https://media.tenor.com/PhUSf6rVeyAAAAPo/bocchi-the-rock-crying.mp4',
            'https://media.tenor.com/35S_M89zT3sAAAPo/horimiya-anime.mp4',
            'https://media.tenor.com/pWQsUP6AtNgAAAPo/luffy-crying.mp4',
         'https://media.tenor.com/jotyiHEoUGUAAAPo/anime.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who, m.sender],
            ...global.rcanal
        }, { quoted: m })
    }
}

handler.help = ['llorar @tag', 'cry @tag']
handler.tags = ['anime']
handler.command = ['llorar', 'cry']
handler.group = true

export default handler