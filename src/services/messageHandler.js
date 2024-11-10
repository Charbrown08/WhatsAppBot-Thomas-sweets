import whatsappService from './whatsappService.js'

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim()

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo)
      } else {
        const response = `Echo: ${message.text.body}`
        await whatsappService.sendMessage(message.from, response, message.id)
      }
      await whatsappService.markAsRead(message.id)
    }
  }

  isGreeting(message) {
    const greetings = ['hola', 'hello', 'hi', 'buenas tardes']
    return greetings.includes(message)
  }

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo)
    const firstName = name.split(' ')[0]
    const welcomeMessage = `🎉🍰 ¡Hola ${firstName}! Bienvenido a Thomas&Sweets 🎂✨, tu rincón de dulzura en línea. 😋💖 ¿Qué delicia puedo preparar para ti hoy? 🍫🍪`
    await whatsappService.sendMessage(to, welcomeMessage, messageId)
  }

  async sendWelcomeMenu(to) {
    const menuMessage = 'Elige una opcion'
    const buttons = [
      { type: 'reply', reply: { id: 'option_1', title: 'Reservar' } },
      { type: 'reply', reply: { id: 'option_2', title: 'Ver Catalogo' } },
      { type: 'reply', reply: { id: 'option_3', title: 'Consultar' } },
    ]

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons)
  }
}

export default new MessageHandler()
