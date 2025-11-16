// © Deylin

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `✎ Por favor escribe tu sugerencia.\n\nEjemplo:\n${usedPrefix + command} bienvenido automática`, m, rcanal);
  }

  if (text.length < 5) {
    return conn.reply(m.chat, `✎ La sugerencia es muy corta. Agrega más detalles.`, m, rcanal);
  }


  await conn.reply(m.chat, `${emoji} *Tu sugerencia se ha enviado al staff.*\nRecibirás una notificación cuando sea revisada.`, m, rcanal);

  let teks = `*👑 NUEVA SUGERENCIA 👑*\n\n✎ *Contenido:*\n• ${text}\n\n✎ *Usuario:*\n• ${m.pushName || 'Anónimo'}\n• Número: wa.me/${m.sender.split('@')[0]}\n\n_Para aprobar o rechazar la sugerencia, el staff debe responder a este mensaje con .aceptar o .noaceptar seguido de una razón (opcional)._`;

  let ownerJid = '50432955554@s.whatsapp.net';
  let staffGroup = '120363420911001779@g.us';

  await conn.sendMessage(ownerJid, { text: teks, mentions: [m.sender] });
  await conn.sendMessage(staffGroup, { text: teks, mentions: [m.sender] });

  
};

handler.help = ['sugerir'];
handler.tags = ['main'];
handler.command = ['sugerir', 'suggest'];

export default handler;