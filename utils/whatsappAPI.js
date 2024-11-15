const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsAppMessage = (to, message) => {
  client.messages.create({
    from: 'whatsapp:+14155238886',  // Número del sandbox de Twilio para WhatsApp
    to: `whatsapp:+521${to}`,  // Asegúrate de que el número incluya el prefijo internacional
    body: message,  // Mensaje de texto que se enviará
  })
  .then((message) => console.log(`Mensaje enviado: ${message.sid}`))
  .catch((error) => console.error(`Error enviando mensaje: ${error.message}`));
};

module.exports = { sendWhatsAppMessage };
