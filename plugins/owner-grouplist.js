import fetch from 'node-fetch';

global.listadoGrupos = global.listadoGrupos || [];

const generarFkontak = async () => {
    try {
        const res = await fetch('https://files.catbox.moe/8vxwld.jpg');
        const thumb2 = Buffer.from(await res.arrayBuffer());

        return {
            key: {
                participants: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast',
                fromMe: false,
                id: 'Halo'
            },
            message: {
                locationMessage: {
                    name: '𝗔𝗩𝗜𝗦𝗢 𝗜𝗡𝗣𝗢𝗥𝗧𝗔𝗡𝗧𝗘',
                    jpegThumbnail: thumb2
                }
            },
            participant: '0@s.whatsapp.net'
        };
    } catch (error) {
        console.error('Error al generar fkontak:', error);
        return {}; 
    }
};

let handler = async (m, { conn, args, command }) => {
  if (['listg', 'grouplist'].includes(command)) {
    global.listadoGrupos = [];
  }

  if (['listg', 'grouplist'].includes(command)) {
    let txt = '';
    const groups = Object.values(conn.chats).filter(chat => chat.id.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;

    if (totalGroups === 0) {
      return m.reply('❌ No se encontraron grupos. Asegúrate de que el bot esté en al menos un grupo.');
    }

    for (let i = 0; i < totalGroups; i++) {
      const group = groups[i];
      const jid = group.id;

      let metadata;
      try {
        metadata = await conn.groupMetadata(jid);
      } catch (error) {
        metadata = {};
      }

      const participants = metadata.participants || [];
      const bot = participants.find(u => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot?.admin === 'admin';
      const totalParticipants = participants.length;
      const groupName = metadata.subject || group.name || 'Sin nombre';

      let groupLink = '(No disponible: el bot no es admin)';
      if (isBotAdmin) {
        try {
          groupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(jid)}`;
        } catch (e) {
          groupLink = '(Error al generar el enlace)';
        }
      }

      global.listadoGrupos.push({ jid, nombre: groupName });

      txt += `╔══════ ⊹Grupo #${i + 1}⊹ ══════╗
╠  Nombre: ${groupName}
╠  ID: ${jid}
╠  Admin: ${isBotAdmin ? 'Sí' : 'No'}
╠  Participantes: ${totalParticipants}
╠  Link: ${groupLink}
╚════════════════════╝\n\n`;
    }

    m.reply(`📋 *Lista de grupos del bot*\n\nTotal: ${totalGroups} grupos encontrados.\n\n${txt}`.trim());
  } 
  
  else if (command === 'salirg') {
    const num = parseInt(args[0]);

    if (isNaN(num) || num < 1 || num > global.listadoGrupos.length) {
      return m.reply('❌ Número de grupo inválido. Usa *.listg* para ver la lista y el número de grupo.');
    }

    const { jid, nombre } = global.listadoGrupos[num - 1];

    try {
      const fkontak = await generarFkontak();
      const metadata = await conn.groupMetadata(jid);
      const mencionados = metadata.participants?.map(u => u.id) || [];
      const botname = conn.user.name || 'El bot';

      await conn.sendMessage(jid, {
        text: `👋 Hola a todos, *${botname}* se despide de este grupo.\nGracias por todo. ¡Hasta pronto! ✨`,
        mentions: mencionados
      }, { quoted: fkontak });

      await conn.groupLeave(jid);
      m.reply(`🚪 Salí del grupo *${nombre}* correctamente.`);
    } catch (error) {
      m.reply(`❌ Hubo un error al intentar salir del grupo *${nombre}*.`);
    }
  } 
  
  else if (command === 'aviso') {
    const [numStr, ...mensajeParts] = args.join(' ').split('|');
    const numero = parseInt(numStr.trim());
    const mensaje = mensajeParts.join('|').trim();

    if (isNaN(numero) || numero < 1 || numero > global.listadoGrupos.length || !mensaje) {
      return m.reply(`⚠️ Uso: *.aviso <número> | <mensaje>*\nEjemplo: *.aviso 2 | ¡Hola grupo, les traigo una actualización!*`);
    }

    const { jid, nombre } = global.listadoGrupos[numero - 1];

    try {
      const fkontak = await generarFkontak();
      const metadata = await conn.groupMetadata(jid);
      const mencionados = metadata.participants?.map(u => u.id) || [];
      const botname = conn.user.name || 'El bot';

      const textMessage = `👋 Hola a todos, *${botname}* tiene un aviso para ustedes:\n\n${mensaje}`;

      await conn.sendMessage(jid, {
        text: textMessage,
        mentions: mencionados,
      }, { quoted: fkontak });

      m.reply(`✅ Mensaje enviado a *${nombre}*`);
    } catch (error) {
      m.reply(`❌ Hubo un error al intentar enviar el aviso al grupo *${nombre}*.`);
    }
  }
};

handler.help = ['listg', 'salirg <número>', 'aviso <número> | <mensaje>'];
handler.tags = ['owner'];
handler.command = ['listg', 'salirg', 'aviso', 'grouplist'];
handler.rowner = true;

export default handler;
