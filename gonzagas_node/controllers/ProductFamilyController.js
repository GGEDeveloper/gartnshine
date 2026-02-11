const ProductFamily = require('../models/ProductFamily');
const ProductColor = require('../models/ProductColor');

let getColorsSafe = async () => {
  try {
    return await ProductColor.getAll();
  } catch (e) {
    return [];
  }
};

exports.listFamilies = async (req, res) => {
  try {
    const families = await ProductFamily.getAllWithProductCount();
    const { categories, subcategories } = await ProductFamily.getCategoriesWithSubcategories().catch(() => ({ categories: families, subcategories: [] }));
    const colors = await getColorsSafe();
    res.render('admin/product-families/index', {
      title: 'Categorias e Cores',
      families,
      categories,
      subcategories,
      colors,
      layout: 'admin/layouts/main',
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (error) {
    console.error('Error fetching product families:', error);
    req.flash('error_msg', 'Falha ao carregar categorias.');
    res.redirect('/admin/dashboard');
  }
};

exports.showAddForm = async (req, res) => {
  try {
    const families = await ProductFamily.getAll();
    const categories = families.filter(f => !f.parent_id);
    res.render('admin/product-families/family-form', {
      title: 'Nova Categoria',
      family: {},
      isNew: true,
      categories,
      layout: 'admin/layouts/main',
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user
    });
  } catch (error) {
    console.error('Error showing add form:', error);
    req.flash('error_msg', 'Falha ao carregar o formulário.');
    res.redirect('/admin/product-families');
  }
};

exports.createFamily = async (req, res) => {
  try {
    const { name, description, code, parent_id } = req.body;
    if (!name || !code) {
      req.flash('error_msg', 'Nome e Código são obrigatórios.');
      return res.redirect('/admin/product-families/create');
    }
    await ProductFamily.create({ name, description, code, parent_id: parent_id || null });
    req.flash('success_msg', 'Categoria criada com sucesso.');
    res.redirect('/admin/product-families');
  } catch (error) {
    console.error('Error creating product family:', error);
    req.flash('error_msg', 'Falha ao criar categoria. ' + (error.message || ''));
    res.redirect('/admin/product-families/create');
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const family = await ProductFamily.getById(familyId);
    if (!family) {
      req.flash('error_msg', 'Categoria não encontrada.');
      return res.redirect('/admin/product-families');
    }
    const families = await ProductFamily.getAll();
    const categories = families.filter(f => !f.parent_id && f.id !== familyId);
    res.render('admin/product-families/family-form', {
      title: 'Editar Categoria',
      family,
      isNew: false,
      categories,
      layout: 'admin/layouts/main',
      breadcrumb: res.locals.breadcrumb || [],
      user: req.session?.user || req.user
    });
  } catch (error) {
    console.error('Error showing edit form:', error);
    req.flash('error_msg', 'Falha ao carregar o formulário.');
    res.redirect('/admin/product-families');
  }
};

exports.updateFamily = async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const { name, description, code, parent_id } = req.body;
    if (!name || !code) {
      req.flash('error_msg', 'Nome e Código são obrigatórios.');
      return res.redirect(`/admin/product-families/edit/${familyId}`);
    }
    await ProductFamily.update(familyId, { name, description, code, parent_id: parent_id || null });
    req.flash('success_msg', 'Categoria atualizada com sucesso.');
    res.redirect('/admin/product-families');
  } catch (error) {
    console.error('Error updating product family:', error);
    req.flash('error_msg', 'Falha ao atualizar categoria. ' + (error.message || ''));
    res.redirect(`/admin/product-families/edit/${familyId}`);
  }
};

exports.deleteFamily = async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    await ProductFamily.delete(familyId);
    req.flash('success_msg', 'Categoria eliminada com sucesso.');
  } catch (error) {
    console.error('Error deleting product family:', error);
    req.flash('error_msg', 'Não foi possível eliminar. Pode estar em uso por produtos.');
  }
  res.redirect('/admin/product-families');
};

// Colors
exports.createColor = async (req, res) => {
  try {
    const { name, hex_code, sort_order } = req.body;
    if (!name || !name.trim()) {
      req.flash('error_msg', 'Nome da cor é obrigatório.');
      return res.redirect('/admin/product-families');
    }
    await ProductColor.create({ name: name.trim(), hex_code: hex_code?.trim() || null, sort_order: parseInt(sort_order, 10) || 0 });
    req.flash('success_msg', 'Cor adicionada com sucesso.');
  } catch (error) {
    console.error('Error creating color:', error);
    req.flash('error_msg', 'Falha ao adicionar cor. ' + (error.message || ''));
  }
  res.redirect('/admin/product-families');
};

exports.updateColor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, hex_code, sort_order, is_active } = req.body;
    await ProductColor.update(id, {
      name: name?.trim(),
      hex_code: hex_code?.trim() || null,
      sort_order: parseInt(sort_order, 10),
      is_active: is_active === '1' || is_active === true
    });
    req.flash('success_msg', 'Cor atualizada.');
  } catch (error) {
    console.error('Error updating color:', error);
    req.flash('error_msg', 'Falha ao atualizar cor.');
  }
  res.redirect('/admin/product-families');
};

exports.deleteColor = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await ProductColor.delete(id);
    req.flash('success_msg', 'Cor eliminada.');
  } catch (error) {
    console.error('Error deleting color:', error);
    req.flash('error_msg', 'Falha ao eliminar cor.');
  }
  res.redirect('/admin/product-families');
};
