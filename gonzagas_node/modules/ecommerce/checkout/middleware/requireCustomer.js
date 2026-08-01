/**
 * O checkout exige conta.
 *
 * O carrinho continua aberto a visitantes — a barreira é só na finalização,
 * que é o padrão da generalidade das lojas: deixa a pessoa explorar e montar
 * o carrinho sem atrito, e só pede conta quando já há intenção de comprar.
 *
 * Quem não tem sessão é enviado para o login com `returnTo`, e volta ao
 * checkout depois de entrar. O carrinho não se perde: vive no cookie e na
 * base de dados, e ao entrar passa a estar associado à conta.
 */

function requireCustomerForCheckout(req, res, next) {
  if (req.session?.customerId) return next();

  const wantsJson =
    req.originalUrl.startsWith('/api/') ||
    req.xhr ||
    (req.get('accept') || '').includes('application/json');

  if (wantsJson) {
    return res.status(401).json({
      success: false,
      error: 'É preciso ter conta para finalizar a compra.',
      loginUrl: '/account/login?returnTo=/checkout',
    });
  }

  return res.redirect('/account/login?returnTo=/checkout');
}

module.exports = { requireCustomerForCheckout };
