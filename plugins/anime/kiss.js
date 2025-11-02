import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
        let who;
    let mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

    if (mentionedJid) {
        who = mentionedJid;
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    const name2 = m.pushName || 'Anónimo'
  const name = await conn.getName(who) || 'Anónimo'
    m.react('💋');

    let str;
        if (who !== m.sender) {
        str = `💋 *${name2}* le da un beso a *${name}*`;
    } else if (m.quoted) {
        str = `😘 *${name2}* besa suavemente a *${name}*`;
    } else {
        str = `😍 *${name2}* lanza un beso para todos los del grupo 😘`;
    }

    if (m.isGroup) {
        const videos = [
            'https://media.tenor.com/zYIy8qVMi9UAAAPo/kiss.mp4',
            'https://media.tenor.com/cQzRWAWrN6kAAAPo/ichigo-hiro.mp4',
            'https://media.tenor.com/_8oadF3hZwIAAAPo/kiss.mp4',
            'https://media.tenor.com/BZyWzw2d5tAAAAPo/hyakkano-100-girlfriends.mp4',
            'https://media.tenor.com/kmxEaVuW8AoAAAPo/kiss-gentle-kiss.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];
        let mentions = [who];

        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who, m.sender],
            ...global.rcanal  
        }, { quoted: m });
    }
};

handler.help = ['kiss @tag'];
handler.tags = ['anime'];
handler.command = ['kiss', 'beso'];
handler.group = true;

export default handler;