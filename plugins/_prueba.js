import fetch from 'node-fetch' // si usas ESM, si no, adapta la importación

const respuestas = {
  'hola': {
    text: 'Hola 👋, ¡qué gusto saludarte!',
    title: 'Saludo cordial',
    body: 'Estoy aquí para ayudarte',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'adiós': {
    text: '¡Hasta luego! Que tengas un gran día 🌟',
    title: 'Despedida amigable',
    body: 'Vuelve pronto',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: icono
  },
  'qué bueno': {
    text: 'Me alegra que pienses así 😊',
    title: 'Respuesta positiva',
    body: 'Siempre para ayudarte',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'qué tal están': {
    text: '¡Estamos bien, gracias por preguntar! ¿Y tú?',
    title: 'Respuesta amable',
    body: 'Aquí para ti',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buenos días': {
    text: '¡Buenos días! Que tengas un excelente día ☀️',
    title: 'Saludo matutino',
    body: '¡Arrancamos con energía!',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buenas tardes': {
    text: '¡Buenas tardes! Espero que tu día esté genial 🌇',
    title: 'Saludo vespertino',
    body: 'Disfruta tu tarde',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buenas noches': {
    text: '¡Buenas noches! Que descanses y sueñes bonito 🌙',
    title: 'Saludo nocturno',
    body: 'Nos vemos mañana',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'gracias': {
    text: '¡De nada! Para eso estoy 🤖',
    title: 'Respuesta agradecida',
    body: 'Siempre a tu servicio',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'cómo estás': {
    text: '¡Estoy bien, gracias! ¿En qué te puedo ayudar?',
    title: 'Respuesta cordial',
    body: 'Listo para asistirte',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'qué haces': {
    text: 'Estoy aquí respondiendo tus mensajes 🤖',
    title: 'Respuesta curiosa',
    body: '¿Quieres que te ayude?',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buen trabajo': {
    text: '¡Gracias! Me esfuerzo mucho para ayudarte 😊',
    title: 'Elogio recibido',
    body: '¡A seguir trabajando!',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'feliz cumpleaños': {
    text: '¡Feliz cumpleaños! 🎉 Que tengas un día maravilloso',
    title: 'Felicitación especial',
    body: 'Celebra a lo grande',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buen finde': {
    text: '¡Feliz fin de semana! Descansa y disfruta mucho 🏖️',
    title: 'Saludo para el fin de semana',
    body: 'Nos vemos pronto',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'lo siento': {
    text: 'No hay problema, ¡todo está bien! 🤗',
    title: 'Respuesta comprensiva',
    body: 'Aquí para apoyarte',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'estoy bien': {
    text: 'Me alegra saberlo 😊 ¿En qué puedo ayudarte?',
    title: 'Respuesta positiva',
    body: 'Listo para asistirte',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'qué pasa': {
    text: 'Nada fuera de lo normal, aquí atento para ayudarte 👍',
    title: 'Respuesta casual',
    body: '¿Quieres algo?',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'saludos': {
    text: '¡Saludos para ti también! 👋',
    title: 'Saludo amistoso',
    body: 'Que tengas un gran día',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buenas': {
    text: '¡Buenas! ¿Cómo puedo ayudarte?',
    title: 'Saludo corto',
    body: 'Estoy aquí para ti',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'gracias por todo': {
    text: '¡Es un placer ayudarte siempre! 😊',
    title: 'Agradecimiento especial',
    body: 'Cuenta conmigo',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'nos vemos': {
    text: '¡Nos vemos pronto! Cuídate mucho 🤗',
    title: 'Despedida amigable',
    body: 'Aquí estaré',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'feliz año nuevo': {
    text: '¡Feliz Año Nuevo! 🎆 Que este año esté lleno de éxitos',
    title: 'Felicitación de año nuevo',
    body: 'Vamos por un gran año',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'buenas noches a todos': {
    text: '¡Buenas noches! Que todos descansen bien 🌙',
    title: 'Saludo colectivo nocturno',
    body: 'Hasta mañana',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'cómo va todo': {
    text: 'Todo va genial, gracias por preguntar 😄',
    title: 'Respuesta casual',
    body: '¿En qué puedo ayudarte?',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'qué tal todo': {
    text: 'Todo está en orden por aquí 👍',
    title: 'Respuesta casual',
    body: '¿Quieres algo?',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  },
  'hola qué tal': {
    text: '¡Hola! Todo bien, ¿y tú?',
    title: 'Saludo con pregunta',
    body: 'Estoy aquí para ayudarte',
    url: 'https://naruto-bot.vercel.app/',
    thumbnail: 'https://i.imgur.com/U5c9bA6.png'
  }
}

let handler = async (m, { conn }) => {
  if (!m.text) return
  const texto = m.text.toLowerCase().trim()
  
  // Buscar coincidencia exacta en las claves
  // Para frases con espacios, solo exacto para evitar falsos positivos
  let key = Object.keys(respuestas).find(k => k === texto)
  if (!key) return
  
  let r = respuestas[key]

  try {
    const thumbnailBuffer = await (await fetch(r.thumbnail)).buffer()
    await conn.sendMessage(m.chat, {
      text: r.text,
      contextInfo: {
        externalAdReply: {
          title: r.title,
          body: r.body,
          mediaUrl: r.url,
          sourceUrl: r.url,
          thumbnail: thumbnailBuffer,
          showAdAttribution: false
        }
      }
    }, { quoted: m })
  } catch {
    // fallback simple sin thumbnail en caso de error
    await conn.sendMessage(m.chat, { text: r.text }, { quoted: m })
  }
}

handler.customPrefix = new RegExp(`^(${Object.keys(respuestas).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
handler.command = new RegExp
export default handler