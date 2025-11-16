import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import ws from 'ws';
import fetch from 'node-fetch';

const isNumber = x => typeof x === 'number' && !isNaN(x);

async function getLidFromJid(id, connection) {
    if (id.endsWith('@lid')) return id;
    const res = await connection.onWhatsApp(id).catch(() => []);
    return res[0]?.lid || id;
}

export async function handler(chatUpdate) {
    this.uptime = this.uptime || Date.now();
    const conn = this;

    if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) {
        return;
    }

    let m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;

    m = smsg(conn, m) || m;
    if (!m) return;

    if (global.db.data == null) {
        await global.loadDatabase();
    }

    conn.processedMessages = conn.processedMessages || new Map();
    const now = Date.now();
    const lifeTime = 9000;

    const id = m.key.id;

    if (conn.processedMessages.has(id)) {
        return;
    }

    conn.processedMessages.set(id, now);

    for (const [msgId, time] of conn.processedMessages) {
        if (now - time > lifeTime) {
            conn.processedMessages.delete(msgId);
        }
    }

    try {


        m.exp = 0;
        m.coin = false;

        const senderJid = m.sender;
        const chatJid = m.chat;

        global.db.data.chats[chatJid] ||= {
            isBanned: false,
            sAutoresponder: '',
            welcome: true,
            autolevelup: false,
            autoresponder: false,
            delete: false,
            autoAceptar: false,
            autoRechazar: false,
            detect: true,
            antiBot: false,
            modoadmin: false,
            antiLink: true,
            nsfw: false,
            expired: 0,
            autoresponder2: false,
            per: [],
        };

        const settingsJid = conn.user.jid;
        global.db.data.settings[settingsJid] ||= {
            self: false,
            restrict: true,
            jadibotmd: true,
            antiPrivate: false,
            autoread: false,
            soloParaJid: false,
            status: 0
        };

        const user = global.db.data.users[senderJid] || {};
        const chat = global.db.data.chats[chatJid];
        const settings = global.db.data.settings[settingsJid];


        if (typeof global.db.data.users[senderJid] !== 'object') global.db.data.users[senderJid] = {};
        if (user) {
            if (!('exp' in user) || !isNumber(user.exp)) user.exp = 0;
            if (!('coin' in user) || !isNumber(user.coin)) user.coin = 0;
            if (!('muto' in user)) user.muto = false; 
        } else {
            global.db.data.users[senderJid] = { exp: 0, coin: 0, muto: false };
        }

        const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net';
        const isROwner = global.owner.map(([number]) => number.replace(/[^0-9]/g, '') + detectwhat).includes(senderJid);
        const isOwner = isROwner || m.fromMe;

        if (m.isBaileys || opts['nyimak']) return;
        if (!isROwner && opts['self']) return;
        if (opts['swonly'] && m.chat !== 'status@broadcast') return;
        if (typeof m.text !== 'string') m.text = '';

        let senderLid, botLid, botJid, groupMetadata, participants, user2, bot, isRAdmin, isAdmin, isBotAdmin;

        if (m.isGroup) {
            groupMetadata = (conn.chats[m.chat] || {}).metadata || await conn.groupMetadata(m.chat).catch(_ => null) || {};
            participants = groupMetadata.participants || [];
            botJid = conn.user.jid;

            [senderLid, botLid] = await Promise.all([
                getLidFromJid(m.sender, conn),
                getLidFromJid(botJid, conn)
            ]);

            user2 = participants.find(p => p.id === senderLid || p.jid === senderJid) || {};
            bot = participants.find(p => p.id === botLid || p.id === botJid) || {};

            isRAdmin = user2?.admin === "superadmin";
            isAdmin = isRAdmin || user2?.admin === "admin";
            isBotAdmin = !!bot?.admin;
        } else {
            senderLid = m.sender;
            botLid = conn.user.jid;
            botJid = conn.user.jid;
            groupMetadata = {};
            participants = [];
            user2 = {};
            bot = {};
            isRAdmin = false;
            isAdmin = false;
            isBotAdmin = false;
        }

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
        let usedPrefix = '';

        for (const name in global.plugins) {
            const plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            const __filename = join(___dirname, name);

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(conn, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    });
                } catch (e) {
                    console.error(`Error en plugin.all de ${name}:`, e);
                }
            }

            if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) {
                continue;
            }

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;

            const match = (
                _prefix instanceof RegExp ?
                    [[_prefix.exec(m.text), _prefix]] :
                    Array.isArray(_prefix) ?
                        _prefix.map(p => {
                            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                            return [re.exec(m.text), re];
                        }) :
                        typeof _prefix === 'string' ?
                            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                            [[[], new RegExp()]]
            ).find(p => p[0]);

            if (typeof plugin.before === 'function') {
                const extraBefore = {
                    match, conn, participants, groupMetadata, user: global.db.data.users[m.sender], isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, chatUpdate, __dirname: ___dirname, __filename
                };
                if (await plugin.before.call(conn, m, extraBefore)) {
                    continue;
                }
            }

            if (typeof plugin !== 'function' || !match) continue;

            usedPrefix = match[0][0];
            let noPrefix = m.text.replace(usedPrefix, '');
            let [command, ...args] = noPrefix.trim().split(/\s+/).filter(v => v);
            let text = args.join(' ');
            command = (command || '').toLowerCase();

            const fail = plugin.fail || global.dfail;
            const isAccept = plugin.command instanceof RegExp ?
                plugin.command.test(command) :
                Array.isArray(plugin.command) ?
                    plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ?
                        plugin.command === command :
                        false;

            global.comando = command;

            if (settings.soloParaJid && m.sender !== settings.soloParaJid) {
                continue;
            }



            if (!isAccept) continue;

            m.plugin = name;

            if (chat?.isBanned && !isROwner) return;
            if (chat?.modoadmin && !isOwner && !isROwner && m.isGroup && !isAdmin) return;

            const checkPermissions = (perm) => {
                const permissions = {
                    rowner: isROwner,
                    owner: isOwner,
                    group: m.isGroup,
                    botAdmin: isBotAdmin,
                    admin: isAdmin,
                    private: !m.isGroup,
                    restrict: !opts['restrict']
                };
                return permissions[perm];
            };

            const requiredPerms = ['rowner', 'owner', 'mods', 'premium', 'group', 'botAdmin', 'admin', 'private', 'restrict'];
            for (const perm of requiredPerms) {
                if (plugin[perm] && !checkPermissions(perm)) {
                    fail(perm, m, conn);
                    return;
                }
            }

            m.isCommand = true;
            const xp = 'exp' in plugin ? parseInt(plugin.exp) : 10;
            m.exp += xp;

            const extra = {
                match, usedPrefix, noPrefix, args, command, text, conn, participants, groupMetadata, user: global.db.data.users[m.sender], isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, chatUpdate, __dirname: ___dirname, __filename
            };

            try {
                await plugin.call(conn, m, extra);
            } catch (e) {
                m.error = e;
                console.error(`Error de ejecución en plugin ${name}:`, e);
                const errorText = format(e).replace(new RegExp(Object.values(global.APIKeys).join('|'), 'g'), 'Administrador');
                m.reply(errorText);
            } finally {
                if (typeof plugin.after === 'function') {
                    try {
                        await plugin.after.call(conn, m, extra);
                    } catch (e) {
                        console.error(`Error en plugin.after de ${name}:`, e);
                    }
                }
            }
        }

    } catch (e) {
        console.error('Error no capturado en handler:', e);
    } finally {
        if (m) {
            const finalUser = global.db.data.users[m.sender];
            if (finalUser) {
                if (finalUser.muto) {
                    await conn.sendMessage(m.chat, { delete: m.key });
                }
                finalUser.exp = (finalUser.exp || 0) + (m.exp || 0);
                finalUser.coin = (finalUser.coin || 0) - (m.coin ? m.coin * 1 : 0);
            }

            if (m.plugin) {
                const stats = global.db.data.stats;
                const now = Date.now();
                stats[m.plugin] ||= { total: 0, success: 0, last: 0, lastSuccess: 0 };
                const stat = stats[m.plugin];
                stat.total += 1;
                stat.last = now;
                if (!m.error) {
                    stat.success += 1;
                    stat.lastSuccess = now;
                }
            }
        }
    }
}

global.dfail = (type, m, conn) => {
    const messages = {
        rowner: `
┏━━━━━━━━━━━━━━━━╮
┃ *〘 ${global.comando} 〙*
┃ ➣ 𝑆𝑜𝑙𝑜 𝑝𝑎𝑟𝑎 𝑙𝑜𝑠 𝐶𝑟𝑒𝑎𝑑𝑜𝑟𝑒𝑠 ↷
┃ » 𝑁𝑜 𝑖𝑛𝑠𝑖𝑠𝑡𝑎𝑠...
┗━━━━━━━━━━━━━━━━╯
`,
        owner: `
┏━━━━━━━━━━━━━━━━╮
┃ *〘 ${global.comando} 〙*
┃ ➣ 𝐸𝑥𝑐𝑙𝑢𝑠𝑖𝑣𝑜 𝑑𝑒 𝐷𝑒𝑠𝑎𝑟𝑟𝑜𝑙𝑙𝑎𝑑𝑜𝑟𝑒𝑠 ↷
┃ » 𝑁𝑖𝑣𝑒𝑙 𝑖𝑛𝑠𝑢𝑓𝑖𝑐𝑖𝑒𝑛𝑡𝑒...
┗━━━━━━━━━━━━━━━━╯
`,
        group: `
┏━━━━━━━━━━━━╮
┃  *〘 ${global.comando} 〙*
┃ ➣ 𝑆𝑜𝑙𝑜 𝑓𝑢𝑛𝑐𝑖𝑜𝑛𝑎 𝑒𝑛 𝐺𝑟𝑢𝑝𝑜𝑠 ↷
┃ » 𝑁𝑜 𝑡𝑟𝑎𝑡𝑒𝑠 𝑑𝑒 𝑒𝑛𝑔𝑎ñ𝑎𝑟...
┗━━━━━━━━━━━━━╯`,
        private: `
┏━━━━━╹━━━━━━━╮
┃  *〘 ${global.comando} 〙*
┃ ➣ 𝑆𝑜𝑙𝑜 𝑒𝑛 𝑃𝑟𝑖𝑣𝑎𝑑𝑜 ↷
┃ » 𝐴𝑞𝑢í 𝑛𝑜, 𝑎𝑚𝑖𝑔𝑜...
┗━━━━━━━━━━━━━╯`,
        admin: `
┏━━━━━━━━━━━━━━╮
┃  *〘 ${global.comando} 〙*
┃ ➣ 𝑃𝑜𝑑𝑒𝑟 𝑟𝑒𝑠𝑒𝑟𝑣𝑎𝑑𝑜 𝑎 𝐴𝑑𝑚𝑖𝑛𝑠 ↷
┃ » 𝑅𝑒𝑠𝑝𝑒𝑡𝑎 𝑒𝑠𝑎 𝑟𝑒𝑔𝑙𝑎...
┗━━━━━━━━━━━━━━╯
`,
        botAdmin: `
┏━━━━━━━━━━━━━━╮
┃ *〘 ${global.comando} 〙*
┃ ➣ 𝑁𝑒𝑐𝑒𝑠𝑖𝑡𝑜 𝑠𝑒𝑟 𝐴𝑑𝑚𝑖𝑛 ↷
┃ » 𝐷𝑎𝑚𝑒 𝑒𝑙 𝑟𝑎𝑛𝑔𝑜 𝑦 𝘩𝑎𝑏𝑙𝑎𝑚𝑜𝑠...
┗━━━━━━━━━━━━━━╯
`,
        restrict: `
┏━━━━━━━━━━━━━━╮
┃ *〘 ${global.comando} 〙*
┃ ➣ 𝐹𝑢𝑛𝑐𝑖ó𝑛 𝐵𝑙𝑜𝑞𝑢𝑒𝑎𝑑𝑎 ↷
┃ » 𝑁𝑜 𝑖𝑛𝑡𝑒𝑛𝑡𝑒𝑠...
┗━━━━━━━━━━━━━━╯`
    };
    if (messages[type]) {
        conn.reply(m.chat, messages[type], m);
    }
};

let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.magenta("Se actualizo 'handler.js'"));
    if (global.conns && global.conns.length > 0) {
        const users = global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED);
        for (const user of users) {
            user.subreloadHandler(false);
        }
    }
});