module.exports = async (ctx, options) => {
  try {
    const globalState = options.globalState.getMyState();
    const inboxId = globalState.inbox_id;
    const chatwoot = options.extensions.chatwoot;
    const checkIsSave = (await chatwoot.searchByNumber(`${ctx.from}`));
    const name = ctx?.pushName ?? ctx.ProfileName.split(" ").shift();
    if (!checkIsSave.length) {
        console.log('checking is save')
        const contactSave = await chatwoot.createContact({
          phone_number: `+${ctx.from}`,
          name: name,
        });
        console.log(contactSave)
        await options.state.update({
          chat_woot_id: contactSave.payload.contact.id ?? checkIsSave[0].id,
        });
      } else {
        await options.state.update({ chat_woot_id: checkIsSave[0].id });
      }
      const currentState = options.state.getMyState();
  
      const filterConversation = await chatwoot.filterConversation({
        phone_number: ctx.from,
      });

      console.log('filter conversation', filterConversation)
  
      await options.state.update({
        conversation_id: filterConversation.payload.length ? filterConversation.payload[0].id : 0,
      });
  
      console.log(options.state.getMyState())
  
      if (!filterConversation.payload.length) {
        const conversation = await chatwoot.createConversation({
          inbox_id: inboxId,
          contact_id: currentState.chat_woot_id,
          phone_number: ctx.from,
        });
        
        await options.state.update({ conversation_id: conversation.id });
      }
        //Si tienes asignado agente no continua
      if (filterConversation.payload.length && filterConversation.payload[0].meta) {
        const assignee = filterConversation.payload[0].meta?.assignee
        if (assignee) return await options.endFlow()
      }
  } catch (error) {
    console.log(error)
  }
}