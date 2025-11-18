Let handler = async (m, { conn, args, text }) => {
    let who;

    if (m.quoted) {
        who = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } else if (text) {
        let cleanedText = text.replace(/[^0-9]/g, '');
        if (cleanedText.length >= 8) {
            who = cleanedText + '@s.whatsapp.net';
        }
    }
    
    if (!who) {
        who = m.fromMe ? conn.user.jid : m.sender;
    }

    try {
        let name = await conn.getName(who);
        let pp;
        try {
            pp = await conn.profilePictureUrl(who, 'image');
        } catch {
            pp = 'https://files.catbox.moe/9y329o.jpg';
        }
        
        await conn.sendFile(m.chat, pp, 'profile.jpg', `*Foto de perfil de: »* ${name}`, m);
    } catch (e) {
        await m.reply('❌ No se pudo obtener la foto de perfil.');
    }
};

handler.help = ['pfp @user', 'pfp +numero'];
handler.tags = ['sticker'];
handler.command = ['pfp', 'getpic'];

export default handler;
