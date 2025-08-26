let handler = async (m, { conn }) => {
  try {
    let mensaje = "Este es un consejo de prueba" 

    await conn.sendMessage(m.chat, {
      text: `🌟 *Mensaje para ti:*\n\n"${mensaje}"`,
      footer: 'Toca el botón para otro consejo',
      buttons: [
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