/**
 * Painel admin: Clientes registados + Utilizadores do backoffice.
 * Rotas só de leitura — não expõe nenhuma acção destrutiva.
 */

const express = require('express');
const router = express.Router();
const adminCustomers = require('../services/adminCustomersService');
const { adminSessionRequired } = require('../../../../middleware/authMiddleware');

router.use(adminSessionRequired);

router.get('/', async (req, res, next) => {
  try {
    const [{ customers, total, page, perPage, pages, missingTable }, stats, adminUsers] = await Promise.all([
      adminCustomers.listCustomers({
        search: req.query.search,
        page: req.query.page,
        sort: req.query.sort,
      }),
      adminCustomers.getCustomerStats(),
      adminCustomers.listAdminUsers(),
    ]);

    res.render('admin/customers/index', {
      title: 'Clientes e Utilizadores',
      customers,
      total,
      page,
      perPage,
      pages,
      missingTable,
      stats,
      adminUsers,
      filters: {
        search: req.query.search || '',
        sort: req.query.sort || 'recent',
        tab: req.query.tab === 'users' ? 'users' : 'customers',
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(404).render('error', { title: '404', message: 'Cliente não encontrado', layout: false });

    const detail = await adminCustomers.getCustomerDetail(id);
    if (!detail) {
      return res.status(404).render('error', { title: '404', message: 'Cliente não encontrado', layout: false });
    }

    res.render('admin/customers/detail', {
      title: detail.customer.display_name || detail.customer.email || `Cliente #${id}`,
      customer: detail.customer,
      orders: detail.orders,
      carts: detail.carts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
