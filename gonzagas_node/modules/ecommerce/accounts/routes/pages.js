const express = require('express');
const router = express.Router();
const { passport } = require('../config/passport');
const Customer = require('../models/Customer');
const { formatOrderStatus, formatPaymentStatus } = require('../utils/orderStatus');
const { requireEcommerceEnabled } = require('../../cart/middleware/requireEcommerceEnabled');

router.use(requireEcommerceEnabled);

function requireCustomer(req, res, next) {
  if (!req.session.customerId) {
    return res.redirect('/account/login');
  }
  next();
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

router.post('/login', redirectIfLoggedIn, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const customer = await Customer.findByEmail(email);
    if (!customer || !(await Customer.verifyPassword(customer, req.body.password))) {
      req.flash('error', 'Email ou password incorrectos.');
      const q = req.body.returnTo ? `?returnTo=${encodeURIComponent(req.body.returnTo)}` : '';
      return res.redirect(`/account/login${q}`);
    }
    req.session.customerId = customer.id;
    req.session.customerEmail = customer.email;
    const returnTo = req.body.returnTo || req.query.returnTo;
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      return res.redirect(returnTo);
    }
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

router.post('/register', redirectIfLoggedIn, async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const confirmPassword = req.body.confirmPassword || '';
    const firstName = (req.body.firstName || '').trim();
    const lastName = (req.body.lastName || '').trim();

    if (!email || !firstName || !lastName) {
      req.flash('error', 'Preencha todos os campos obrigatórios.');
      return res.redirect('/account/register');
    }

    if (password.length < 6) {
      req.flash('error', 'A password deve ter pelo menos 6 caracteres.');
      return res.redirect('/account/register');
    }

    if (password !== confirmPassword) {
      req.flash('error', 'As passwords não coincidem.');
      return res.redirect('/account/register');
    }

    const existing = await Customer.findByEmail(email);
    if (existing) {
      req.flash('error', 'Email já registado.');
      return res.redirect('/account/register');
    }

    const customer = await Customer.createCustomer({
      email,
      password,
      firstName,
      lastName,
      phone: (req.body.phone || '').trim(),
    });
    req.session.customerId = customer.id;
    req.session.customerEmail = customer.email;
    const returnTo = req.body.returnTo || req.query.returnTo;
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      return res.redirect(returnTo);
    }
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
      req.session.customerId = customer.id;
      req.session.customerEmail = customer.email;

      const returnTo = req.session.oauthReturnTo;
      delete req.session.oauthReturnTo;

      console.log('[Google OAuth] Redirecting to:', returnTo || '/account/orders');

      if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        return res.redirect(returnTo);
      }
      res.redirect('/account/orders');
    } catch (err) {
      console.error('[Google OAuth] Callback error:', err);
      req.flash('error', 'Erro ao autenticar com Google. Tente novamente.');
      res.redirect('/account/login');
    }
  }
);

module.exports = router;
