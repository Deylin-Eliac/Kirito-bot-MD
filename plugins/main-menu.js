import { xpRange } from '../lib/levelling.js'
import ws from 'ws'

const tagGroups = {
  '⟡ＤＯＷＮＬＯＡＤＥＲ⟡': ['downloader', 'dl', 'descargas'],
  '✦ＡＮＩＭＥ✦': ['anime'],
  '▢ＢＵＳＣＡＤＯＲ▢': ['buscador', 'search'],
  '⌬ＧＡＭＥ⌬': ['game', 'juegos'],
  '⊹ＩＭＡＧＥＮ⊹': ['imagen'],
  '『ＧＲＯＵＰＳ』': ['grupo'],
  '⟦ＨＥＲＲＡＭＩＥＮＴＡＳ⟧': ['herramientas', 'tools'],
  '⋆ＯＮ / ＯＦＦ⋆': ['enable'],
  '☣ＮＳＦＷ☣': ['nsfw'],
  '✦ＯＷＮＥＲ✦': ['owner'],
  '✧ＳＵＢ ＢＯＴＳ✧': ['serbot'],
  '⊶ＳＴＩＣＫＥＲＳ⊷': ['sticker'],
  '⦿ＩＡ⦿': ['ia', 'ai'],
  '⇝ＭＯＴＩＶＡＣＩＯＮＡＬ⇜': ['motivacional'],
  '◈ＩＮＦＯ◈': ['main'],
  '⟡ＴＲＡＮＳＦＯＲＭＡＤＯＲ⟡': ['transformador'],
  '✧ＦＵＮ✧': ['fun']
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let tags = {}
    for (let [decoratedName, aliases] of Object.entries(tagGroups)) {
      aliases.forEach(alias => {
        tags[alias] = decoratedName
      })
    }

    let userId = m.mentionedJid?.[0] || m.sender
    const res1 = await fetch(global.img)
    const img2 = Buffer.from(await res1.arrayBuffer())
    let userjid = m.sender

    // contacto falso
    const fkontak = {
      key: { fromMe: false, participant: userjid },
      message: {
        productMessage: {
          product: {
            productImage: { jpegThumbnail: img2 },
            title: '𝗟𝗜𝗦𝗧𝗔 𝗗𝗘 𝗙𝗨𝗡𝗖𝗜𝗢𝗡𝗘𝗦',
            description: 'Funciones disponibles',
            currencyCode: "USD",
            priceAmount1000: "15000",
            retailerId: "BOT"
          },
          businessOwnerJid: userjid
        }
      }
    }

    if (!global.db.data.users[userId]) {
      global.db.data.users[userId] = { exp: 0, level: 1 }
    }

    let { exp, level } = global.db.data.users[userId]
    let { min, xp, max } = xpRange(level, global.multiplier)

    let user = global.db.data.users[userId]
    let name = conn.getName(userId)
    let mode = global.opts['self'] ? 'Privado' : 'Público'
    let totalCommands = Object.keys(global.plugins).length
    let totalreg = Object.keys(global.db.data.users).length
    let uptime = clockString(process.uptime() * 1000)

    const users = [...new Set(
      (global.conns || []).filter(conn =>
        conn.user && conn.ws?.socket?.readyState !== ws.CLOSED
      )
    )]

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
      help: Array.isArray(plugin.help) ? plugin.help : (plugin.help ? [plugin.help] : []),
      tags: Array.isArray(plugin.tags) ? plugin.tags : (plugin.tags ? [plugin.tags] : []),
      limit: plugin.limit,
      premium: plugin.premium,
    }))

    let menuText = `
╭━〘 ${botname} ☆ 〙━⌬
┃ ✎ Nombre: @${userId.split('@')[0]}
┃ ✎ Tipo: ${(conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Prem Bot 🅑')}
┃ ✎ Modo: ${mode}
┃ ✎ Usuarios: ${totalreg}
┃ ✎ Uptime: ${uptime}
┃ ✎ Comandos: ${totalCommands}
┃ ✎ Sub-Bots: ${users.length}
╰━━━━━━━━━━━━━━━━━━━━━⌬

${emoji} 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒↷↷
${Object.entries(tagGroups).map(([decoratedName, aliases]) => {
      const commandsForTag = help.filter(menu => menu.tags.some(t => aliases.includes(t)))
      if (commandsForTag.length === 0) return ''

      return `╭━━〔 ${decoratedName} ${getRandomEmoji()} 〕━━━⌬
${commandsForTag.map(menu => menu.help.map(help =>
        `┃ ➩ ${_p}${help}${menu.limit ? ' ◜⭐◞' : ''}${menu.premium ? ' ◜🪪◞' : ''}`
      ).join('\n')).join('\n')}
╰━━━━━━━━━━━━━━⌬`
    }).filter(text => text !== '').join('\n')}

⌬⌬➩ © Powered by Deylin - ${botname}
`.trim()

    await m.react('👑')

    await conn.sendMessage(m.chat, {
      text: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        externalAdReply: {
          title: textbot,
          body: dev,
          thumbnailUrl: global.img,
          sourceUrl: redes,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: fkontak })

  } catch (e) {
    conn.reply(m.chat, `❎ Lo sentimos, el menú tiene un error.\n\n${e}`, m)
    console.error(e)
  }
}

handler.help = ['menu', 'allmenu']
handler.tags = ['main']
handler.command = ['menu', 'allmenu', 'menú']
handler.register = true

export default handler

// 🔹 funciones extras
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

function getRandomEmoji() {
  const emojis = ['👑', '🔥', '🌟', '⚡']
  return emojis[Math.floor(Math.random() * emojis.length)]
}