/*import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  const jid = m.chat;

  
  const res = await fetch('https://files.catbox.moe/usl0ms.jpg');
  const thumb2 = Buffer.from(await res.arrayBuffer());


const fkontak = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    id: 'fake-product-message-id'
  },
  message: {
    productMessage: {
      product: {
        productImage: {
          jpegThumbnail: thumb2 // Buffer con imagen pequeña
        },
        title: '🔥 Producto Destacado 🔥',
        description: 'Alquila o compra este producto para tus grupos.',
        currencyCode: 'USD',
        priceAmount1000: 5000, // 5 USD
        retailerId: '1466',
        productId: '24103084136052981',
        productImageCount: 1
      },
      businessOwnerJid: '50432955554@s.whatsapp.net'
    }
  },
  participant: '0@s.whatsapp.net'
};
 

  try {
    const productMessage = {
      product: {
        productImage: {
          url: icono 
        },
        title: global.textbot,
        description: `Alquila o compra *${global.botname}* para tus grupos.`,
        currencyCode: "USD",
        priceAmount1000: 5000,
        retailerId: "1466",
        productId: "24103084136052981",
        productImageCount: 1,
      },
      businessOwnerJid: "50432955554@s.whatsapp.net"
    };

    
    await conn.sendMessage(jid, productMessage, { messageType: 'product', quoted: fkontak });
  } catch (error) {
    console.error('Error enviando catálogo:', error);
    conn.reply(jid, '❌ No se pudo enviar el catálogo. Verifica que el productId y el número Business sean correctos.', m);
  }
};

handler.help = ['producto', 'compra'];
handler.command = ['producto', 'compra', 'buy'];
handler.tags = ['ventas'];
handler.register = true;

export default handler;*/



let handler = async (m, { conn }) => {
  const jid = m.chat || m.sender;
  const texto = `Compra ${global.botname} por $5 para tus grupos, etc.`;

  try {
    let data = (await conn.onWhatsApp(jid))[0] || {};

    if (data.exists) {
      await conn.sendPayment(data.jid, '999999999', texto, m);
    } else {
      await conn.sendMessage(jid, 'No se encontró el contacto para enviar el pago.', { quoted: m });
    }
  } catch (error) {
    await conn.sendMessage(jid, 'Error al enviar el pago: ' + error.message, { quoted: m });
  }
};

handler.tags = ['main'];
handler.command = handler.help = ['buy', 'comprar'];

export default handler;