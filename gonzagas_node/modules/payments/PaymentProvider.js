class PaymentProvider {
  get name() {
    throw new Error('Not implemented');
  }

  isConfigured() {
    return false;
  }

  async createCheckoutSession(order) {
    throw new Error('Not implemented');
  }

  async handleWebhook(rawBody, signature) {
    throw new Error('Not implemented');
  }

  async refund(paymentReference, amount) {
    throw new Error('Not implemented');
  }
}

module.exports = PaymentProvider;
