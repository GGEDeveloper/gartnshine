const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { passport } = require('../config/passport');
const Customer = require('../models/Customer');
const { formatOrderStatus, formatPaymentStatus } = require('../utils/orderStatus');
const { requireEcommerceEnabled } = require('../../cart/middleware/requireEcommerceEnabled');
const cartService = require('../../cart/services/cartService');
const moduleConfig = require('../../config');
const mailer = require('../../notifications/services/mailer');

router.use(requireEcommerceEnabled);

// A conta passou a ser obrigatória para finalizar a compra, ou seja, estas
// rotas passaram a ser a porta principal da loja. Sem um limite próprio,
// ficavam expostas a tentativas de adivinhar passwords à velocidade do
// limitador global, que é generoso por ser para navegação normal.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Demasiadas tentativas. Aguarde alguns minutos e tente de novo.',
});

function requireCustomer(req, res, next) {
  if (!req.session.customerId) {
    return res.redirect('/account/login');
  }
  next();
}

/** Valida um destino de redirect para não permitir saltos para fora do site. */
function safeReturnTo(value) {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

/**
 * Passos comuns a qualquer entrada na conta (password, registo ou Google):
 * guardar a sessão e trazer para ela o carrinho que a pessoa tinha como
 * visitante, mais o de sessões anteriores.
 */
async function startCustomerSession(req, res, customer) {
  req.session.customerId = customer.id;
  req.session.customerEmail = customer.email;

  const sessionId = cartService.ensureSessionId(req, res);
  req.session.cartTaggedFor = sessionId;
  await cartService.mergeSessionsForCustomer(sessionId, customer.email);
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.customerId) {
    return res.redirect('/account/orders');
  }
  next();
}

router.get('/', (req, res) => {
  if (req.session.customerId) {
    return res.redirect('/account/orders');
  }
  res.redirect('/account/login');
});

router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('modules/ecommerce/account-login', {
    title: 'Entrar',
    messages: req.flash(),
    returnTo: req.query.returnTo || null,
  });
});

router.post('/login', authLimiter, redirectIfLoggedIn, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const customer = await Customer.findByEmail(email);
    if (!customer || !(await Customer.verifyPassword(customer, req.body.password))) {
      // Se a conta existe mas só tem Google, dizer isso — senão a pessoa fica a
      // tentar uma password que nunca definiu.
      const googleOnly = customer && !customer.password_hash && customer.google_id;
      req.flash(
        'error',
        googleOnly
          ? 'Esta conta foi criada com Google. Use "Entrar com Google", ou defina uma password em "Esqueceu-se da password?".'
          : 'Email ou password incorrectos.'
      );
      const q = req.body.returnTo ? `?returnTo=${encodeURIComponent(req.body.returnTo)}` : '';
      return res.redirect(`/account/login${q}`);
    }
    await startCustomerSession(req, res, customer);
    const returnTo = safeReturnTo(req.body.returnTo || req.query.returnTo);
    if (returnTo) return res.redirect(returnTo);
    res.redirect('/account/orders');
  } catch (err) {
    next(err);
  }
});

router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('modules/ecommerce/account-register', {
    title: 'Registar',
    messages: req.flash(),
    prefillEmail: req.query.email || '',
    returnTo: req.query.returnTo || null,
  });
});

router.post('/register', authLimiter, redirectIfLoggedIn, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const confirmPassword = req.body.confirmPassword || '';
    const firstName = (req.body.firstName || '').trim();
    const lastName = (req.body.lastName || '').trim();

    const returnToRaw = req.body.returnTo || req.query.returnTo;
    const backToForm = () => {
      const q = returnToRaw ? `?returnTo=${encodeURIComponent(returnToRaw)}` : '';
      return `/account/register${q}`;
    };

    if (!email || !firstName || !lastName) {
      req.flash('error', 'Preencha todos os campos obrigatórios.');
      return res.redirect(backToForm());
    }

    if (password.length < 6) {
      req.flash('error', 'A password deve ter pelo menos 6 caracteres.');
      return res.redirect(backToForm());
    }

    if (password !== confirmPassword) {
      req.flash('error', 'As passwords não coincidem.');
      return res.redirect(backToForm());
    }

    const existing = await Customer.findByEmail(email);
    if (existing) {
      // Conta feita com Google: em vez de um beco sem saída, encaminhar para
      // a forma de entrar que realmente funciona para esta pessoa.
      req.flash(
        'error',
        existing.google_id && !existing.password_hash
          ? 'Já existe uma conta com este email, criada com Google. Use "Entrar com Google".'
          : 'Email já registado. Use "Entrar" ou recupere a password.'
      );
      const q = returnToRaw ? `?returnTo=${encodeURIComponent(returnToRaw)}` : '';
      return res.redirect(`/account/login${q}`);
    }

    const customer = await Customer.createCustomer({
      email,
      password,
      firstName,
      lastName,
      phone: (req.body.phone || '').trim(),
    });
    await startCustomerSession(req, res, customer);
    const returnTo = safeReturnTo(returnToRaw);
    if (returnTo) return res.redirect(returnTo);
    res.redirect('/account/orders');
  } catch (err) {
    next(err);
  }
});

// ── Recuperação de password ───────────────────────────────────────────────────

router.get('/forgot-password', redirectIfLoggedIn, (req, res) => {
  res.render('modules/ecommerce/account-forgot-password', {
    title: 'Recuperar password',
    messages: req.flash(),
    mailerReady: mailer.isConfigured(),
  });
});

router.post('/forgot-password', authLimiter, redirectIfLoggedIn, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();

    if (!mailer.isConfigured()) {
      // Ser honesto em vez de mostrar um "enviámos" que nunca chega.
      req.flash(
        'error',
        'De momento não é possível enviar o email de recuperação. Contacte-nos por WhatsApp e resolvemos.'
      );
      return res.redirect('/account/forgot-password');
    }

    const customer = email ? await Customer.findByEmail(email) : null;

    // Resposta igual exista ou não a conta — senão esta página torna-se uma
    // forma de descobrir que emails estão registados na loja.
    if (customer) {
      const { token, expiresInMinutes } = await Customer.createPasswordResetToken(customer.id);
      const link = `${mailer.siteBaseUrl()}/account/reset-password/${token}`;
      try {
        await mailer.send({
          to: customer.email,
          subject: 'Recuperar a password — Gonzaga Art & Shine',
          text:
            `Recebemos um pedido para definir uma password nova na sua conta.\n\n` +
            `${link}\n\n` +
            `O link é válido durante ${expiresInMinutes} minutos e só pode ser usado uma vez.\n` +
            `Se não foi você que pediu, ignore este email — a sua password actual continua válida.`,
        });
      } catch (mailErr) {
        console.error('[account/forgot-password] Falha ao enviar email:', mailErr.message);
        req.flash('error', 'Não conseguimos enviar o email agora. Tente daqui a pouco.');
        return res.redirect('/account/forgot-password');
      }
    }

    req.flash('success', 'Se existir uma conta com esse email, enviámos um link para definir a password nova.');
    res.redirect('/account/login');
  } catch (err) {
    next(err);
  }
});

router.get('/reset-password/:token', redirectIfLoggedIn, async (req, res, next) => {
  try {
    const customer = await Customer.findByPasswordResetToken(req.params.token);
    if (!customer) {
      req.flash('error', 'Este link expirou ou já foi usado. Peça um novo.');
      return res.redirect('/account/forgot-password');
    }
    res.render('modules/ecommerce/account-reset-password', {
      title: 'Definir password nova',
      messages: req.flash(),
      token: req.params.token,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password/:token', authLimiter, redirectIfLoggedIn, async (req, res, next) => {
  try {
    const password = req.body.password || '';
    const confirmPassword = req.body.confirmPassword || '';

    if (password.length < 6) {
      req.flash('error', 'A password deve ter pelo menos 6 caracteres.');
      return res.redirect(`/account/reset-password/${req.params.token}`);
    }
    if (password !== confirmPassword) {
      req.flash('error', 'As passwords não coincidem.');
      return res.redirect(`/account/reset-password/${req.params.token}`);
    }

    const customer = await Customer.resetPasswordWithToken(req.params.token, password);
    if (!customer) {
      req.flash('error', 'Este link expirou ou já foi usado. Peça um novo.');
      return res.redirect('/account/forgot-password');
    }

    await startCustomerSession(req, res, customer);
    req.flash('success', 'Password actualizada. Já está na sua conta.');
    res.redirect('/account/orders');
  } catch (err) {
    next(err);
  }
});

router.get('/orders', requireCustomer, async (req, res, next) => {
  try {
    const orders = await Customer.getOrdersByEmail(req.session.customerEmail);
    res.render('modules/ecommerce/account-orders', {
      title: 'Os meus pedidos',
      orders,
      customerEmail: req.session.customerEmail,
      accountNavActive: 'orders',
      messages: req.flash(),
      formatOrderStatus,
      formatPaymentStatus,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:id', requireCustomer, async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (!orderId) {
      return res.redirect('/account/orders');
    }

    const order = await Customer.getOrderByIdForEmail(orderId, req.session.customerEmail);
    if (!order) {
      req.flash('error', 'Pedido não encontrado.');
      return res.redirect('/account/orders');
    }

    const items = await Customer.getOrderItems(orderId);

    res.render('modules/ecommerce/account-order-detail', {
      title: `Pedido ${order.order_number}`,
      order,
      items,
      customerEmail: req.session.customerEmail,
      accountNavActive: 'orders',
      formatOrderStatus,
      formatPaymentStatus,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', requireCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.session.customerId);
    if (!customer) {
      delete req.session.customerId;
      delete req.session.customerEmail;
      return res.redirect('/account/login');
    }

    res.render('modules/ecommerce/account-profile', {
      title: 'O meu perfil',
      customer,
      customerEmail: req.session.customerEmail,
      accountNavActive: 'profile',
      messages: req.flash(),
      canChangePassword: !!customer.password_hash,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/profile', requireCustomer, async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.session.customerId);
    if (!customer) {
      return res.redirect('/account/login');
    }

    const firstName = (req.body.firstName || '').trim();
    const lastName = (req.body.lastName || '').trim();

    if (!firstName || !lastName) {
      req.flash('error', 'Nome e apelido são obrigatórios.');
      return res.redirect('/account/profile');
    }

    await Customer.updateProfile(customer.id, {
      firstName,
      lastName,
      phone: (req.body.phone || '').trim(),
      billingAddressLine1: (req.body.billingAddressLine1 || '').trim(),
      billingCity: (req.body.billingCity || '').trim(),
      billingPostalCode: (req.body.billingPostalCode || '').trim(),
      billingCountry: (req.body.billingCountry || 'Portugal').trim(),
      shippingAddressLine1: (req.body.shippingAddressLine1 || '').trim(),
      shippingCity: (req.body.shippingCity || '').trim(),
      shippingPostalCode: (req.body.shippingPostalCode || '').trim(),
      shippingCountry: (req.body.shippingCountry || 'Portugal').trim(),
    });

    const newPassword = req.body.newPassword || '';
    const confirmNewPassword = req.body.confirmNewPassword || '';
    const currentPassword = req.body.currentPassword || '';

    if (newPassword || confirmNewPassword || currentPassword) {
      if (!customer.password_hash) {
        req.flash('error', 'Conta Google — não é possível alterar password aqui.');
        return res.redirect('/account/profile');
      }
      if (newPassword.length < 6) {
        req.flash('error', 'A nova password deve ter pelo menos 6 caracteres.');
        return res.redirect('/account/profile');
      }
      if (newPassword !== confirmNewPassword) {
        req.flash('error', 'As passwords novas não coincidem.');
        return res.redirect('/account/profile');
      }
      if (!(await Customer.verifyPassword(customer, currentPassword))) {
        req.flash('error', 'Password actual incorrecta.');
        return res.redirect('/account/profile');
      }
      await Customer.changePassword(customer.id, newPassword);
    }

    req.flash('success', 'Perfil actualizado com sucesso.');
    res.redirect('/account/profile');
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  delete req.session.customerId;
  delete req.session.customerEmail;
  res.redirect('/');
});

// ── Google OAuth ──────────────────────────────────────────────────────────────

router.get(
  '/auth/google',
  (req, res, next) => {
    if (req.query.returnTo && req.query.returnTo.startsWith('/')) {
      req.session.oauthReturnTo = req.query.returnTo;
    }
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/account/login', session: false }),
  async (req, res) => {
    try {
      console.log('[Google OAuth] Callback received, req.user:', req.user);
      
      const customer = req.user;
      await startCustomerSession(req, res, customer);

      const returnTo = safeReturnTo(req.session.oauthReturnTo);
      delete req.session.oauthReturnTo;

      console.log('[Google OAuth] Redirecting to:', returnTo || '/account/orders');

      if (returnTo) return res.redirect(returnTo);
      res.redirect('/account/orders');
    } catch (err) {
      console.error('[Google OAuth] Callback error:', err);
      req.flash('error', 'Erro ao autenticar com Google. Tente novamente.');
      res.redirect('/account/login');
    }
  }
);

module.exports = router;
