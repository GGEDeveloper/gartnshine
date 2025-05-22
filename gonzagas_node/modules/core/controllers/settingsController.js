const Settings = require('../models/Settings');

class SettingsController {
  /**
   * @route   GET /api/settings
   * @desc    Obter todas as configurações
   * @access  Private/Admin
   */
  static async getSettings(req, res) {
    try {
      const settings = await Settings.findAll();
      
      // Transforma o array de configurações em um objeto
      const settingsObj = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      res.json(settingsObj);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  /**
   * @route   PUT /api/settings
   * @desc    Atualizar configurações
   * @access  Private/Admin
   */
  static async updateSettings(req, res) {
    try {
      const settings = req.body;
      const updates = [];
      
      // Para cada configuração fornecida, atualiza no banco de dados
      for (const [key, value] of Object.entries(settings)) {
        updates.push(
          Settings.update(
            { value },
            { where: { key } }
          )
        );
      }
      
      // Aguarda todas as atualizações serem concluídas
      await Promise.all(updates);
      
      res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = SettingsController;
