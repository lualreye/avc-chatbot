const chatWootHook = async (req, res) => {
  const adapterProvider = req.ws;
  const body = req.body
  const message = body.content
  const phone = body.phone_number?.replace('+','')

  if(body.message_type !== 'outgoing'){
    res.send({a:1})
    return
  }

  await adapterProvider.sendText(`${phone}@c.us`, message);
  res.send({phone, message})
}

module.exports = chatWootHook