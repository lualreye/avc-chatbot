const { addKeyword } = require("@bot-whatsapp/bot");

const { informationKeywords } = require("../utils/subscription.keywords");

const informationFlow = addKeyword(informationKeywords)
  .addAnswer('Puedes ayudarme con tu correo electrónico o número solicitud')
  .addAnswer(
    'Perfecto, estamos buscando en nuestra base de datos'
  )

module.exports = informationFlow;