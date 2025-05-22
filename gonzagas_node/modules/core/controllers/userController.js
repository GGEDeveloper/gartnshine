const UserService = require('../services/userService');

class UserController {
  /**
   * @route   GET /api/users
   * @desc    Obter todos os usuários
   * @access  Private/Admin
   */
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.findAll();
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @route   GET /api/users/:id
   * @desc    Obter usuário por ID
   * @access  Private/Admin
   */
  static async getUserById(req, res) {
    try {
      const user = await UserService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @route   POST /api/users
   * @desc    Criar um novo usuário
   * @access  Private/Admin
   */
  static async createUser(req, res) {
    try {
      const newUser = await UserService.create(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      if (error.message === 'Email já está em uso') {
        return res.status(400).json({ message: error.message });
      }
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @route   PUT /api/users/:id
   * @desc    Atualizar um usuário
   * @access  Private/Admin
   */
  static async updateUser(req, res) {
    try {
      const updatedUser = await UserService.update(req.params.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @route   DELETE /api/users/:id
   * @desc    Excluir um usuário
   * @access  Private/Admin
   */
  static async deleteUser(req, res) {
    try {
      await UserService.delete(req.params.id);
      res.json({ message: 'Usuário removido com sucesso' });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ message: error.message });
      }
      console.error('Erro ao remover usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = UserController;
