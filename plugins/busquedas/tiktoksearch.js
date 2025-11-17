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
    const msg = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    );
    msg.message.messageContextInfo = {
      messageAssociation: { associationType: 1, parentMessageKey: album.key },
    };
    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
    await baileys.delay(delay);
  }

  return album;
}

let handler = async (m, { conn, text }) => {
 
  const rwait = '🕒';
  const done = '✅';

  if (!text) return conn.reply(m.chat, `${emoji} Por favor, ingrese lo que desea buscar en TikTok.`, m, rcanal);

  try {
    await m.react(rwait);
    conn.reply(m.chat, `${emoji} Descargando videos, espere un momento...`, m, rcanal);

    const { data: response } = await axios.get(`https://delirius-apiofc.vercel.app/search/tiktoksearch?query=${encodeURIComponent(text)}`);
    let searchResults = response.data;

    if (!searchResults || searchResults.length === 0) {
      return conn.reply(m.chat, `No se encontraron resultados para "${text}".`, m);
    }

    const medias = searchResults.slice(0, 7).map(video => ({
      type: 'video',
      data: { url: video.nowm }
    }));

    const fkontak = {
      key: { fromMe: false, participant: m.sender },
      message: { documentMessage: { title: 'TikTok', fileName: 'TikTok Videos' } }
    };

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `${emoji} Resultados de: ${text}\nCantidad de resultados: ${medias.length}`,
      quoted: fkontak
    });

    await m.react(done);

  } catch (error) {
    console.error(error);
    conn.reply(m.chat, `Error al descargar videos de TikTok.${error.message}`, m);
  }
};

handler.help = ['tiktoksearch <txt>'];
handler.tags = ['buscador'];
handler.command = ['tiktoksearch', 'ttss', 'tiktoks'];
handler.group = true;

export default handler;