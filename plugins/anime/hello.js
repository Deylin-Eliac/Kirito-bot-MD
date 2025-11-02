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
    m.react('👋');

    let str;
        if (who !== m.sender) {

        str = `👋 *${name2}* saluda a ${name}, ¿cómo están?`;
    } else {
        str = `👋 *${name2}* saluda a todos los integrantes del grupo.\n\n¿Cómo se encuentran hoy?`;
    }

    if (m.isGroup) {
        const videos = [
            'https://media.tenor.com/KM3VNP5d1FIAAAPo/miku-hello.mp4',
            'https://media.tenor.com/3jl3emrg-H0AAAPo/hello.mp4',
            'https://media.tenor.com/xsICn9T81LcAAAPo/roy-leops.mp4',
            'https://media.tenor.com/lOKpSMnYE5YAAAPo/hi-anime.mp4',
            'https://media.tenor.com/DuMR7QLYBTYAAAPo/pjsk-pjsk-anime.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who, m.sender],
            ...global.rcanal 
        }, { quoted: m });
    }
};

handler.help = ['hello @tag', 'hola @tag'];
handler.tags = ['anime'];
handler.command = ['hello', 'hola'];
handler.group = true;

export default handler;