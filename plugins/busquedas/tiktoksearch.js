import axios from 'axios';
import baileys from '@whiskeysockets/baileys';
const { proto } = (await import("@whiskeysockets/baileys")).default;

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (medias.length < 2) throw new RangeError("Minimum 2 media");

  const caption = options.text || options.caption || "";
  const delay = !isNaN(options.delay) ? options.delay : 500;
  delete options.text;
  delete options.caption;
  delete options.delay;


  const album = baileys.generateWAMessageFromContent(
    jid,
    {
      messageContextInfo: {},
      albumMessage: {
        expectedImageCount: medias.filter(m => m.type === "image").length,
        expectedVideoCount: medias.filter(m => m.type === "video").length,
        ...(options.quoted ? {
          contextInfo: {
            remoteJid: options.quoted.key.remoteJid,
            fromMe: options.quoted.key.fromMe,
            stanzaId: options.quoted.key.id,
            participant: options.quoted.key.participant || options.quoted.key.remoteJid,
            quotedMessage: options.quoted.message,
          },
        } : {})
      }
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });


  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    const media_url = typeof data.url === 'string' ? data.url : null;
    
    if (media_url) {
      const msg = await baileys.generateWAMessage(
        album.key.remoteJid,
        { 
          [type]: { url: media_url }, 
          ...(i === 0 ? { caption } : {}) 
        },
        { upload: conn.waUploadToServer }
      );
      
      msg.message.messageContextInfo = {
        messageAssociation: { associationType: 1, parentMessageKey: album.key },
      };
      
      await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
      await baileys.delay(delay);
    }
  }

  return album;
}

const emoji = '🎥';
const rcanal = {}; 

let handler = async (m, { conn, text }) => {

  const rwait = '🕒';
  const done = '✅';
  const fkontak = {
      key: { fromMe: false, participant: m.sender },
      message: { documentMessage: { title: 'TikTok', fileName: 'TikTok Videos' } }
  };

  if (!text) return conn.reply(m.chat, `${emoji} Por favor, ingrese lo que desea buscar en TikTok.`, m, rcanal);

  try {
    await m.react(rwait);
    conn.reply(m.chat, `${emoji} Buscando videos en TikTok... espere un momento.`, m, rcanal);

    const apiUrl = `https://delirius-apiofc.vercel.app/search/tiktoksearch?query=${encodeURIComponent(text)}`;
    const { data: response } = await axios.get(apiUrl);
    
    const searchResults = response.meta;

    if (!searchResults || searchResults.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m);
    }

    const medias = searchResults.slice(0, 7).map(video => ({
      type: 'video',
      data: { url: video.hd }
    })).filter(media => media.data.url);

    if (medias.length === 0) {
        await m.react('❌');
        return conn.reply(m.chat, `La búsqueda fue exitosa, pero ninguna de las URLs de video encontradas era válida.`, m);
    }

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `${emoji} Resultados de TikTok para: **${text}**\n\nSe enviarán ${medias.length} videos.`,
      quoted: fkontak
    });

    await m.react(done);

  } catch (error) {
    console.error("Error en tiktoksearch:", error);
    await m.react('❌');
    conn.reply(m.chat, `Hubo un error al intentar buscar o descargar los videos de TikTok. Por favor, inténtelo de nuevo más tarde.\n\nDetalles del error: ${error.message}`, m);
  }
};

handler.help = ['tiktoksearch <txt>'];
handler.tags = ['buscador'];
handler.command = ['tiktoksearch', 'ttss', 'tiktoks'];
handler.group = true;

export default handler;