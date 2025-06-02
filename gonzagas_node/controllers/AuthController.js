console.log('--- LOADING controllers/AuthController.js ---');
const BaseController = require('./BaseController');
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcryptjs');

class AuthController extends BaseController {
  constructor() {
    super({}); // Pass an empty object or a relevant model if BaseController expects one
    this.User = User;
  }

  // Show the login form
  async showLoginForm(req, res) {
    console.log('>>> AuthController.showLoginForm called');
    try {
      // Check if user is already logged in, if so, redirect to dashboard
      if (req.session.user) {
        return res.redirect('/admin/'); // Redirect to the base admin path
      }
      res.render('admin/auth/login', {
        layout: 'admin/layouts/auth', // Assuming an auth-specific layout
        title: 'Admin Login',
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg')
      });
    } catch (error) {
      console.error('Error showing login form:', error);
      req.flash('error_msg', 'Error displaying login page.');
      res.redirect('/'); // Or some other appropriate error page or home
    }
  }

  // Process login attempt
  async login(req, res) {
    console.log('>>> AuthController.login called - Email:', req.body.email);
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error_msg', 'Please provide both email and password.');
        return res.redirect('/admin/login');
      }

      const user = await this.User.findByEmail(email);
            console.log('[AUTH CONTROLLER] User object received from User.findByEmail:', JSON.stringify(user, null, 2));
            console.log('[AUTH CONTROLLER] User password field from received object:', user ? user.password : 'User object is null/undefined'); // Assuming User model has findByEmail
      if (!user) {
        req.flash('error_msg', 'Invalid credentials.');
        return res.redirect('/admin/login');
      }

      const isMatch = await bcrypt.compare(password, user.password); // Use user.password, which should contain the hash from DB
      if (!isMatch) {
        req.flash('error_msg', 'Invalid credentials.');
        return res.redirect('/admin/login');
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          req.flash('error_msg', 'Login failed. Please try again.');
          return res.redirect('/admin/login');
        }
        // Store user information in session (excluding sensitive data like password)
        req.session.user = {
          id: user.id,
          username: user.name, // Corrected from user.username to user.name based on User model structure
          email: user.email,
          role: user.role // Corrected from user.role_id to user.role to store the role name string
          // Add any other necessary user details to the session
        };
        req.flash('success_msg', 'You are now logged in.');
        res.redirect('/admin/'); // Redirect to the base admin path
      });

    } catch (error) {
      console.error('Error during login:', error);
      req.flash('error_msg', 'Login failed. Please try again.');
      res.redirect('/admin/login');
    }
  }

  // Process logout
  async logout(req, res) {
    console.log('>>> AuthController.logout called');
    try {
      // Set flash message before destroying the session
      req.flash('success_msg', 'You have been logged out.');

      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          // If session destruction fails, the flash message might not be available
          // So, we might need a different way to communicate this error or just redirect
          // For now, let's keep the error flash for the redirect page if possible, or rely on logs.
          // req.flash('error_msg', 'Logout failed. Please try again.'); // This might not work if session is gone
          return res.redirect('/admin/dashboard'); // Or wherever appropriate
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/');
      });
    } catch (error) {
      console.error('Error during logout:', error);
      req.flash('error_msg', 'Logout failed. Please try again.');
      res.redirect('/admin/dashboard'); // Or wherever appropriate
    }
  }
}

module.exports = new AuthController();
