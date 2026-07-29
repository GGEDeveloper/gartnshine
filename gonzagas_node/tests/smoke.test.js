const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');

afterAll(async () => {
  await pool.end();
});

describe('Rotas públicas', () => {
  test('GET / responde 200', async () => {
    await request(app).get('/').expect(200);
  });

  test('GET /robots.txt responde 200 e referencia o sitemap', async () => {
    const res = await request(app).get('/robots.txt').expect(200);
    expect(res.text).toMatch(/Sitemap:/);
  });

  test('GET /sitemap.xml responde 200 com XML válido e URLs', async () => {
    const res = await request(app).get('/sitemap.xml').expect(200);
    expect(res.text).toMatch(/<urlset/);
    expect(res.text).toMatch(/<url>/);
  });

  test('GET /feed/products.xml responde 200 com feed do Merchant Center', async () => {
    const res = await request(app).get('/feed/products.xml').expect(200);
    expect(res.text).toMatch(/<rss/);
    expect(res.text).toMatch(/base\.google\.com\/ns\/1\.0/);
  });
});

describe('Admin (autenticado)', () => {
  let agent;

  beforeAll(() => {
    agent = request.agent(app);
  });

  test('GET /admin/login (sem sessão) responde 200', async () => {
    await agent.get('/admin/login').expect(200);
  });

  test('login com credenciais válidas redireciona (302)', async () => {
    await agent
      .post('/admin/login')
      .type('form')
      .send({ email: 'gonzaga@artnshine.pt', password: 'covil' })
      .expect(302);
  });

  test('GET /admin/reports (autenticado) responde 200 com produtos e margens', async () => {
    const res = await agent.get('/admin/reports').expect(200);
    // Regressão: garante que a tabela de margens tem linhas reais, não
    // só a 200 "vazia" que um erro de SQL silenciado devolveria.
    expect(res.text).toMatch(/Margem €/);
    expect((res.text.match(/<tr/g) || []).length).toBeGreaterThan(1);
  });

  test('GET /admin/dashboard (autenticado) responde 200', async () => {
    await agent.get('/admin/dashboard').expect(200);
  });

  test('GET /admin (sem sessão, agente novo) redireciona para login', async () => {
    await request(app).get('/admin').expect(302);
  });
});
