import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

async function sendAlbumMessage(conn, jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError("jid must be string");
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
        } : {}),
      },
    },
    {}
  );

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i];
    try {
      const img = await baileys.generateWAMessage(
        album.key.remoteJid,
        { [type]: data, ...(i === 0 ? { caption } : {}) },
        { upload: conn.waUploadToServer }
      );
      img.message.messageContextInfo = { messageAssociation: { associationType: 1, parentMessageKey: album.key } };
      await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
      await baileys.delay(delay);
    } catch (err) {
      console.warn(`[WARN MEME] No se pudo enviar la imagen ${i + 1}:`, err.message);
      continue;
    }
  }

  return album;
}

let handler = async (m, { conn }) => {
  try {
    const res = await fetch(`${kirito}/api/meme?apikey=by_deylin`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.memes || !Array.isArray(json.memes)) throw new Error('No se encontraron memes');

    const maxMemes = Math.min(json.memes.length, 10);
    const medias = [];

    for (let i = 0; i < maxMemes; i++) {
      medias.push({ type: 'image', data: { url: json.memes[i] } });
    }

    const fkontak = {
      key: { fromMe: false, participant: m.sender },
      message: {
        documentMessage: {
          title: "Memes Aleatorios",
          fileName: `𝗠𝗘𝗠𝗘𝗦_𝗗𝗘_𝗞𝗜𝗥𝗜𝗧𝗢`,
        }
      }
    };

    await sendAlbumMessage(conn, m.chat, medias, {
      caption: `${emoji} Aquí tienes tus memes aleatorios 😄`,
      quoted: fkontak
    });

  } catch (e) {
    console.error('[ERROR MEMES]', e);
    m.reply(`😿 Ocurrió un error al obtener los memes.\n\n${e.message}\n\n> Usa el comando #report para reportar este error.`);
  }
};

handler.help = ['memes'];
handler.tags = ['fun'];
handler.command = ['meme', 'memes'];

export default handler;