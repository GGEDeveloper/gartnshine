// /home/mike/Documents/gonzagas/gonzagas_node/controllers/ProductFamilyController.js
const ProductFamily = require('../models/ProductFamily'); // Assuming model path

// Display a list of all product families
exports.listFamilies = async (req, res) => {
  try {
    const families = await ProductFamily.getAll(); // Or your equivalent method
    res.render('admin/product-families/index', {
      title: 'Product Families',
      families,
      layout: 'admin/layouts/main', // Specify the main admin layout
      breadcrumb: [
        { name: 'Home', url: '/admin/dashboard' },
        { name: 'Product Families' }
      ]
    });
  } catch (error) {
    console.error('Error fetching product families:', error);
    req.flash('error_msg', 'Failed to load product families.');
    res.redirect('/admin/dashboard');
  }
};

// Show the form for adding a new product family
exports.showAddForm = (req, res) => {
  res.render('admin/product-families/family-form', {
    title: 'Add New Product Family',
    family: {}, // Empty object for a new family
    isNew: true,
    layout: 'admin/layouts/main',
    breadcrumb: [
      { name: 'Home', url: '/admin/dashboard' },
      { name: 'Product Families', url: '/admin/product-families' },
      { name: 'Add New' }
    ]
  });
};

// Process the submission of the add form
exports.createFamily = async (req, res) => {
  try {
    const { name, description, code } = req.body; // Assuming 'name', 'description', 'code' fields
    // Add validation as needed
    if (!name || !code) {
      req.flash('error_msg', 'Name and Code are required.');
      return res.render('admin/product-families/family-form', {
        title: 'Add New Product Family',
        family: req.body, // Send back the entered data
        isNew: true,
        layout: 'admin/layouts/main',
        breadcrumb: [
          { name: 'Home', url: '/admin/dashboard' },
          { name: 'Product Families', url: '/admin/product-families' },
          { name: 'Add New' }
        ],
        error_msg: req.flash('error_msg') // Pass along the flash message
      });
    }
    await ProductFamily.create({ name, description, code }); // Or your equivalent method
    req.flash('success_msg', 'Product family added successfully.');
    res.redirect('/admin/product-families');
  } catch (error) {
    console.error('Error creating product family:', error);
    req.flash('error_msg', 'Failed to add product family. ' + error.message);
    res.redirect('/admin/product-families/add');
  }
};

// Show the form for editing an existing product family
exports.showEditForm = async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const family = await ProductFamily.getById(familyId); // Or your equivalent method

    if (!family) {
      req.flash('error_msg', 'Product family not found.');
      return res.redirect('/admin/product-families');
    }

    res.render('admin/product-families/family-form', {
      title: 'Edit Product Family',
      family,
      isNew: false,
      layout: 'admin/layouts/main',
      breadcrumb: [
        { name: 'Home', url: '/admin/dashboard' },
        { name: 'Product Families', url: '/admin/product-families' },
        { name: 'Edit' }
      ]
    });
  } catch (error) {
    console.error('Error fetching product family for edit:', error);
    req.flash('error_msg', 'Failed to load product family for editing.');
    res.redirect('/admin/product-families');
  }
};

// Process the submission of the edit form
exports.updateFamily = async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const { name, description, code } = req.body;
    // Add validation as needed
    if (!name || !code) {
      req.flash('error_msg', 'Name and Code are required.');
      // Fetch the family again to ensure we have its ID for the form action
      const family = await ProductFamily.getById(familyId);
      return res.render('admin/product-families/family-form', {
        title: 'Edit Product Family',
        family: { ...family, ...req.body }, // Merge original with submitted data
        isNew: false,
        layout: 'admin/layouts/main',
        breadcrumb: [
          { name: 'Home', url: '/admin/dashboard' },
          { name: 'Product Families', url: '/admin/product-families' },
          { name: 'Edit' }
        ],
        error_msg: req.flash('error_msg') // Pass along the flash message
      });
    }
    await ProductFamily.update(familyId, { name, description, code }); // Or your equivalent method
    req.flash('success_msg', 'Product family updated successfully.');
    res.redirect('/admin/product-families');
  } catch (error) {
    console.error('Error updating product family:', error);
    req.flash('error_msg', 'Failed to update product family. ' + error.message);
    res.redirect(`/admin/product-families/edit/${familyId}`);
  }
};

// Delete a product family
exports.deleteFamily = async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    // Add any checks here, e.g., if families are associated with products
    await ProductFamily.delete(familyId); // Or your equivalent method
    req.flash('success_msg', 'Product family deleted successfully.');
  } catch (error) {
    console.error('Error deleting product family:', error);
    req.flash('error_msg', 'Failed to delete product family. It might be in use.');
  }
  res.redirect('/admin/product-families');
};
