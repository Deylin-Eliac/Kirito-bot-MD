import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `${emoji} ¡Hola! ¿cómo puedo ayudarte hoy?`, m, rcanal);
  }
    await m.react('✨')
    const res = await fetch('https://files.catbox.moe/j65sl7.jpg');
    const thumb2 = Buffer.from(await res.arrayBuffer());

    const fkontak = {
      key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
      message: {
        locationMessage: {
          name: `𝗖𝗛𝗔𝗧𝗚𝗣𝗧 𝗙𝗥𝗢𝗠 𝗢𝗣𝗘𝗡𝗔𝗜`,
          jpegThumbnail: thumb2
        }
      },
      participant: "0@s.whatsapp.net"
    };

  try {
    const url = `${kirito}/api/chatgpt?q=${encodeURIComponent(text)}&apikey=by_deylin`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.response) {
      return conn.reply(m.chat, "❌ No recibí respuesta de la IA, intenta de nuevo.", m, fake);
    }
    await m.react('🌟')
    await conn.reply(m.chat, `${data.response}`, fkontak, rcanal);
  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, "⚠️ Hubo un error al conectar con la IA.", m, fake);
  }
};

handler.tags = ["ai"];
handler.command = handler.help =['gpt', 'chatgpt']

export default handler;