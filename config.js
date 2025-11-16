import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

global.owner = [
  [ '50432955554', 'Eliac', true ]
]; 

global.suittag = ['50432955554'] 
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 
global.Jadibts = true
global.packname = '🎅🎄 𝙺𝚒𝚛𝚒𝚝𝚘-𝙱𝚘𝚝 𝙼𝙳 ✨⛄';
global.botname = '🎁 𝗞𝗜𝗥𝗜𝗧𝗢-𝗕𝗢𝗧 𝗠𝗗 ⛄★.°🦌';
global.author = '🎄 𝑴𝒂𝒅𝒆 𝑩𝒚 𝑬𝒍𝒊𝒂𝒄 🎅❄️';
global.dev = '🔔 © ρσɯҽɾҽԃ Ⴆყ 𝑬𝒍𝒊𝒂𝒄 🎁🎄';
global.textbot = '🧦🎅 ᴋɪʀɪᴛᴏ-ʙᴏᴛ ᴍᴅ • 𝑬𝒍𝒊𝒂𝒄 ❄️🎄✨';
global.etiqueta = '🎄 𝞔𝘭ⅈɑｃ 🎅';
global.ch = {
ch1: '120363403593951965@newsletter',
ch2: '120363403593951965@newsletter',
}
global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.kirito = 'https://kirito-my.vercel.app'
global.moment = moment   

let icono1 = [
  'https://i.postimg.cc/c4t9wwCw/1756162596829.jpg',
  'https://i.postimg.cc/c4MvC5Wz/1756167144046.jpg',
  'https://i.postimg.cc/qMdtkHPn/1756167135980.jpg',
]

global.inc = icono1[Math.floor(Math.random() * icono1.length)];

const res = await fetch(inc);
const img = Buffer.from(await res.arrayBuffer());


async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
