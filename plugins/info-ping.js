import { createCanvas } from '@napi-rs/canvas'
import os from 'os'
import speed from 'performance-now'

 import uploadImage from '../lib/uploadImage.js' 

let handler = async (m, { conn }) => {
  const timestamp = speed()

  const cpu = os.cpus()[0].model
  const cores = os.cpus().length
  const totalMem = os.totalmem() / 1024 / 1024 / 1024
  const freeMem = os.freemem() / 1024 / 1024 / 1024
  const usedMem = totalMem - freeMem
  const uptime = (os.uptime() / 3600).toFixed(1)

  const width = 1000
  const height = 600
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#00111f')
  gradient.addColorStop(1, '#000000')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(0,255,255,0.08)'
  for (let i = -width; i < width * 2; i += 50) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i - height, height)
    ctx.stroke()
  }

  ctx.strokeStyle = '#00ffff'
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = 18
  ctx.lineWidth = 3
  ctx.strokeRect(40, 40, width - 80, height - 80)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#00ffff'
  ctx.font = 'bold 48px Sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SISTEMA ONLINE', width / 2, 100)

  ctx.fillStyle = 'rgba(0,20,40,0.6)'
  ctx.fillRect(60, 150, width - 120, 380)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = '26px Sans-serif'
  
  ctx.fillText('LATENCIA', 80, 190)

  ctx.fillText('CPU', 80, 240)
  ctx.fillStyle = '#00ffff'
  ctx.fillText(cpu, 320, 240)

  ctx.fillStyle = '#ffffff'
  ctx.fillText('NÚCLEOS', 80, 290)
  ctx.fillStyle = '#00ffff'
  ctx.fillText(cores.toString(), 320, 290)

  ctx.fillStyle = '#ffffff'
  ctx.fillText('MEMORIA', 80, 340)
  ctx.fillStyle = '#00ffff'
  ctx.fillText(`${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB`, 320, 340)

  ctx.fillStyle = '#ffffff'
  ctx.fillText('UPTIME', 80, 390)
  ctx.fillStyle = '#00ffff'
  ctx.fillText(`${uptime} hrs`, 320, 390)

  const ramBarWidth = width - 240
  const ramPercent = usedMem / totalMem
  ctx.fillStyle = 'rgba(8,45,51,0.8)'
  ctx.fillRect(80, 420, ramBarWidth, 25)
  ctx.fillStyle = '#00ffff'
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = 12
  ctx.fillRect(80, 420, ramBarWidth * ramPercent, 25)
  ctx.shadowBlur = 0

  const cpuBarWidth = width - 240
  const cpuPercent = Math.min(0.6 + Math.random() * 0.3, 1)
  ctx.fillStyle = 'rgba(8,45,51,0.8)'
  ctx.fillRect(80, 460, cpuBarWidth, 25)
  ctx.fillStyle = '#00ffff'
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = 12
  ctx.fillRect(80, 460, cpuBarWidth * cpuPercent, 25)
  ctx.shadowBlur = 0

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '14px Sans-serif'
  ctx.fillText('Mode Systems Monitoring © 2025', width / 2, height - 40)

  const latensi = speed() - timestamp

  ctx.textAlign = 'left'
  ctx.font = '26px Sans-serif'
  ctx.fillStyle = '#00ffff'
  ctx.fillText(`${latensi.toFixed(2)} ms`, 320, 190) 

  const imageBuffer = await canvas.encode('png')
  
  

  let imageUrl = ''
  try {
      
      
      imageUrl = await uploadImage(imageBuffer) 
  } catch (e) {
      console.error('Error al subir la imagen para la URL del producto:', e)
      imageUrl = 'https://i.imgur.com/vHq1v3Q.png' 
  }


  const caption = `*SISTEMA ONLINE*\n\n` + 
                  `*Latencia:* ${latensi.toFixed(2)} ms\n` +
                  `*CPU:* ${cpu}\n` +
                  `*Núcleos:* ${cores}\n` +
                  `*RAM:* ${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB\n` +
                  `*Uptime:* ${uptime} hrs`

  const productMessage = {
    product: {
      productImage: { url: imageUrl },
      productId: '99999999',
      title: 'Sistema de Monitoreo',
      description: `Tiempo de respuesta: ${latensi.toFixed(2)} ms`,
      currencyCode: 'USD',
      priceAmount1000: '0',
      retailerId: 1677,
      url: `https://wa.me/${conn.user.jid.split('@')[0]}`,
      productImageCount: 1
    },
    businessOwnerJid: conn.user.jid,
    caption: caption,
    title: 'Monitor de Ping y Rendimiento',
    subtitle: '',
    footer: `${caption}\n\nMode Systems Monitoring © 2025`,
    mentions: []
  }

  await conn.sendMessage(m.chat, productMessage, { quoted: m1 })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler
