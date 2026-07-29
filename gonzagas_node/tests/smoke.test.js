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

  test('GET /collections responde 200 com itens da galeria curada', async () => {
    const res = await request(app).get('/collections').expect(200);
    // Regressão: a galeria passou a vir da BD (gallery_items); um erro de
    // query devolveria 200 com o estado vazio "Coleção em Preparação".
    expect(res.text).toMatch(/class="gallery-item"/);
  });

  test('GET /collection/:id responde 200 com os produtos da família', async () => {
    const res = await request(app).get('/collection/1').expect(200);
    expect(res.text).toMatch(/collection-header/);
    expect(res.text).toMatch(/product-card/);
  });

  test('GET /colecao/:slug inexistente responde 404, não 500', async () => {
    await request(app).get('/colecao/nao-existe-de-certeza').expect(404);
  });
});

describe('Coleções curadas', () => {
  const Collection = require('../models/Collection');
  let collectionId;

  afterAll(async () => {
    if (collectionId) await Collection.delete(collectionId);
  });

  test('criar coleção gera slug sem acentos e único', async () => {
    collectionId = await Collection.create({ name: 'Coleção de Teste Automático' });
    const c = await Collection.getById(collectionId);
    expect(c.slug).toBe('colecao-de-teste-automatico');
  });

  test('coleção sem peças não aparece ao público', async () => {
    const actives = await Collection.getActiveWithCounts();
    expect(actives.some((c) => c.id === collectionId)).toBe(false);
  });

  test('acrescentar peças torna a coleção visível e a página responde 200', async () => {
    const candidates = await Collection.getCandidateProducts(collectionId, { limit: 2 });
    expect(candidates.length).toBeGreaterThan(0);

    await Collection.addProducts(collectionId, candidates.map((p) => p.id));
    const products = await Collection.getProducts(collectionId);
    expect(products.length).toBe(candidates.length);

    const c = await Collection.getById(collectionId);
    const res = await request(app).get(`/colecao/${c.slug}`).expect(200);
    expect(res.text).toMatch(/product-card/);
  });

  test('acrescentar a mesma peça duas vezes não duplica', async () => {
    const before = (await Collection.getProducts(collectionId)).length;
    const existing = await Collection.getProducts(collectionId);
    await Collection.addProducts(collectionId, [existing[0].id]);
    const after = (await Collection.getProducts(collectionId)).length;
    expect(after).toBe(before);
  });

  test('coleção oculta deixa de estar acessível', async () => {
    const c = await Collection.getById(collectionId);
    await Collection.updateContent(collectionId, {
      name: c.name, description: null, seoTitle: null, seoDescription: null, isActive: false
    });
    await request(app).get(`/colecao/${c.slug}`).expect(404);

    // repor para os testes seguintes/limpeza
    await Collection.updateContent(collectionId, {
      name: c.name, description: null, seoTitle: null, seoDescription: null, isActive: true
    });
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
