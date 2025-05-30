console.log('--- LOADING middleware/authMiddleware.js ---');
const User = require('../models/User'); // Assuming User model might be needed for role checks

// Middleware to ensure the user is authenticated and is an admin
const adminSessionRequired = async (req, res, next) => {
  if (req.session && req.session.user) {
    // Optional: Check for admin role if you have role-based access control
    // const user = await User.findById(req.session.user.id);
    // if (user && user.role === 'admin') { // Or whatever your admin role identifier is
    //   return next();
    // }
    // For now, just checking if user session exists
    return next();
  } else {
    req.flash('error_msg', 'Please log in to view this resource.');
    res.redirect('/admin/login');
  }
};

// Middleware to ensure the user is a guest (not logged in)
const guestSessionRequired = (req, res, next) => {
  console.log('--- guestSessionRequired: ENTERED ---');
  console.log('--- guestSessionRequired: req.session.user is:', req.session.user);
  if (req.session && req.session.user) {
    // If user is logged in, redirect them from guest-only pages (like login page)
    console.log('--- guestSessionRequired: User IS logged in. Redirecting to /admin/dashboard ---');
    res.redirect('/admin/dashboard'); 
  } else {
    console.log('--- guestSessionRequired: User is NOT logged in. Calling next() ---');
    next();
  }
};

// Middleware to check for specific roles (example)
const roleRequired = (roles) => {
  return async (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash('error_msg', 'Please log in.');
      return res.redirect('/admin/login');
    }

    // Ensure roles is an array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    // Assuming user object in session has a 'role' property (e.g., user.role_id or user.role_name)
    // And assuming your User model can fetch role details or you store role name in session
    const userRole = req.session.user.role; // Adjust based on your session.user structure

    if (requiredRoles.includes(userRole)) {
      next();
    } else {
      req.flash('error_msg', 'You do not have permission to view this resource.');
      res.status(403).redirect(req.headers.referer || '/admin/dashboard'); // Or render a 403 page
    }
  };
};

module.exports = {
  adminSessionRequired,
  guestSessionRequired,
  roleRequired
};
