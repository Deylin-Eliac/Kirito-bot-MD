import fetch from 'node-fetch'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const UPLOAD_ENDPOINT = `${kirito}/api/upload`

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / (1024 ** i)).toFixed(2)} ${sizes[i]}`
}

async function uploadToKirito(buffer, opts = {}) {
  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = (opts.ext || typeInfo.ext || 'bin').toLowerCase()
  const mime = (opts.mime || typeInfo.mime || 'application/octet-stream').toLowerCase()
  const fileName = opts.name || `${crypto.randomBytes(6).toString('hex')}.${ext}`
  const folder = mime.startsWith('image/') ? 'images' : 'files'
  const base64Data = `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ name: fileName, folder, file: base64Data })
  })

  const contentType = res.headers.get('content-type') || ''
  if (/application\/json/i.test(contentType)) {
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, ...data }
  } else {
    const text = await res.text()
    const urlMatch = text.match(/(https?:\/\/[^\s"']+)|(data:[^\s"']+)/)
    const url = urlMatch ? urlMatch[0] : null
    return { ok: res.ok, url, raw: text }
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? (m.quoted.msg || m.quoted) : m
  const mimeInfo = (q.mimetype || q.mediaType || q.mtype || '').toString().toLowerCase()

  if (!/image|video|audio|sticker|document/.test(mimeInfo)) {
    await conn.reply(m.chat, `${emoji} Responde a una imagen, video o audio para subirlo.`, m, rcanal)
    return
  }

  await m.react('⏳')
  const buffer = await q.download().catch(() => null)
  if (!buffer || !buffer.length) {
    await conn.reply(m.chat, 'No se pudo descargar el archivo. Reenvíalo y prueba de nuevo.', m, rcanal)
    return
  }

  const MAX_BYTES = 20 * 1024 * 1024
  if (buffer.length > MAX_BYTES) {
    await conn.reply(m.chat, `Archivo demasiado grande (${formatBytes(buffer.length)}). Máximo: ${formatBytes(MAX_BYTES)}.`, m, rcanal)
    return
  }

  const typeInfo = await fileTypeFromBuffer(buffer).catch(() => null) || {}
  const ext = (typeInfo.ext || mimeInfo.split('/')[1] || 'bin').toLowerCase()
  const mime = (typeInfo.mime || mimeInfo || 'application/octet-stream').toLowerCase()
  const fileName = `${crypto.randomBytes(6).toString('hex')}.${ext}`

  let result
  try {
    result = await uploadToKirito(buffer, { name: fileName, ext, mime })
  } catch (e) {
    await conn.reply(m.chat, `❌ Error al subir: ${e.message}`, m)
    return
  }

  if (result?.ok) {
    const data = {
      url: result.url || result.link || result.download_url || 'N/A',
      tipo: mime,
      tamaño: formatBytes(buffer.length),
      mensaje: result.mensaje || '',
      status: result.status || 'OK'
    }

    await m.react('👑')

    let txt = `*乂 K I R I T O - U P L O A D 乂*\n\n`
    txt += `*» URL:* ${data.url}\n`
    txt += `*» Tipo:* ${data.tipo}\n`
    txt += `*» Tamaño:* ${data.tamaño}\n`
    if (data.mensaje) txt += `*» Mensaje:* ${data.mensaje}\n\n> *ESPERA \`20\` SEGUNDOS PARA QUE EL ENLACE ESTÉ DISPONIBLE.*`

    await conn.reply(m.chat, txt, m, rcanal)
  } else {
    const status = result?.status ? `${result.status} ${result.statusText || ''}`.trim() : 'desconocido'
    const body = result?.data ? JSON.stringify(result.data).slice(0, 300) : (result?.raw || '').slice(0, 300)
    await conn.reply(m.chat, `❌ Falló la subida (${status}).\n${body}${(body || '').length >= 300 ? '…' : ''}`, m)
  }
}

handler.help = ['kirito <imagen/video>']
handler.tags = ['tools']
handler.command = ['kiritourl', 'tourl3', 'kirito']

export default handler