import speed from 'performance-now'
import { spawn, exec, execSync } from 'child_process'

let handler = async (m, { conn }) => {
let timestamp = speed()
let sentMsg = await conn.reply(m.chat, '⏤͟͟͞͞ᴘʀᴏᴄᴇsᴀɴᴅᴏ ᴠᴇʟᴏᴄɪᴅᴀᴅꗄ➺', m1, rcanal)
let latency = speed() - timestamp
exec(`neofetch --stdout`, (error, stdout, stderr) => {
let child = stdout.toString("utf-8");
let ssd = child.replace(/Memory:/, "Ram:")

let result = `${emoji + botname}\n> ${emoji}  *Tiempo* ${latency.toFixed(4).split(".")[0]}ms\n${ssd}`
conn.sendMessage(m.chat, { text: result, edit: sentMsg.key, rcanal }, { quoted: m1 })
})
}
handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler