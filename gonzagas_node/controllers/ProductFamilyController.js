const ProductFamily = require('../models/ProductFamily');
const ProductColor = require('../models/ProductColor');
const { listGalleryImages } = require('../utils/galleryLibrary');

let getColorsSafe = async () => {
  try {
    return await ProductColor.getAll();
  } catch (e) {
    return [];
  }
};

exports.listFamilies = async (req, res) => {
  try {
    const familiesTree = await ProductFamily.getTreeWithProductCount();
    const colors = await getColorsSafe();
    res.render('admin/product-families/index', {
      title: 'Categorias e Cores',
      familiesTree,
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

/** Build flat list with depth for parent select (qualquer nível: cat, subcat, subsubcat...) */
function buildParentOptions(tree, depth = 0) {
  const out = [];
  for (const node of tree) {
    out.push({ ...node, depth });
    if (node.children?.length) out.push(...buildParentOptions(node.children, depth + 1));
  }
  return out;
}

exports.showAddForm = async (req, res) => {
  try {
    const flat = await ProductFamily.getAll();
    const tree = ProductFamily.buildTree(flat);
    const parentOptions = buildParentOptions(tree);
    res.render('admin/product-families/family-form', {
      title: 'Nova Categoria',
      family: {},
      isNew: true,
      parentOptions,
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
    const family = await ProductFamily.getByIdWithProductCount(familyId);
    if (!family) {
      req.flash('error_msg', 'Categoria não encontrada.');
      return res.redirect('/admin/product-families');
    }
    const flat = await ProductFamily.getAll();
    const excludeIds = ProductFamily.getDescendantIds(flat, familyId);
    const tree = ProductFamily.buildTree(flat.filter(f => !excludeIds.includes(f.id)));
    const parentOptions = buildParentOptions(tree);
    const galleryImages = await listGalleryImages();
    res.render('admin/product-families/family-form', {
      title: 'Editar Categoria',
      family,
      isNew: false,
      parentOptions,
      galleryImages,
      canEditCode: Number(family.product_count || 0) === 0,
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
    if (!name) {
      req.flash('error_msg', 'Nome é obrigatório.');
      return res.redirect(`/admin/product-families/edit/${familyId}`);
    }
    const family = await ProductFamily.getByIdWithProductCount(familyId);
    if (!family) {
      req.flash('error_msg', 'Categoria não encontrada.');
      return res.redirect('/admin/product-families');
    }
    const productCount = Number(family.product_count || 0);
    const effectiveCode = productCount === 0 && code && code.trim() ? code.trim() : family.code;
    if (!effectiveCode) {
      req.flash('error_msg', 'Código é obrigatório.');
      return res.redirect(`/admin/product-families/edit/${familyId}`);
    }
    await ProductFamily.update(familyId, { name, description, code: effectiveCode, parent_id: parent_id || null });
    req.flash('success_msg', 'Categoria atualizada com sucesso.');
    res.redirect('/admin/product-families');
  } catch (error) {
    console.error('Error updating product family:', error);
    req.flash('error_msg', 'Falha ao atualizar categoria. ' + (error.message || ''));
    res.redirect(`/admin/product-families/edit/${familyId}`);
  }
};

/** POST /admin/product-families/edit/:id/hero-image — escolher da galeria, enviar nova, ou remover. */
exports.updateHeroImage = async (req, res) => {
  const familyId = parseInt(req.params.id, 10);
  const backToForm = `/admin/product-families/edit/${familyId}`;
  try {
    const family = await ProductFamily.getById(familyId);
    if (!family) {
      req.flash('error_msg', 'Categoria não encontrada.');
      return res.redirect('/admin/product-families');
    }

    let heroImagePath;
    if (req.file) {
      heroImagePath = `/media/gallery/${req.file.filename}`;
    } else if (req.body.hero_image_existing) {
      const galleryImages = await listGalleryImages();
      const match = galleryImages.find((img) => img.path === req.body.hero_image_existing);
      if (!match) {
        req.flash('error_msg', 'Imagem selecionada não foi encontrada na galeria.');
        return res.redirect(backToForm);
      }
      heroImagePath = match.path;
    } else if (req.body.remove_hero_image === '1') {
      heroImagePath = null;
    } else {
      req.flash('error_msg', 'Escolha uma imagem existente ou envie uma nova.');
      return res.redirect(backToForm);
    }

    await ProductFamily.updateHeroImage(familyId, heroImagePath);
    req.flash('success_msg', heroImagePath
      ? 'Imagem de destaque atualizada.'
      : 'Imagem de destaque removida.');
    res.redirect(backToForm);
  } catch (error) {
    console.error('Error updating family hero image:', error);
    req.flash('error_msg', 'Falha ao atualizar a imagem de destaque. ' + (error.message || ''));
    res.redirect(backToForm);
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
