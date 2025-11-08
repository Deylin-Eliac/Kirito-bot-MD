import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { spawn, exec } = await import('child_process')
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
import * as baileys from "@whiskeysockets/baileys" 

let subBotHandlerModule = await import('../sub-handler.js').catch(e => console.error('Error al cargar sub-handler inicial:', e))
let subBotHandlerFunction = subBotHandlerModule?.subBotHandler || (() => {})

const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    fetchLatestBaileysVersion, 
    generateWAMessageFromContent, 
    proto 
} = baileys; 

const logger = pino({ level: "fatal" }) 
const { CONNECTING } = ws

let m1 = '⌬';
let m2 = '✎';
let m3 = '♛';
let emoji1 = [m1, m2, m3];
let emoji = emoji1[Math.floor(Math.random() * emoji1.length)];
let botname = global.botname
let dev = global.dev
let jadi = global.jadi
let rtx = `
*${emoji}「 ${botname} 」${emoji}*

🛰️ 〢 Ｍｏｄｏ ＱＲ ▣ ＳｕｂＢｏｔ ⌬ Ｐｅｒｓｉｓｔｅｎｔｅ

⟢ 1 » ⋮ ︱Ｄｉｓｐｏｓｉｔｉｖｏｓ 𝘃𝗶𝗻𝗰𝘂𝗹𝗮𝗱𝗼𝘀  
⟢ 2 » Ｅｓｃａｎｅａ ｅｌ Ⓠⓡ
*
⚠️ Ｓｅ ａｕｔｏｄｅｓｔｒｕｉｒá ｅｎ *60s* ⏳

> 🔗 𝐂𝐚𝐧𝐚𝐥 𝐎𝐟𝐢𝐜𝐢a𝐥 ↓
`;

let rtx2 = `
*${emoji}「 ${botname} 」${emoji}*

💻 〢 Ｍｏｄｏ Ｃｏ́ｄｉｇｏ ▣ ＳｕｂＢｏｔ ⌬ Ｐｅｒｓｉｓｔｅｎｔｅ

⟢ ⋮ → Ｄｉｓｐｏｓｉｔｉｖｏｓ 𝘃𝗶𝗻𝗰𝘂𝗹𝗮𝗱𝗼𝘀  
⟢ → Ｖｉｎｃｕｌａｒ ｃｏｎ 𝗻𝘂́𝗺𝗲𝗿𝗼  
⟢ → Ｉｎｇ𝗿ｅｓａ 𝗲𝗹 𝗰𝗼́𝗱𝗶𝗴𝗼

⚠️ Ｃｏ́ｄｉｇｏ 𝗲𝘅𝗽ｉｒ𝗮 ｅｎ *60s* ⏳

> Ｃｏ́ｄｉｇｏ ↓
`;

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"

const res = await fetch('https://i.postimg.cc/vHqc5x17/1756169140993.jpg'); 
const thumb2 = Buffer.from(await res.arrayBuffer());
const fkontak = {
    key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo"
    },
    message: {
        locationMessage: {
            name: `𝗦𝗨𝗕𝗕𝗢𝗧 𝗠𝗢𝗗𝗘 𝗖𝗢𝗗𝗘 ✦ 8\n ${botname}`,
            jpegThumbnail: thumb2
        }
    },
    participant: "0@s.whatsapp.net"
};



const res1 = await fetch('https://i.postimg.cc/vHqc5x17/1756169140993.jpg');
const thumb3 = Buffer.from(await res1.arrayBuffer());

const fkontak1 = {
  key: { fromMe: false, participant: "0@s.whatsapp.net" },
  message: {
    orderMessage: {
      itemCount: 1,
      status: 1,
      surface: 1,
      message: `𝗖𝗢𝗡𝗘𝗖𝗧𝗔𝗗𝗢 𝗖𝗢𝗡 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣`,
      orderTitle: "Mejor Bot",
      jpegThumbnail: thumb3
    }
  }
};

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const JBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
const msgRetryCache = new NodeCache()

let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`${emoji} Comando desactivado temporalmente.`)

const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
const MAX_SUBBOTS = 30 
if (subBotsCount >= MAX_SUBBOTS) {
return conn.reply(m.chat, `${emoji} No se han encontrado espacios para subbots disponibles. Espera a que un subbot se desconecte e intenta más tarde.`, m)
}

let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathJadiBot = path.join(`./${jadi}/`, id)

if (!fs.existsSync(pathJadiBot)){
fs.mkdirSync(pathJadiBot, { recursive: true })
}

JBOptions.pathJadiBot = pathJadiBot
JBOptions.m = m
JBOptions.conn = conn
JBOptions.args = args
JBOptions.usedPrefix = usedPrefix
JBOptions.command = command
JBOptions.fromCommand = true
JadiBot(JBOptions)
} 
handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function JadiBot(options) {
let { pathJadiBot, m, conn, args, usedPrefix, command } = options

if (command === 'code') {
command = 'qr'; 
args.unshift('code')}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR

if (mcode) {
args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1]?.replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}

const pathCreds = path.join(pathJadiBot, "creds.json")

if (args[0]) {
    try {
        const credsData = Buffer.from(args[0], "base64").toString("utf-8")
        fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(credsData), null, '\t'))
    } catch (e) {
        conn.reply(m.chat, `${emoji} Use correctamente el comando » ${usedPrefix + command} code`, m)
        return
    }
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {

let { version } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathJadiBot)

const connectionOptions = {
    logger: logger,
    printQRInTerminal: false,
    auth: { 
        creds: state.creds, 
        keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
    },
    msgRetry,
    msgRetryCache,
    browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : [`${botname} (Sub Bot)`, 'Chrome','2.0.0'],
    version: version,
    generateHighQualityLinkPreview: true,
    defaultQueryTimeoutMs: undefined,
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true
let qrSent = false 

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update

    if (isNewLogin) sock.isInit = false

    if (qr && !mcode && !qrSent) { 
        if (m?.chat) {
            txtQR = await conn.sendMessage(m.chat, {
                image: await qrcode.toBuffer(qr, { scale: 8 }),
                caption: rtx.trim(),
                ...global.fake,
            }, { quoted: m })
        } else {
            return 
        }
        if (txtQR && txtQR.key) {
            setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 60000) 
        }
        qrSent = true 
        return
    } 

    if (qr && mcode && !qrSent) { 
        let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
        secret = secret.match(/.{1,4}/g)?.join("-")

       /* txtCode = await conn.sendMessage(m.chat, {
            image: { url: global.img },
            caption: rtx2,
            ...global.fake,
            quoted: m,
        });*/

                const msg = generateWAMessageFromContent(m.chat, baileys.proto.Message.fromObject({ 
            interactiveMessage: {
                image: { url: global.img },
                body: { text: rtx2 }, 
                footer: { text: `${dev}` },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: `COPIAR CÓDIGO: ${secret}`,
                                copy_code: secret
                            })
                        }
                    ]
                }
            }
        }), { quoted: m })


        const codeBot = await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

        if (txtCode && txtCode.key) {
            setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 60000) 
        }
        if (codeBot && codeBot.key) {
            setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 60000) 
        }
        qrSent = true 
    }

    if (connection === 'close') {
        qrSent = false;

        const reason = lastDisconnect?.error?.output?.statusCode; 

        const shouldReconnect = [
            DisconnectReason.timedOut,    
            DisconnectReason.badSession,  
            DisconnectReason.connectionLost, 
            DisconnectReason.restartRequired, 
        ].includes(reason);

        if (shouldReconnect) {
            console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathJadiBot)}) se cerró o perdió. Razón: ${reason}. RECONECTANDO...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
            await delay(5000) 
            return creloadHandler(true).catch(console.error)
        } 

        if (reason === DisconnectReason.loggedOut || reason === 401 || reason === 405) {
            console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ SESIÓN CERRADA (+${path.basename(pathJadiBot)}). Borrando datos de sesión.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))

            try {
                if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathJadiBot)}@s.whatsapp.net`, {text : '*SESIÓN CERRADA O INVÁLIDA*\n\n> *INTENTE NUEVAMENTE VINCULARSE COMO SUB-BOT*' }, { quoted: m || null }) : ""
            } catch (error) {
                console.error(chalk.bold.yellow(`Error al notificar cierre de sesión a: +${path.basename(pathJadiBot)}`))
            }
            fs.rmdirSync(pathJadiBot, { recursive: true })
        }
    }

    if (global.db.data == null) loadDatabase()
    if (connection == `open`) {
        if (!global.db.data?.users) loadDatabase()

        let userName, userJid 
        userName = sock.authState.creds.me.name || 'Anónimo'
        userJid = sock.authState.creds.me.jid || `${path.basename(pathJadiBot)}@s.whatsapp.net`

        console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathJadiBot)}) CONECTADO exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))

        sock.isInit = true

        if (!global.conns.some(c => c.user?.jid === sock.user?.jid)) {
            global.conns.push(sock)
        }

        await joinChannels(sock)

        m?.chat ? await (async () => {
            const welcomeMsgText = args[0] ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : `¡Hola, @${m.sender.split('@')[0]}! 🎉\n\nTe has unido con éxito como **Sub-Bot Persistente** de **${botname}**. ¡Ahora eres parte de la familia!`;
            
            const interactiveWelcome = generateWAMessageFromContent(m.chat, baileys.proto.Message.fromObject({
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: `✨ BIENVENIDO A ${botname.toUpperCase()} ✨`,
                                subtitle: "Configuración de Sub-Bot Exitosa",
                                hasMediaAttachment: true,
                                imageMessage: { url: global.img } 
                            },
                            body: {
                                text: welcomeMsgText
                            },
                            footer: {
                                text: `Desarrollado por: ${dev}`
                            },
                            contextInfo: {
                                mentionedJid: [m.sender]
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: 'quick_reply',
                                        buttonParamsJson: '{"display_text":"VER COMANDOS","id":"/menu"}'
                                    },
                                    {
                                        name: 'quick_reply',
                                        buttonParamsJson: '{"display_text":"AYUDA","id":"/help"}'
                                    }
                                ]
                            }
                        }
                    }
                }
            }), { quoted: fkontak1, userJid: sock.user.jid });

            await conn.relayMessage(m.chat, interactiveWelcome.message, { messageId: interactiveWelcome.key.id });

        })() : ''

    }
}

setInterval(async () => {
    if (!sock.user || sock.ws.socket?.readyState === ws.CLOSED) {
        try { sock.ws.close() } catch (e) { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)                
        if (i < 0) return
        delete global.conns[i]
        global.conns.splice(i, 1)
        console.log(chalk.bold.red(`\nSesión inactiva (+${path.basename(pathJadiBot)}) eliminada de la lista.`))
    }
}, 300000) 

let creloadHandler = async function (restatConn) {
    let NewSubHandler = subBotHandlerFunction 
    try {
        const SubHandlerModule = await import(`../sub-handler.js?update=${Date.now()}`).catch(console.error)
        if (SubHandlerModule && typeof SubHandlerModule.subBotHandler === 'function') {
             NewSubHandler = SubHandlerModule.subBotHandler
        }
    } catch (e) {
        console.error('⚠️ Error al recargar sub-handler: ', e)
    }

    if (typeof NewSubHandler !== 'function') {
        console.error('❌ FATAL: NewSubHandler no es una función. Usando handler vacío.')
        NewSubHandler = () => {}
    }

    if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats }) 
        isInit = true
    }
    if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
    }

    sock.handler = NewSubHandler.bind(sock)

    sock.subreloadHandler = creloadHandler.bind(sock, false) 

    sock.connectionUpdate = connectionUpdate.bind(sock)
    sock.credsUpdate = saveCreds.bind(sock, true)
    sock.ev.on("messages.upsert", sock.handler)
    sock.ev.on("connection.update", sock.connectionUpdate)
    sock.ev.on("creds.update", sock.credsUpdate)
    isInit = false
    return true
}
creloadHandler(false)
})
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
    for (const channelId of Object.values(global.ch)) {
        await conn.newsletterFollow(channelId).catch(() => {})
    }
}
