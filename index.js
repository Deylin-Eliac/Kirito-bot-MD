process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js';
import { watchFile, unwatchFile } from 'fs';
import cfonts from 'cfonts';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import fs, { readdirSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn, execSync } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
//import { JadiBot } from './plugins/jadibot-serbot.js';
import { tmpdir } from 'os';
import { format } from 'util';
import P from 'pino';
import pino from 'pino';
import Pino from 'pino';
import path, { join, dirname } from 'path';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js';
const { proto } = (await import('@whiskeysockets/baileys')).default;
import pkg from 'google-libphonenumber';
const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers } = await import('@whiskeysockets/baileys');
import readline from 'readline';
import NodeCache from 'node-cache';

const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

let { say } = cfonts;
console.log(chalk.magentaBright('\n Iniciando...'));
say('SPARK', {
    font: 'simple',
    align: 'left',
    gradient: ['green', 'white']
});
say('developed by Deylin ', {
    font: 'console',
    align: 'center',
    colors: ['cyan', 'magenta', 'yellow']
});

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.timestamp = { start: new Date() };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!./]');

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function() {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

const { state, saveCreds } = await useMultiFileAuthState(global.sessions);
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.botNumber;
const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");
const colors = chalk.bold.white;
const qrOption = chalk.blueBright;
const textOption = chalk.cyan;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));
let opcion;
if (methodCodeQR) {
    opcion = '1';
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
    do {
        opcion = await question(colors("┏╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍⚃\n┇ ╭┈┈┈┈┈┈┈┈┈┈┈┈┈┈╾\n┇ ┆Seleccione una opción:\n┇") + qrOption(" ┆1. Con código QR\n┇") + textOption(" ┆2. Con código de texto de 8 dígitos\n┇ ╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╾\n┗╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍⚃\n\n❑➙➔ "));
        if (!/^[1-2]$/.test(opcion)) {
            console.log(chalk.bold.redBright(`ム ʕ˖͜͡˖ʔ No se permiten numeros que no sean 1 o 2, tampoco letras o símbolos especiales.`));
        }
    } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`));
}

console.info = () => {};
console.debug = () => {};

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: opcion === '1' || methodCodeQR,
    mobile: MethodMobile,
    browser: opcion === '1' || methodCodeQR ? Browsers.macOS("Desktop") : Browsers.macOS("Chrome"),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async (key) => {
        try {
            const jid = jidNormalizedUser(key.remoteJid);
            const msg = await store.loadMessage(jid, key.id);
            return msg?.message || "";
        } catch (error) {
            return "";
        }
    },
    msgRetryCounterCache: msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
    cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
    version: version,
    keepAliveIntervalMs: 55000,
    maxIdleTimeMs: 60000,
};

global.conn = makeWASocket(connectionOptions);
if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
    if (opcion === '2' || methodCode) {
        if (!global.conn.authState.creds.registered) {
            let addNumber;
            if (!!phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                do {
                    phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[ ♛ ]  Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.magentaBright('---> ')}`)));
                    phoneNumber = phoneNumber.replace(/\D/g, '');
                    if (!phoneNumber.startsWith('+')) {
                        phoneNumber = `+${phoneNumber}`;
                    }
                } while (!await isValidPhoneNumber(phoneNumber));
                rl.close();
                addNumber = phoneNumber.replace(/\D/g, '');
                setTimeout(async () => {
                    let codeBot = await global.conn.requestPairingCode(addNumber);
                    codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                    console.log(chalk.bold.white(chalk.bgMagenta(`[ ʕ˖͜͡˖ʔ ]  Código:`)), chalk.bold.white(chalk.white(codeBot)));
                }, 3000);
            }
        }
    }
}
global.conn.isInit = false;
global.conn.well = false;
global.conn.logger.info(`[ ⌨ ]  H E C H O\n`);
if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp']) {
            const tmpDir = tmpdir();
            spawn('find', [tmpDir, '-amin', '3', '-type', 'f', '-delete']);
        }
    }, 30 * 1000);
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin } = update;
    global.stopped = connection;
    if (isNewLogin) global.conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut && global.conn?.ws.socket == null) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date();
    }
    if (global.db.data == null) loadDatabase();
    if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
        if (opcion === '1' || methodCodeQR) {
            console.log(chalk.green.bold(`[ ꗇ ]  Escanea este código QR`));
        }
    }
    if (connection === "open") {
        const userJid = jidNormalizedUser(global.conn.user.id);
        const userName = global.conn.user.name || global.conn.user.verifiedName || "Desconocido";
        console.log(chalk.green.bold(`[ ☊ ]  Conectado a: ${userName}`));
    }
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (connection === 'close') {
        if (reason === DisconnectReason.badSession) {
            console.log(chalk.bold.cyanBright(`\n⚠︎ Sin conexión, borra la session principal del Bot, y conectate nuevamente.`));
        } else if (reason === DisconnectReason.connectionClosed) {
            console.log(chalk.bold.magentaBright(`\n♻ Reconectando la conexión del Bot...`));
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionLost) {
            console.log(chalk.bold.blueBright(`\n⚠︎ Conexión perdida con el servidor, reconectando el Bot...`));
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.connectionReplaced) {
            console.log(chalk.bold.yellowBright(`\nꗇ La conexión del Bot ha sido reemplazada.`));
        } else if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.bold.redBright(`\n⚠︎ Sin conexión, borra la session principal del Bot, y conectate nuevamente.`));
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.restartRequired) {
            console.log(chalk.bold.cyanBright(`\n♻ Conectando el Bot con el servidor...`));
            await global.reloadHandler(true).catch(console.error);
        } else if (reason === DisconnectReason.timedOut) {
            console.log(chalk.bold.yellowBright(`\n♻ Conexión agotada, reconectando el Bot...`));
            await global.reloadHandler(true).catch(console.error);
        } else {
            console.log(chalk.bold.redBright(`\n⚠︎ Conexión cerrada, conectese nuevamente.`));
        }
    }
}

process.on('uncaughtException', console.error);
let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function(restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) {
        console.error(e);
    }
    if (restatConn) {
        const oldChats = global.conn.chats;
        try {
            global.conn.ws.close();
        } catch {}
        global.conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions, { chats: oldChats });
        isInit = true;
    }
    if (!isInit) {
        global.conn.ev.off('messages.upsert', global.conn.handler);
        global.conn.ev.off('connection.update', global.conn.connectionUpdate);
        global.conn.ev.off('creds.update', global.conn.credsUpdate);
    }
    global.conn.handler = handler.handler.bind(global.conn);
    global.conn.connectionUpdate = connectionUpdate.bind(global.conn);
    global.conn.credsUpdate = saveCreds.bind(global.conn, true);
    global.conn.ev.on('messages.upsert', global.conn.handler);
    global.conn.ev.on('connection.update', global.conn.connectionUpdate);
    global.conn.ev.on('creds.update', global.conn.credsUpdate);
    isInit = false;
    return true;
};
setInterval(() => {
    console.log('[ ↻ ]  Reiniciando...');
    process.exit(0);
}, 10800000);

/*global.rutaJadiBot = join(__dirname, './JadiBots')

if (global.Jadibts) {


  if (!existsSync(global.rutaJadiBot)) {
    mkdirSync(global.rutaJadiBot, { recursive: true })
    console.log(chalk.bold.cyan(`📁 Carpeta creada: ${global.rutaJadiBot}`))
  } else {
    console.log(chalk.bold.cyan(`📁 Carpeta ya existente: ${global.rutaJadiBot}`))
  }

  const subbots = readdirSync(global.rutaJadiBot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  for (const nombreSubbot of subbots) {
    const pathSubbot = join(global.rutaJadiBot, nombreSubbot)
    const archivosSubbot = readdirSync(pathSubbot)

    if (archivosSubbot.includes('creds.json')) {
      try {
        JadiBot({
          pathJadiBot: pathSubbot,
          m: null,
          conn,
          args: '',
          usedPrefix: '/',
          command: 'serbot'
        })
        console.log(chalk.green(`✅ Subbot cargado: ${nombreSubbot}`))
      } catch (e) {
        console.error(chalk.red(`❌ Error cargando subbot: ${nombreSubbot}`), e)
      }
    }
  }
}*/

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = global.__filename(join(pluginFolder, filename));
            const module = await import(file);
            global.plugins[filename] = module.default || module;
        } catch (e) {
            global.conn.logger.error(e);
            delete global.plugins[filename];
        }
    }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        if (filename in global.plugins) {
            if (existsSync(dir)) global.conn.logger.info(` updated plugin - '${filename}'`);
            else {
                global.conn.logger.warn(`deleted plugin - '${filename}'`);
                return delete global.plugins[filename];
            }
        } else global.conn.logger.info(`new plugin - '${filename}'`);
        const err = syntaxerror(readFileSync(dir), filename, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
        });
        if (err) global.conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`);
        else {
            try {
                const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
                global.plugins[filename] = module.default || module;
            } catch (e) {
                global.conn.logger.error(`error require plugin '${filename}\n${format(e)}'`);
            } finally {
                global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
            }
        }
    }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();
async function _quickTest() {
    const test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn('find', ['--version']),
    ].map((p) => {
        return Promise.race([
            new Promise((resolve) => {
                p.on('close', (code) => {
                    resolve(code !== 127);
                });
            }),
            new Promise((resolve) => {
                p.on('error', (_) => resolve(false));
            })
        ]);
    }));
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
    Object.freeze(global.support);
}

function clearTmp() {
    const tmpDir = tmpdir();
    const filenames = readdirSync(tmpDir);
    filenames.forEach(file => {
        const filePath = join(tmpDir, file);
        unlinkSync(filePath);
    });
}

function purgeSession() {
    const prekey = [];
    const directorio = readdirSync(`./${global.sessions}`);
    const filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'));
    prekey.push(...filesFolderPreKeys);
    filesFolderPreKeys.forEach(file => {
        unlinkSync(`./${global.sessions}/${file}`);
    });
}

function purgeOldFiles() {
    const directories = [`./${global.sessions}/`];
    directories.forEach(dir => {
        readdirSync(dir, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                if (file !== 'creds.json') {
                    const filePath = path.join(dir, file);
                    unlinkSync(filePath, err => {
                        if (err) {
                            console.log(chalk.bold.red(`\n⚠︎ El archivo ${file} no se logró borrar.\n` + err));
                        } else {
                            console.log(chalk.bold.green(`\n⌦ El archivo ${file} se ha borrado correctamente.`));
                        }
                    });
                }
            });
        });
    });
}

function isValidPhoneNumber(number) {
    try {
        const parsedNumber = phoneUtil.parseAndKeepRawInput(number.replace(/\s+/g, ''));
        return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
        return false;
    }
}

setInterval(async () => {
    if (global.stopped === 'close' || !global.conn || !global.conn.user) return;
    await clearTmp();
    console.log(chalk.bold.cyanBright(`\n⌦ Archivos de la carpeta TMP no necesarios han sido eliminados del servidor.`));
}, 1000 * 60 * 4);
setInterval(async () => {
    if (global.stopped === 'close' || !global.conn || !global.conn.user) return;
    await purgeSession();
    console.log(chalk.bold.cyanBright(`\n⌦ Archivos de la carpeta ${global.sessions} no necesario han sido eliminados del servidor.`));
}, 1000 * 60 * 10);
setInterval(async () => {
    if (global.stopped === 'close' || !global.conn || !global.conn.user) return;
    await purgeOldFiles();
    console.log(chalk.bold.cyanBright(`\n⌦ Archivos no necesario han sido eliminados del servidor.`));
}, 1000 * 60 * 10);
_quickTest().catch(console.error);