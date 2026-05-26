const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
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
    const customer = await Customer.findByEmail(req.body.email);
    if (!customer || !(await Customer.verifyPassword(customer, req.body.password))) {
      req.flash('error', 'Email ou password incorrectos.');
      return res.redirect('/account/login');
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
    const existing = await Customer.findByEmail(req.body.email);
    if (existing) {
      req.flash('error', 'Email já registado.');
      return res.redirect('/account/register');
    }
    const customer = await Customer.createCustomer({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
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
    });
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res) => {
  delete req.session.customerId;
  delete req.session.customerEmail;
  res.redirect('/');
});

module.exports = router;
