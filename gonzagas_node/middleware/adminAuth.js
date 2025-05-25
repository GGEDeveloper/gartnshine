function adminSessionRequired(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Faça login como administrador para aceder.');
  return res.redirect('/admin/login');
}

module.exports = adminSessionRequired;
