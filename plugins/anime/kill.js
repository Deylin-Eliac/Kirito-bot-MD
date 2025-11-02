import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    let who;
    let mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (mentionedJid) {
        who = mentionedJid;
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name2 = m.sender.split('@')[0];
    let name = who.split('@')[0];

    m.react('🔪');

    let str;
    if (who !== m.sender) {
        str = `💥 *@${name2}* ha matado a *@${name}*`;
    } else {
        str = `💥 *@${name2}* intenta matarse a sí mismo… ¡pero falla!`;
    }

    if (m.isGroup) {
        const videos = [
            'https://media.tenor.com/aAvEGbU2WK0AAAPo/maria-osawa-canaan.mp4',
            'https://media.tenor.com/6MEVMtk_R6gAAAPo/anime-gir-katana.mp4',
            'https://media.tenor.com/cc1EzfBVr4oAAAPo/yandere-tagged.mp4',
            'https://media.tenor.com/NbBCakbfZnkAAAPo/die-kill.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];

        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who, m.sender]  
        }, { quoted: m });
    }
};

handler.help = ['kill @tag'];
handler.tags = ['anime'];
handler.command = ['kill', 'matar'];
handler.group = true;

export default handler;