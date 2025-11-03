import fetch from "node-fetch";
import yts from "yt-search";
import Jimp from "jimp";
import axios from "axios";
import crypto from "crypto";

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer);
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG);
}

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },
  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": "Postify/1.0.0"
  },
  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g);
      return Buffer.from(matches.join(""), "hex");
    },
    decrypt: async (enc) => {
      const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12";
      const data = Buffer.from(enc, "base64");
      const iv = data.slice(0, 16);
      const content = data.slice(16);
      const key = savetube.crypto.hexToBuffer(secretKey);
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
      let decrypted = decipher.update(content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return JSON.parse(decrypted.toString());
    },
  },
  isUrl: (str) => {
    try {
      new URL(str);
      return /youtube.com|youtu.be/.test(str);
    } catch (_) {
      return false;
    }
  },
  youtube: (url) => {
    const patterns = [
      /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtu.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let pattern of patterns) {
      if (pattern.test(url)) return url.match(pattern)[1];
    }
    return null;
  },
  request: async (endpoint, data = {}, method = "post") => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, code: 200, data: response };
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message };
    }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, "get");
    if (!response.status) return response;
    return { status: true, code: 200, data: response.data.cdn };
  },
  download: async (link, type = "audio") => {
    if (!savetube.isUrl(link)) return { status: false, code: 400, error: "URL inválida" };
    const id = savetube.youtube(link);
    if (!id) return { status: false, code: 400, error: "No se pudo obtener ID del video" };
    try {
      const cdnx = await savetube.getCDN();
      if (!cdnx.status) return cdnx;
      const cdn = cdnx.data;
      const videoInfo = await savetube.request(
        `https://${cdn}${savetube.api.info}`,
        { url: `https://www.youtube.com/watch?v=${id}` }
      );
      if (!videoInfo.status) return videoInfo;
      const decrypted = await savetube.crypto.decrypt(videoInfo.data.data);
      const downloadData = await savetube.request(
        `https://${cdn}${savetube.api.download}`,
        {
          id,
          downloadType: type === "audio" ? "audio" : "video",
          quality: type === "audio" ? "mp3" : "720p",
          key: decrypted.key
        }
      );
      if (!downloadData.data.data || !downloadData.data.data.downloadUrl)
        return { status: false, code: 500, error: "No se pudo obtener link de descarga" };
      return {
        status: true,
        code: 200,
        result: {
          title: decrypted.title || "Desconocido",
          author: decrypted.channel || "Desconocido",
          views: decrypted.viewCount || "Desconocido",
          timestamp: decrypted.lengthSeconds || "0",
          ago: decrypted.uploadedAt || "Desconocido",
          format: type === "audio" ? "mp3" : "mp4",
          download: downloadData.data.data.downloadUrl,
          thumbnail: decrypted.thumbnail || null
        }
      };
    } catch (error) {
      return { status: false, code: 500, error: error.message };
    }
  }
};

const handler = async (m, { conn, text, command }) => {
  await m.react("🔎");
  if (!text?.trim()) {
    return conn.reply(m.chat, "🎧 Dame el link de YouTube o el nombre de la canción/video", m);
  }

  try {
    let url, title, thumbnail, author, vistas, timestamp, ago;

    if (savetube.isUrl(text)) {
      const id = savetube.youtube(text);
      const search = await yts({ videoId: id });
      url = text;
      title = search.title || "Desconocido";
      thumbnail = search.thumbnail;
      author = search.author;
      vistas = search.views?.toLocaleString?.() || "Desconocido";
      timestamp = search.timestamp;
      ago = search.ago;
    } else {
      const search = await yts.search({ query: text, pages: 1 });
      if (!search.videos.length) return m.reply("❌ No se encontró nada con ese nombre.");
      const videoInfo = search.videos[0];
      url = videoInfo.url;
      title = videoInfo.title;
      thumbnail = videoInfo.thumbnail;
      author = videoInfo.author;
      vistas = videoInfo.views?.toLocaleString?.() || "Desconocido";
      timestamp = videoInfo.timestamp;
      ago = videoInfo.ago;
    }

    const thumbResized = await resizeImage(await (await fetch(thumbnail)).buffer(), 300);

    const res3 = await fetch("https://files.catbox.moe/wfd0ze.jpg");
    const thumb3 = Buffer.from(await res3.arrayBuffer());

    const fkontak2 = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: "𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗡𝗗𝗢",
          fileName: global.botname || "Bot",
          jpegThumbnail: thumb3
        }
      }
    };

        

    const fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: `「 ${title} 」`,
          fileName: botname,
          jpegThumbnail: thumb3
        }
      }
    }

    const infoMessage = `★ ${global.botname || 'Bot'} ★

  ┏☾ *Título:* 「 ${title} 」
┏┛ *Canal:* ${author?.name || 'Desconocido'}
┃✎ *Vistas:* ${vistas}
┃✎ *Duración:* ${timestamp}
┃✎ *Publicado:* ${ago}
┃
┗⌼ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ...`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: thumbnail },
        caption: infoMessage,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            newsletterName: channelRD.name,
            serverMessageId: -1
          }
        }
      },
      { quoted: fkontak2 }
    );

    if (["mp3", "play"].includes(command)) {
      await m.react("🎧");
      const dl = await savetube.download(url, "audio");
      if (!dl.status) return m.reply(`❌ Error: ${dl.error}`);
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: dl.result.download },
          mimetype: "audio/mpeg",
          fileName: `${dl.result.title}.mp3`
         // ptt: true
        },
        { quoted: fkontak }
      );*/
await conn.sendMessage(
  m.chat,
  {
    video: { url: dl.result.download }, 
    fileName: `${dl.result.title}.mp4`,
    mimetype: "video/mp4",
    caption: `🎬 ${dl.result.title}`
  },
  { quoted: fkontak }
);
    }

    if (["mp4", "play2"].includes(command)) {
      await m.react("🎬");
      const dl = await savetube.download(url, "video");
      if (!dl.status) return m.reply(`❌ Error: ${dl.error}`);
     /* const response = await fetch(dl.result.download);
      const buffer = await response.buffer();
      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          fileName: `${dl.result.title}.mp4`,
          mimetype: "video/mp4",
          caption: `🎬 ${dl.result.title}`
        },
        { quoted: fkontak }
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return m.reply(`⚠️ Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["mp3", "mp4", "play", "play2"];
handler.tags = ["downloader"];

export default handler;