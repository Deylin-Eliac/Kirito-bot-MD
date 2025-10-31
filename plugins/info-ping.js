import { createCanvas } from '@napi-rs/canvas'
import os from 'os'
import speed from 'performance-now'
import { execSync } from 'child_process'

const progressBar = (percent, bars = 20) => {
    let filled = Math.round((percent / 100) * bars)
    let empty = bars - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
}

let handler = async (m, { conn }) => {
  const timestamp = speed()
  
  const cpus = os.cpus()
  const cpuModel = cpus[0].model
  const cores = cpus.length
  
  let totalLoad = 0
  for (let cpu of cpus) {
    const times = cpu.times
    const load = (times.user + times.nice + times.sys) / (times.user + times.nice + times.sys + times.idle)
    totalLoad += load
  }
  const cpuPercent = ((totalLoad / cores) * 100).toFixed(2)
  
  const totalMem = os.totalmem() / 1024 / 1024 / 1024
  const freeMem = os.freemem() / 1024 / 1024 / 1024
  const usedMem = totalMem - freeMem
  const memPercent = ((usedMem / totalMem) * 100).toFixed(2)

  const uptimeMs = process.uptime() * 1000
  const h = Math.floor(uptimeMs / 3600000)
  const mnt = Math.floor((uptimeMs % 3600000) / 60000)
  const s = Math.floor((uptimeMs % 60000) / 1000)
  const uptimeStr = `${h}h ${mnt}m ${s}s`
  
  let diskUsed = 0, diskTotal = 0
  try {
      const df = execSync('df -BG /').toString().split('\n')[1]
      diskTotal = parseInt(df.split(/\s+/)[1].replace('G',''))
      diskUsed = parseInt(df.split(/\s+/)[2].replace('G',''))
  } catch(e) {
      
  }
  
  const width = 1000
  const height = 600
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const primaryColor = '#00eaff'
  const secondaryColor = '#005f73'
  const backgroundColor = '#050a0e'

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, backgroundColor)
  gradient.addColorStop(1, '#000000')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(0,234,255,0.15)'
  for (let i = -width; i < width * 2; i += 70) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i - height, height)
    ctx.stroke()
  }

  ctx.strokeStyle = primaryColor
  ctx.shadowColor = primaryColor
  ctx.shadowBlur = 20
  ctx.lineWidth = 4
  ctx.strokeRect(30, 30, width - 60, height - 60)
  ctx.shadowBlur = 0

  ctx.fillStyle = primaryColor
  ctx.font = 'bold 52px "Arial Black", Sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SISTEMA ONLINE', width / 2, 100)

  ctx.fillStyle = 'rgba(1,10,20,0.8)'
  ctx.fillRect(50, 140, width - 100, 380)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#f0f0f0'
  ctx.font = '28px Sans-serif'
  
  let y = 190
  const xTitle = 80
  const xValue = 320
  const lineSpacing = 50

  const drawLine = (title, value) => {
    ctx.fillStyle = '#f0f0f0'
    ctx.fillText(title, xTitle, y)
    ctx.fillStyle = primaryColor
    ctx.fillText(value, xValue, y)
    y += lineSpacing
  }

  const latensi = speed() - timestamp

  drawLine('LATENCIA', `${latensi.toFixed(2)} ms`)
  drawLine('CPU', cpuModel)
  drawLine('NÚCLEOS', cores.toString())
  drawLine('MEMORIA', `${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB`)
  drawLine('UPTIME', uptimeStr)
  
  // Barras
  const barY = 440
  const barWidth = width - 240
  const drawBar = (percent, label, color) => {
    const barPercent = parseFloat(percent) / 100
    ctx.fillStyle = secondaryColor
    ctx.fillRect(xTitle, barY + (label === 'CPU' ? 40 : 0), barWidth, 25)
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 15
    ctx.fillRect(xTitle, barY + (label === 'CPU' ? 40 : 0), barWidth * barPercent, 25)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#f0f0f0'
    ctx.font = '22px Sans-serif'
    ctx.fillText(`${label}: ${percent}%`, xTitle + barWidth + 10, barY + (label === 'CPU' ? 60 : 20))
  }
  
  drawBar(memPercent, 'RAM', primaryColor)
  drawBar(cpuPercent, 'CPU', primaryColor)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '18px Sans-serif'
  ctx.fillText('Mode Systems Monitoring © 2025', width / 2, height - 40)

  const imageBuffer = await canvas.encode('png')

  
  const caption = `*SISTEMA ONLINE*\n\n` + 
                  `*Latencia:* ${latensi.toFixed(2)} ms\n` +
                  `*CPU:* ${cpuModel}\n` +
                  `*Núcleos:* ${cores}\n` +
                  `*RAM:* ${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB (${memPercent}%)\n` +
                  `*Disco:* ${diskUsed} GB / ${diskTotal} GB\n` +
                  `*Uptime:* ${uptimeStr}\n\n` +
                  `_Modo de envío: Imagen y Texto Plano (Rápido)_`

  
  await conn.sendMessage(m.chat, { image: imageBuffer, caption: caption, rcanal }, { quoted: m1 }) 
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler
