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
}

export default new MessageHandler()
