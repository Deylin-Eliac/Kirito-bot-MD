// editado y optimizado por 
// https://github.com/deylin-eliac

/*import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";
import Jimp from "jimp";

const FORMAT_AUDIO = ["mp3", "m4a", "webm", "acc", "flac", "opus", "ogg", "wav"];
const FORMAT_VIDEO = ["360", "480", "720", "1080", "1440", "4k"];

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer);
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG);
}

const ddownr = {
  download: async (url, format) => {
    if (!FORMAT_AUDIO.includes(format) && !FORMAT_VIDEO.includes(format)) {
      throw new Error("⚠️ Ese formato no es compatible.");
    }

    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000
    };

    const response = await axios.request(config).catch(() => null);
    if (!response?.data?.success) {
      const apiMsg = response?.data?.msg || response?.data?.error || "Error desconocido";
      throw new Error(`⛔ Error API: ${apiMsg}`);
    }

    const { id, title, info } = response.data;
    const downloadUrl = await ddownr.cekProgress(id);
    return { title, image: info.image, downloadUrl };
  },

  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000
    };

    let retries = 0;
    while (retries < 8) { // Máx. 8 intentos (~40s)
      const response = await axios.request(config).catch(() => null);
      if (response?.data?.success && response.data.progress === 1000) {
        return response.data.download_url;
      }
      retries++;
      await new Promise(res => setTimeout(res, 5000));
    }
    throw new Error("⏳ Tiempo de espera agotado para obtener enlace de descarga.");
  }
};

const handler = async (m, { conn, text, command }) => {
  await m.react('⚡️');

  if (!text?.trim()) {
    return conn.reply(m.chat, `⚠️ Dime el nombre de la canción o video que buscas`, m, rcanal);
  }

  try {
    const search = await yts.search({ query: text, pages: 1 });
    if (!search.videos.length) return m.reply("❌ No se encontró nada con ese nombre.");

    const videoInfo = search.videos[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;

    const [thumbFileRes, thumb2Res] = await Promise.all([
      conn.getFile(thumbnail),
      fetch('https://files.catbox.moe/f8qrut.png')
    ]);

    const thumb = thumbFileRes.data;
    const thumbResized = await resizeImage(thumb, 300); 
    const thumb2 = Buffer.from(await thumb2Res.arrayBuffer());

const res3 = await fetch('https://files.catbox.moe/wfd0ze.jpg');
const thumb3 = Buffer.from(await res3.arrayBuffer());

const fkontak2 = {
    key: { fromMe: false, participant: "0@s.whatsapp.net" },
    message: {
        documentMessage: {
            title: "𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗡𝗗𝗢",
            fileName: botname,
            jpegThumbnail: thumb3
        }
    }
}

    
    const fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        orderMessage: {
          itemCount: 1,
          status: 1,
          surface: 1,
          message: `「 ${title} 」`,
          orderTitle: "Mejor Bot",
          thumbnail: thumbResized 
        }
      }
    };

    const vistas = formatViews(views);

    const infoMessage = `★ ${global.botname || 'Bot'} ★

  ┏☾ *Titulo:* 「 ${title} 」 
┏┛  *Canal:* ${author?.name || 'Desconocido'} 
┃✎ *Vistas:* ${vistas} 
┃✎ *Duración:* ${timestamp}
┃✎ *Publicado:* ${ago}
┃
┗⌼ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ...`;

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
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

    // Audio
    if (["play"].includes(command)) {
      const api = await ddownr.download(url, "mp3");
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: api.downloadUrl },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          ptt: true
        },
        { quoted: fkontak }
      );
    }

    // Video
    if (["play2"].includes(command)) {
      try {
        const apiURL = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=sylphy-fbb9`;
        const res = await fetch(apiURL);
        const json = await res.json();

        if (!json?.status || !json.res?.url) {
          return m.reply("❌ No se pudo descargar el video desde Sylphy.");
        }

        await conn.sendMessage(
          m.chat,
          {
            video: { url: json.res.url },
            fileName: `${json.res.title || title}.mp4`,
            mimetype: "video/mp4",
            thumbnail: thumb
          },
          { quoted: fkontak }
        );

      } catch (err) {
        console.error("❌ Error en play2:", err.message);
        return m.reply(`⚠️ Ocurrió un error: ${err.message}`);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error);
    return m.reply(`⚠️ Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["play", "play2"];
handler.tags = ["downloader"];

export default handler;

function formatViews(views) {
  if (typeof views !== "number" || isNaN(views)) return "Desconocido";
  return views >= 1000
    ? (views / 1000).toFixed(1) + "k (" + views.toLocaleString() + ")"
    : views.toString();
}
*/

// editado y optimizado por 
// https://github.com/deylin-eliac

/*import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";
import Jimp from "jimp";

const FORMAT_VIDEO = ["360", "480", "720", "1080", "1440", "4k"];

async function resizeImage(buffer, size = 300) {
  const image = await Jimp.read(buffer);
  return image.resize(size, size).getBufferAsync(Jimp.MIME_JPEG);
}

const handler = async (m, { conn, text, command }) => {
  await m.react('🔎');
await m.react('🔍');
await m.react('🌟');

  if (!text?.trim()) {
    return conn.reply(m.chat, `${emoji} Dime el nombre de la canción o video que buscas`, m, rcanal);
  }

  try {
    const search = await yts.search({ query: text, pages: 1 });
    if (!search.videos.length) return m.reply("❌ No se encontró nada con ese nombre.");

    const videoInfo = search.videos[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;

    const [thumbFileRes, thumb2Res] = await Promise.all([
      conn.getFile(thumbnail),
      fetch('https://files.catbox.moe/f8qrut.png')
    ]);

    const thumb = thumbFileRes.data;
    const thumbResized = await resizeImage(thumb, 300); 
    const thumb2 = Buffer.from(await thumb2Res.arrayBuffer());

    const res3 = await fetch('https://files.catbox.moe/wfd0ze.jpg');
    const thumb3 = Buffer.from(await res3.arrayBuffer());

    const fkontak2 = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        documentMessage: {
          title: "𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗡𝗗𝗢",
          fileName: botname,
          jpegThumbnail: thumb3
        }
      }
    }

    const fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net" },
      message: {
        orderMessage: {
          itemCount: 1,
          status: 1,
          surface: 1,
          message: `「 ${title} 」`,
          orderTitle: "Mejor Bot",
          thumbnail: thumbResized 
        }
      }
    };

    const vistas = formatViews(views);

    const infoMessage = `★ ${global.botname || 'Bot'} ★

  ┏☾ *Titulo:* 「 ${title} 」 
┏┛  *Canal:* ${author?.name || 'Desconocido'} 
┃✎ *Vistas:* ${vistas} 
┃✎ *Duración:* ${timestamp}
┃✎ *Publicado:* ${ago}
┃
┗⌼ ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ...`;

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
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

    if (["play"].includes(command)) {
      try {
        const apiURL = `https://api.sylphy.xyz/download/ytmp3?apikey=sylphy_2962&url=${encodeURIComponent(url)}`;
        const res = await fetch(apiURL);
        const json = await res.json();

        if (!json?.status || !json.res?.url) {
          return m.reply("❌ No se pudo descargar el audio desde Sylphy.");
        }
await m.react('🎧');

        await conn.sendMessage(
          m.chat,
          {
            audio: { url: json.res.url },
            mimetype: "audio/mpeg",
            fileName: `${json.res.title || title}.mp3`,
            ptt: true
          },
          { quoted: fkontak }
        );

      } catch (err) {
        console.error("❌ Error en play:", err.message);
        return m.reply(`⚠️ Ocurrió un error: ${err.message}`);
      }
    }

    if (["play2"].includes(command)) {
      try {
        const apiURL = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=sylphy-fbb9`;
        const res = await fetch(apiURL);
        const json = await res.json();

        if (!json?.status || !json.res?.url) {
          return m.reply("❌ No se pudo descargar el video desde Sylphy.");
        }
await m.react('📽️');
        await conn.sendMessage(
          m.chat,
          {
            video: { url: json.res.url },
            fileName: `${json.res.title || title}.mp4`,
            mimetype: "video/mp4",
            thumbnail: thumb
          },
          { quoted: fkontak }
        );

      } catch (err) {
        console.error("❌ Error en play2:", err.message);
        return m.reply(`⚠️ Ocurrió un error: ${err.message}`);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error);
    return m.reply(`⚠️ Ocurrió un error: ${error.message}`);
  }
};

handler.command = handler.help = ["play", "play2"];
handler.tags = ["downloader"];

export default handler;

function formatViews(views) {
  if (typeof views !== "number" || isNaN(views)) return "Desconocido";
  return views >= 1000
    ? (views / 1000).toFixed(1) + "k (" + views.toLocaleString() + ")"
    : views.toString();
}*/


import { exec } from "child_process";
import path from "path";
import fs from "fs";
import yts from "yt-search";

const ytDlpPath = path.join(process.cwd(), "yt-dlp"); // ruta al binario
const formatAudio = ["mp3","m4a","aac","opus","flac","ogg","wav"];
const formatVideo = ["360","480","720","1080","1440","2160","4k"];

function runYtDlp(url, format) {
  return new Promise((resolve, reject) => {
    const output = path.join("/tmp", "%(title)s.%(ext)s");
    let cmd = `${ytDlpPath} -f best --no-playlist "${url}" -o "${output}"`;

    if (formatAudio.includes(format)) {
      cmd = `${ytDlpPath} -f bestaudio --extract-audio --audio-format ${format} "${url}" -o "${output}"`;
    } else if (formatVideo.includes(format)) {
      cmd = `${ytDlpPath} -f "bestvideo[height<=${format}]+bestaudio/best" "${url}" -o "${output}"`;
    } else {
      return reject(new Error("⚠ Formato no soportado."));
    }

    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      // Buscar archivo descargado en /tmp
      const files = fs.readdirSync("/tmp").map(f => path.join("/tmp", f));
      const latest = files.map(f => ({ f, t: fs.statSync(f).mtime })).sort((a,b)=>b.t-a.t)[0];
      if (latest) resolve(latest.f);
      else reject(new Error("No se encontró el archivo descargado."));
    });
  });
}

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) return m.reply("🎧 Ingresa el nombre de la canción o video.");

    const search = await yts(text);
    if (!search.all.length) return m.reply("⚠ No se encontraron resultados.");

    const video = search.all[0];
    const { title, url, timestamp } = video;
    const tipo = ["play2","ytv","ytmp4"].includes(command) ? "ᴠɪᴅᴇᴏ 🎞" : "ᴀᴜᴅɪᴏ ♫";
    const emoji = tipo.includes("ᴠɪᴅᴇᴏ") ? "📹" : "🎧";

    await m.react(emoji);
    await conn.reply(m.chat, `*${tipo}*\nTítulo: ${title}\nDuración: ${timestamp}\nEnlace: ${url}`, m);

    let format = ["play","yta","ytmp3"].includes(command) ? "mp3" : "720";
    const filePath = await runYtDlp(url, format);

    if (formatAudio.includes(format)) {
      await conn.sendMessage(m.chat, {
        audio: { url: "file://" + filePath },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: "file://" + filePath },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `📥 Aquí tienes tu video descargado: ${title}`
      }, { quoted: m });
    }

  } catch (err) {
    console.error(err);
    m.reply(`⚠ Ocurrió un error:\n${err.message}`);
  }
};

handler.command = handler.help = ["play","play2","yta","ytmp3","ytv","ytmp4"];
handler.tags = ["downloader"];
handler.coin = 5;

export default handler;