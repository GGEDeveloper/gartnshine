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

  test('GET /galeria responde 200 com itens da galeria curada', async () => {
    const res = await request(app).get('/galeria').expect(200);
    // Regressão: a galeria passou a vir da BD (gallery_items); um erro de
    // query devolveria 200 com o estado vazio "Coleção em Preparação".
    expect(res.text).toMatch(/class="gallery-item"/);
  });

  test('GET /categoria/:slug responde 200 com os produtos da categoria', async () => {
    const res = await request(app).get('/categoria/aneis-prata').expect(200);
    expect(res.text).toMatch(/collection-header/);
    expect(res.text).toMatch(/product-card/);
  });

  test('GET /colecao/:slug inexistente responde 404, não 500', async () => {
    await request(app).get('/colecao/nao-existe-de-certeza').expect(404);
  });

  test('página de um material mostra as peças das subcategorias', async () => {
    // Regressão: as famílias de topo (Prata, Latão…) não têm produtos
    // directos — todos estão nas filhas. A página delas aparecia vazia,
    // apesar de estar no sitemap.
    const ProductFamily = require('../models/ProductFamily');
    const materiais = await ProductFamily.getMaterialsForHome();
    expect(materiais.length).toBeGreaterThan(0);

    const material = materiais[0];
    expect(Number(material.product_count)).toBeGreaterThan(0);

    const res = await request(app).get(`/categoria/${material.slug}`).expect(200);
    expect(res.text).toMatch(/product-card/);
  });

  test('categoria de topo agrupa por subcategoria e traz índice lateral', async () => {
    const res = await request(app).get('/categoria/prata').expect(200);
    expect(res.text).toMatch(/class="category-index"/);
    expect(res.text).toMatch(/data-index-link=/);
    expect(res.text).toMatch(/class="category-group"/);
  });

  test('nenhuma categoria ficou sem slug', async () => {
    // Regressão: a coluna slug existia mas create/update nunca a escreviam,
    // por isso as 25 categorias serviam URLs numéricos (/collection/16).
    const { pool } = require('../config/database');
    const [[{ semSlug }]] = await pool.query(
      "SELECT COUNT(*) AS semSlug FROM product_families WHERE slug IS NULL OR slug = ''"
    );
    expect(Number(semSlug)).toBe(0);
  });
});

describe('Endereços antigos (301)', () => {
  // A loja mudou de /catalog para /loja. Eram 410 URLs indexadas — a loja
  // mais as 409 fichas de produto — por isso os 301 são o que impede a perda
  // de toda a autoridade acumulada nelas.
  test('/catalog redirecciona 301 para /loja', async () => {
    const res = await request(app).get('/catalog').expect(301);
    expect(res.headers.location).toBe('/loja');
  });

  test('/catalog leva os filtros consigo no redirect', async () => {
    const res = await request(app).get('/catalog?families=1&sort=name-asc').expect(301);
    expect(res.headers.location).toBe('/loja?families=1&sort=name-asc');
  });

  test('/catalog/product/:slug redirecciona 301 para /loja/produto/:slug', async () => {
    const res = await request(app).get('/catalog/product/anel-de-prata-com-onix-oval').expect(301);
    expect(res.headers.location).toBe('/loja/produto/anel-de-prata-com-onix-oval');
  });

  test('/loja responde 200 com produtos', async () => {
    const res = await request(app).get('/loja').expect(200);
    expect(res.text).toMatch(/product-card/);
  });

  // ===== Categoria no URL: ?families=16 → ?categoria=prata =====
  // O id é interno e ilegível; o slug é estável e diz o que a página tem.
  test('/loja?families=16 redirecciona 301 para ?categoria=prata', async () => {
    const res = await request(app).get('/loja?families=16').expect(301);
    expect(res.headers.location).toBe('/loja?categoria=prata');
  });

  test('o 301 leva os outros filtros consigo', async () => {
    const res = await request(app).get('/loja?families=16&sort=name-asc&page=2').expect(301);
    expect(res.headers.location).toBe('/loja?categoria=prata&sort=name-asc&page=2');
  });

  test('valores neutros não sobrevivem ao 301 (evita duplicados)', async () => {
    // `page=1`, `sort=default` e `price_range=all` são o mesmo que não estarem
    // lá: se passassem, cada listagem teria vários endereços equivalentes.
    const res = await request(app)
      .get('/loja?families=16&page=1&sort=default&price_range=all')
      .expect(301);
    expect(res.headers.location).toBe('/loja?categoria=prata');
  });

  test('/loja?categoria=prata responde 200 e não volta a redireccionar', async () => {
    const res = await request(app).get('/loja?categoria=prata').expect(200);
    expect(res.text).toMatch(/product-card/);
  });

  test('uma categoria sozinha aponta o canónico para a página da categoria', async () => {
    // A página /categoria/:slug é a versão rica da mesma listagem. Sem isto
    // as duas competiam pela mesma pesquisa.
    const res = await request(app).get('/loja?categoria=prata').expect(200);
    expect(res.text).toMatch(/<link rel="canonical" href="[^"]*\/categoria\/prata"/);
    expect(res.text).toMatch(/<meta name="robots" content="index, follow">/);
  });

  test('combinações de filtros ficam fora do índice, mas seguíveis', async () => {
    const res = await request(app).get('/loja?categoria=prata&price_range=0-50').expect(200);
    expect(res.text).toMatch(/<meta name="robots" content="noindex, follow">/);
    expect(res.text).toMatch(/<link rel="canonical" href="[^"]*\/loja"/);
  });

  test('uma categoria desconhecida mostra a loja inteira em vez de rebentar', async () => {
    await request(app).get('/loja?categoria=nao-existe-isto').expect(200);
  });

  // Estes 301 são o que impede a perda da autoridade acumulada pelos 23 URLs
  // de categoria e pela galeria, que estavam indexados no Google.
  test('/collection/:id redirecciona 301 para /categoria/:slug', async () => {
    const res = await request(app).get('/collection/16').expect(301);
    expect(res.headers.location).toBe('/categoria/prata');
  });

  test('/collection/:slug redirecciona 301 para /categoria/:slug', async () => {
    const res = await request(app).get('/collection/aneis-prata').expect(301);
    expect(res.headers.location).toBe('/categoria/aneis-prata');
  });

  test('/collections redirecciona 301 para /galeria', async () => {
    const res = await request(app).get('/collections').expect(301);
    expect(res.headers.location).toBe('/galeria');
  });

  test('/instagram vai directo a /galeria, sem cadeia de redirects', async () => {
    const res = await request(app).get('/instagram').expect(301);
    expect(res.headers.location).toBe('/galeria');
  });

  test('o sitemap não anuncia os endereços antigos', async () => {
    const res = await request(app).get('/sitemap.xml').expect(200);
    expect(res.text).not.toMatch(/artnshine\.pt\/collection\//);
    expect(res.text).not.toMatch(/artnshine\.pt\/catalog/);
    expect(res.text).toMatch(/artnshine\.pt\/loja/);
    expect(res.text).not.toMatch(/artnshine\.pt\/collections</);
    expect(res.text).toMatch(/artnshine\.pt\/categoria\//);
    expect(res.text).toMatch(/artnshine\.pt\/galeria</);
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

  test('índice /colecoes lista a coleção e mostra as famílias que ela junta', async () => {
    const res = await request(app).get('/colecoes').expect(200);
    expect(res.text).toMatch(/collection-index-card/);

    // Uma coleção pode juntar peças de várias famílias — o cartão tem de as
    // mostrar, senão não se percebe o que está lá dentro.
    const actives = await Collection.getActiveWithCounts();
    const minha = actives.find((c) => c.id === collectionId);
    expect(minha).toBeDefined();
    expect(minha.family_names).toBeTruthy();
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

describe('Ordem intercalada das subcategorias', () => {
  const { intercalarPorFamilia } = require('../services/catalogQueryService');

  /** Maior número de peças seguidas da mesma família. */
  function maiorRepetido(linhas) {
    let maior = 0;
    let actual = 0;
    let anterior = null;
    linhas.forEach((l) => {
      actual = l.family_id === anterior ? actual + 1 : 1;
      anterior = l.family_id;
      if (actual > maior) maior = actual;
    });
    return maior;
  }

  test('quebra um bloco de 30 peças da mesma família', () => {
    const linhas = [
      ...Array.from({ length: 30 }, (_, i) => ({ id: i, family_id: 1 })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: 100 + i, family_id: 2 })),
      ...Array.from({ length: 8 }, (_, i) => ({ id: 200 + i, family_id: 3 }))
    ];
    expect(maiorRepetido(linhas)).toBe(30);
    expect(maiorRepetido(intercalarPorFamilia(linhas))).toBeLessThanOrEqual(3);
  });

  test('a família grande não fica toda amontoada no fim', () => {
    // O round-robin simples esgota as famílias pequenas ao início e deixa um
    // bloco da maior no fim — que é exactamente o problema a evitar.
    const linhas = [
      ...Array.from({ length: 90 }, (_, i) => ({ id: i, family_id: 1 })),
      ...Array.from({ length: 6 }, (_, i) => ({ id: 100 + i, family_id: 2 }))
    ];
    const ultimoQuarto = intercalarPorFamilia(linhas).slice(-24);
    expect(ultimoQuarto.some((l) => l.family_id === 2)).toBe(true);
  });

  test('não perde nem duplica peças', () => {
    const linhas = [
      ...Array.from({ length: 17 }, (_, i) => ({ id: i, family_id: 1 })),
      ...Array.from({ length: 5 }, (_, i) => ({ id: 100 + i, family_id: 2 })),
      { id: 999, family_id: null }
    ];
    const saida = intercalarPorFamilia(linhas);
    expect(saida).toHaveLength(linhas.length);
    expect(new Set(saida.map((l) => l.id)).size).toBe(linhas.length);
  });

  test('com uma só família devolve a ordem original intacta', () => {
    const linhas = Array.from({ length: 5 }, (_, i) => ({ id: i, family_id: 7 }));
    expect(intercalarPorFamilia(linhas)).toEqual(linhas);
  });
});

describe('Ficha de produto: navegação', () => {
  test('as migalhas incluem a categoria, não só Início e Loja', async () => {
    const res = await request(app).get('/loja/produto/anel-de-prata-com-onix-oval').expect(200);
    expect(res.text).toMatch(/peca-migalhas/);
    expect(res.text).toMatch(/href="\/categoria\/aneis-prata"/);
  });

  test('a contagem das setas bate com a categoria (respeita o stock escondido)', async () => {
    // Regressão: contava as peças activas todas e anunciava "8.ª de 90" numa
    // categoria onde a loja mostra 28.
    const ficha = await request(app).get('/loja/produto/anel-de-prata-com-onix-oval').expect(200);
    const m = ficha.text.match(/(\d+)\.ª de (\d+)/);
    expect(m).not.toBeNull();

    const loja = await request(app).get('/loja?categoria=aneis-prata').expect(200);
    const total = loja.text.match(/<span class="count-number">(\d+)</);
    expect(total).not.toBeNull();
    expect(Number(m[2])).toBe(Number(total[1]));
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
