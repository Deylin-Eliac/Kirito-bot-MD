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
            'https://files.catbox.moe/q4nhsa.mp4',
            'https://files.catbox.moe/urvbpr.mp4'
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