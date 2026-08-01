/**
 * Envio de email da loja.
 *
 * O SMTP é opcional por configuração: sem `SMTP_HOST` definido, `isConfigured()`
 * devolve false e quem chama decide o que dizer ao utilizador. Isto é
 * deliberado — é preferível uma mensagem honesta ("de momento não conseguimos
 * enviar o email, fale connosco") do que um ecrã de sucesso para um email que
 * nunca sai.
 */

const CONFIG_KEYS = ['SMTP_HOST'];

function isConfigured() {
  return CONFIG_KEYS.every((k) => !!process.env[k]);
}

function buildTransport() {
  const nodemailer = require('nodemailer');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

/**
 * Envia um email. Devolve true se saiu, false se o SMTP não está configurado.
 * Erros reais de envio são propagados — quem chama que decida.
 */
async function send({ to, subject, text, html }) {
  if (!isConfigured()) {
    console.warn(`[mailer] SMTP não configurado — email "${subject}" não enviado para ${to}`);
    return false;
  }

  const transporter = buildTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
  return true;
}

/** Base do site para montar links absolutos nos emails. */
function siteBaseUrl() {
  return (process.env.BASE_URL || process.env.PUBLIC_URL || 'https://artnshine.pt').replace(/\/$/, '');
}

module.exports = { isConfigured, send, siteBaseUrl };
