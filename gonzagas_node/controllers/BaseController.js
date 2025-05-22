const { validationResult } = require('express-validator');

class BaseController {
  constructor(model) {
    this.model = model;
  }

  // Success response helper
  success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data
    });
  }

  // Error response helper
  error(res, message, statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors ? errors.array() : null
    });
  }

  // Validate request helper
  validateRequest(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new Error('Validation failed');
    }
  }

  // CRUD Operations
  async getAll(req, res) {
    try {
      const data = await this.model.getAll();
      return this.success(res, data);
    } catch (error) {
      console.error(`Error in ${this.model.name} getAll:`, error);
      return this.error(res, 'Failed to fetch records', 500);
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await this.model.getById(id);
      
      if (!data) {
        return this.error(res, 'Record not found', 404);
      }
      
      return this.success(res, data);
    } catch (error) {
      console.error(`Error in ${this.model.name} getById:`, error);
      return this.error(res, 'Failed to fetch record', 500);
    }
  }

  async create(req, res) {
    try {
      this.validateRequest(req);
      const data = await this.model.create(req.body);
      return this.success(res, data, 201);
    } catch (error) {
      console.error(`Error in ${this.model.name} create:`, error);
      if (error.message === 'Validation failed') {
        return this.error(res, 'Validation error', 400, validationResult(req));
      }
      return this.error(res, 'Failed to create record', 500);
    }
  }

  async update(req, res) {
    try {
      this.validateRequest(req);
      const { id } = req.params;
      const data = await this.model.update(id, req.body);
      
      if (!data) {
        return this.error(res, 'Record not found', 404);
      }
      
      return this.success(res, data);
    } catch (error) {
      console.error(`Error in ${this.model.name} update:`, error);
      if (error.message === 'Validation failed') {
        return this.error(res, 'Validation error', 400, validationResult(req));
      }
      return this.error(res, 'Failed to update record', 500);
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const success = await this.model.delete(id);
      
      if (!success) {
        return this.error(res, 'Record not found', 404);
      }
      
      return this.success(res, { id });
    } catch (error) {
      console.error(`Error in ${this.model.name} delete:`, error);
      return this.error(res, 'Failed to delete record', 500);
    }
  }
}

module.exports = BaseController;
