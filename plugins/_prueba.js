import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mensajesUsados = []

let handler = async (m, { conn }) => {
  try {
    const mensajesPath = path.join(__dirname, '../src/database/motivacion.json')
    const rawData = fs.readFileSync(mensajesPath, 'utf-8')
    const data = JSON.parse(rawData)
    const mensajes = data.mensajes

    if (mensajesUsados.length >= mensajes.length) {
      mensajesUsados = []
    }

    const mensajesDisponibles = mensajes.filter(m => !mensajesUsados.includes(m))
    const mensaje = mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)]

    mensajesUsados.push(mensaje)

    await conn.sendMessage(m.chat, {
      text: `🌟 *Mensaje para ti:*\n\n"${mensaje}"`,
      footer: 'Toca el botón para otro consejo',
const buttons = [
    {
      buttonId: '.p',
      buttonText: { displayText: '1' },
      type: 1,
    }
   ],
   headerType: 1
    }, { quoted: m })

  } catch (e) {
    await conn.reply(m.chat, '⚠️ Ocurrió un error al leer los mensajes.', m)
    console.error(e)
  }
}

handler.command = ['1']


export default handler