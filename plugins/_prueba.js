// plugins/play.js
import fetch from "node-fetch";
import yts from "yt-search";
import Jimp from "jimp";
import axios from "axios";
import crypto from "crypto";

// --- Función para redimensionar imágenes ---
async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer);
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG);
}

// --- SAVE TUBE SCRAPER ---
const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },

  headers: {
    accept: "/",
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
      return /youtube\.com|youtu\.be/.test(str);
    } catch (_) {
      return false;
    }
  },

  youtube: (url) => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
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
          format: type === "audio" ? "mp3" : "mp4",
          download: downloadData.data.data.downloadUrl
        }
      };
    } catch (error) {
      return { status: false, code: 500, error: error.message };
    }
  }
};

// --- HANDLER PRINCIPAL ---
const handler = async (m, { conn, text, command }) => {
  await m.react("🔎");
  if (!text?.trim())
    return conn.reply(m.chat, `🎧 Dime el nombre de la canción o video que buscas`, m);

  try {
    const search = await yts.search({ query: text, pages: 1 });
    if (!search.videos.length) return m.reply("❌ No se encontró nada con ese nombre.");

    const videoInfo = search.videos[0];
    const { title, thumbnail, url } = videoInfo;

    const thumbFileRes = await conn.getFile(thumbnail);
    const thumbResized = await resizeImage(thumbFileRes.data, 300);

    const fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        orderMessage: {
          itemCount: 1,
          status: 1,
          surface: 1,
          message: `「 ${title} 」`,
          orderTitle: "Descarga",
          thumbnail: thumbResized
        }
      }
    };

    // --- play (audio) ---
    if (command === "play") {
      await m.react("🎧");
      const dl = await savetube.download(url, "audio");
      if (!dl.status) return m.reply(`❌ Error: ${dl.error}`);

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: dl.result.download },
          mimetype: "audio/mpeg",
          fileName: `${dl.result.title}.mp3`,
          ptt: true
        },
        { quoted: fkontak }
      );
    }

    // --- play2 (video) ---  
if (command === "play2") {  
  await m.react("🎬");  
  const dl = await savetube.download(url, "video");  
  if (!dl.status) return m.reply(`❌ Error: ${dl.error}`);  

  // Enviar el JSON completo como string formateado
  const jsonInfo = JSON.stringify(dl, null, 2);  

  await conn.sendMessage(  
    m.chat,  
    { text: "📦 *Información del video (scrapper)*\n\n" + "```json\n" + jsonInfo + "\n```" },  
    { quoted: fkontak }  
  );  
}
  } catch (error) {
    console.error("❌ Error:", error);
    return m.reply(`⚠️ Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["play", "play2"];
handler.tags = ["downloader"];

export default handler;