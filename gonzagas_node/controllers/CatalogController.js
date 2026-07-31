const ProductFamily = require('../models/ProductFamily');
const brand = require('../config/brand');
const {
  parseSelectedFamilyIds,
  parseMultiParam,
  normalizeFacetKeys,
  normalizePerPage,
  PER_PAGE_OPTIONS
} = require('../utils/catalogFilterUtils');
const { serializeCatalogQuery } = require('../utils/catalogReturnUrl');
const {
  parseCategoriaParam,
  parseFamiliesLegado,
  slugsParaIds,
  idsParaSlugs
} = require('../utils/catalogCategoryParam');
const {
  runCatalogQuery,
  listFacetOptionLabels,
  familyProductCounts
} = require('../services/catalogQueryService');
const EcommerceSettings = require('../modules/ecommerce/settings/models/EcommerceSettings');

/** Ordem fixa dos parâmetros no URL da loja — ver `urlDaLoja`. */
const ORDEM_PARAMETROS = [
  'categoria',
  'search',
  'price_range',
  'colors',
  'materials',
  'sort',
  'per_page',
  'page'
];

/**
 * Valores que são o mesmo que não pôr o parâmetro nenhum.
 *
 * `per_page=24` entra aqui por ser o valor por omissão de `normalizePerPage`:
 * sem isto, o módulo de filtros escrevia-o sempre e a mesma listagem passava
 * a ter dois endereços — com e sem ele.
 */
const VALORES_NEUTROS = {
  price_range: ['all'],
  sort: ['default'],
  per_page: ['24'],
  page: ['1']
};

class CatalogController {
  /**
   * Endereço da loja a partir de um conjunto de filtros.
   *
   * Serve para uma coisa só, mas importante: garantir que os mesmos filtros
   * dão sempre exactamente o mesmo endereço. A ordem dos parâmetros é fixa e
   * os valores neutros (`page=1`, `sort=default`, `price_range=all`) caem —
   * senão `/loja?sort=default&categoria=prata` e `/loja?categoria=prata`
   * seriam dois URLs distintos com o mesmo conteúdo, que é a definição de
   * conteúdo duplicado.
   */
  static urlDaLoja(query, overrides = {}) {
    const base = { ...(query || {}) };
    delete base.families; // forma legada: nunca sai daqui
    Object.assign(base, overrides);

    const params = new URLSearchParams();
    ORDEM_PARAMETROS.forEach((chave) => {
      const valor = base[chave];
      if (valor === undefined || valor === null || valor === '') return;
      const neutros = VALORES_NEUTROS[chave] || [];
      (Array.isArray(valor) ? valor : [valor]).forEach((v) => {
        const s = String(v).trim();
        if (!s || neutros.includes(s)) return;
        params.append(chave, s);
      });
    });

    const qs = params.toString();
    return qs ? `/loja?${qs}` : '/loja';
  }

  static async displayCatalog(req, res) {
    try {
      if (res.locals.siteSettings && res.locals.siteSettings.catalog_page_enabled === false) {
        console.log('[CatalogController] Catalog page is DISABLED. Rendering construction page.');
        return res.status(200).render('public/catalog', {
          title: 'Catálogo em Construção',
          currentPath: '/loja',
          layout: 'layouts/main',
          selectedFamilyIds: [],
          families: [],
          familiesTree: [],
          familyCheckboxCheckedIds: [],
          products: [],
          facetOptionLabels: { colors: [], materials: [] },
          selectedColors: [],
          selectedMaterials: [],
          catalogReturnPath: '/catalog',
          catalogPagination: null,
          initialFacets: null,
          queryParams: {},
          familyNameById: {},
          helpers: { isFamilySelected: () => '', facetKey: (l) => String(l || '').trim().toLowerCase() }
        });
      }

      console.log('[CatalogController] Catalog page is ENABLED. Rendering catalog page.');

      const hideOutOfStock = !!(res.locals.siteSettings && res.locals.siteSettings.hide_out_of_stock);
      const flatFamilies = await ProductFamily.getAll();

      // ===== Categoria no URL =====
      // A forma pública é `?categoria=prata`. `?families=16` continua a ser
      // aceite — há links antigos e resultados já indexados — mas responde
      // com 301 para a forma legível, para não haver dois endereços com o
      // mesmo conteúdo a competirem entre si.
      const idsLegado = parseFamiliesLegado(req.query);
      if (idsLegado.length > 0 && parseCategoriaParam(req.query).length === 0) {
        const { slugs, todosConvertidos } = idsParaSlugs(idsLegado, flatFamilies);
        if (slugs.length > 0 && todosConvertidos) {
          return res.redirect(301, CatalogController.urlDaLoja(req.query, { categoria: slugs }));
        }
      }

      const slugsCategoria = parseCategoriaParam(req.query);
      const { ids: idsCategoria } = slugsParaIds(slugsCategoria, flatFamilies);
      // `families` só serve de recurso quando os slugs não resolveram nada —
      // por exemplo numa base ainda sem a coluna preenchida.
      const selectedFamilyIds = idsCategoria.length > 0
        ? idsCategoria
        : parseSelectedFamilyIds(req.query.families);
      const expandedFamilyIds =
        selectedFamilyIds.length > 0
          ? ProductFamily.getFamilyIdsWithDescendants(flatFamilies, selectedFamilyIds)
          : [];

      const colorsNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'colors'));
      const materialsNormalized = normalizeFacetKeys(parseMultiParam(req.query, 'materials'));
      const stylesNormalized = [];

      const sortType =
        req.query.sort && String(req.query.sort).trim() ? String(req.query.sort).trim() : 'default';
      const perPage = normalizePerPage(req.query.per_page);

      const ecommerceSettings = await EcommerceSettings.getAll();

      const result = await runCatalogQuery({
        hideOutOfStock,
        expandedFamilyIds,
        price_range: req.query.price_range,
        search: req.query.search,
        colorsNormalized,
        materialsNormalized,
        stylesNormalized,
        sortType,
        page: req.query.page,
        perPage,
        settings: ecommerceSettings,
        // As referências partilham prefixo por família, por isso a ordem
        // natural despejava 30 anéis seguidos antes do primeiro colar.
        intercalarSubcategorias: true
      });

      if (result.facets) result.facets.styles = {};

      const productCounts = await familyProductCounts(hideOutOfStock);
      const familiesWithProducts = flatFamilies.filter(f => {
        const selfCount = productCounts[f.id] || 0;
        const descendantIds = ProductFamily.getDescendantIds(flatFamilies, f.id);
        const descendantCount = descendantIds.reduce((sum, id) => sum + (productCounts[id] || 0), 0);
        return selfCount > 0 || descendantCount > 0;
      });
      const familiesTree = ProductFamily.buildTree(familiesWithProducts);

      function flattenTree(nodes, depth = 0) {
        const out = [];
        (nodes || []).forEach(n => {
          out.push({ id: n.id, name: n.name, depth, parent_id: n.parent_id, hasChildren: !!(n.children && n.children.length) });
          if (n.children?.length) out.push(...flattenTree(n.children, depth + 1));
        });
        return out;
      }
      const familiesForView = flattenTree(familiesTree);
      const familyCheckboxCheckedIds =
        selectedFamilyIds.length > 0 ? expandedFamilyIds : [];

      const facetOptionLabels = await listFacetOptionLabels(hideOutOfStock);
      if (facetOptionLabels) facetOptionLabels.styles = [];

      const familyNameById = {};
      // O módulo de filtros trabalha com ids (é o que os checkboxes têm), mas
      // o endereço que escreve na barra tem de sair em slugs.
      const familySlugById = {};
      flatFamilies.forEach(f => {
        familyNameById[f.id] = f.name;
        if (f.slug) familySlugById[f.id] = f.slug;
      });

      const selectedColors = parseMultiParam(req.query, 'colors');
      const selectedMaterials = parseMultiParam(req.query, 'materials');

      // Materiais (categorias de topo) para a entrada do catálogo. Usam as
      // imagens definidas no admin, com fotografia de uma peça como recurso.
      // Se falhar não faz cair o catálogo — a secção simplesmente não aparece.
      let catalogMaterials = [];
      try {
        catalogMaterials = await ProductFamily.getMaterialsForHome({ hideOutOfStock });
      } catch (e) {
        console.error('Catálogo: falha a carregar materiais:', e.message);
      }

      // Há filtro activo? Determina se os cartões aparecem grandes ou
      // encolhidos numa tira, mantendo sempre a navegação por categoria.
      const filtroActivo = Object.keys(req.query).some(
        (k) => !['page', 'perPage', 'view'].includes(k)
              && req.query[k] !== undefined && req.query[k] !== ''
      );

      // ===== Subcategorias do material escolhido =====
      // Escolher "Prata" abre por baixo as subcategorias de prata, em vez de
      // obrigar a ir à barra lateral procurá-las. Só para um material de topo:
      // com vários escolhidos não há uma tira que faça sentido mostrar, e uma
      // subcategoria já é o fim da linha.
      const materialAberto = selectedFamilyIds.length === 1
        ? flatFamilies.find(f => Number(f.id) === Number(selectedFamilyIds[0]) && !f.parent_id)
        : null;
      let catalogSubcategorias = [];
      if (materialAberto) {
        try {
          catalogSubcategorias = await ProductFamily.getSubcategoriasParaLoja(
            materialAberto.id,
            { hideOutOfStock }
          );
        } catch (e) {
          console.error('Loja: falha a carregar subcategorias:', e.message);
        }
      }

      // Subcategoria escolhida: para a marcar na tira e para o cabeçalho.
      const subcategoriaAberta = selectedFamilyIds.length === 1
        ? flatFamilies.find(f => Number(f.id) === Number(selectedFamilyIds[0]) && f.parent_id)
        : null;
      // Numa subcategoria mostra-se a tira das irmãs, para se poder saltar
      // lateralmente sem passar pelo material outra vez.
      if (subcategoriaAberta) {
        try {
          catalogSubcategorias = await ProductFamily.getSubcategoriasParaLoja(
            subcategoriaAberta.parent_id,
            { hideOutOfStock }
          );
        } catch (e) {
          console.error('Loja: falha a carregar subcategorias irmãs:', e.message);
        }
      }
      const materialDaTira = materialAberto
        || (subcategoriaAberta
          ? flatFamilies.find(f => Number(f.id) === Number(subcategoriaAberta.parent_id))
          : null);

      // Cartão "Ver todos": imagem e textos definidos no admin (migração 012).
      //
      // A contagem tem de ser a da loja inteira, não a do filtro em vigor —
      // com "Prata" escolhido lia-se "Ver todos: 112 peças" ao lado de
      // "Prata: 112 peças", como se ver todos não acrescentasse nada.
      const totalGeral = catalogMaterials.reduce(
        (soma, m) => soma + Number(m.product_count || 0), 0
      );
      const s = res.locals.siteSettings || {};
      const cartaoVerTodos = {
        imagem: s.shop_all_card_image || null,
        titulo: s.shop_all_card_title || 'Ver todos',
        legenda: s.shop_all_card_subtitle || null,
        total: totalGeral
      };

      // ===== Canónico e indexação =====
      // Uma categoria sozinha tem página própria em /categoria/:slug, mais
      // rica (texto, cabeçalho, SEO). O canónico aponta para lá para não
      // andarem as duas a disputar a mesma pesquisa.
      //
      // As restantes combinações de filtros são infinitas e não trazem nada
      // de novo ao índice: canónico para /loja e noindex,follow — o `follow`
      // é o que importa, deixa o Google seguir os produtos a partir daqui.
      const base = (process.env.BASE_URL || 'https://artnshine.pt').replace(/\/$/, '');
      const filtrosAlemCategoria = ['search', 'price_range', 'colors', 'materials', 'sort']
        .some((k) => req.query[k] !== undefined && req.query[k] !== ''
                  && !(VALORES_NEUTROS[k] || []).includes(String(req.query[k])));

      let canonicalUrl = base + '/loja';
      let metaRobots = 'index, follow';

      if (filtrosAlemCategoria) {
        metaRobots = 'noindex, follow';
      } else if (selectedFamilyIds.length === 1) {
        const escolhida = flatFamilies.find(f => Number(f.id) === Number(selectedFamilyIds[0]));
        if (escolhida && escolhida.slug) canonicalUrl = `${base}/categoria/${escolhida.slug}`;
        else metaRobots = 'noindex, follow';
      } else if (selectedFamilyIds.length > 1) {
        metaRobots = 'noindex, follow';
      } else if (result.page > 1) {
        // Página 2 e seguintes: canónico para si próprio (o conteúdo é
        // mesmo outro), mas fora do índice — quem procura quer a primeira.
        canonicalUrl = base + CatalogController.urlDaLoja(req.query);
        metaRobots = 'noindex, follow';
      }

      const nomeCategoria = subcategoriaAberta ? subcategoriaAberta.name
        : (materialAberto ? materialAberto.name : null);

      res.render('public/catalog', {
        title: nomeCategoria ? `${nomeCategoria} — Loja` : 'Loja',
        catalogMaterials,
        catalogSubcategorias,
        materialDaTira,
        subcategoriaAberta,
        cartaoVerTodos,
        filtroActivo,
        currentPath: '/loja',
        layout: 'layouts/main',
        // A descrição genérica do site era curta e repetia-se noutras páginas.
        metaDescription: 'Catálogo completo de joias artesanais em prata 925, latão e pedras naturais — anéis, colares, brincos e pulseiras. Filtre por material, tipo e preço.',
        canonicalUrl,
        metaRobots,
        urlDaLoja: (overrides) => CatalogController.urlDaLoja(req.query, overrides),
        products: result.products,
        families: familiesForView,
        familiesTree,
        familyCheckboxCheckedIds,
        selectedFamilyIds,
        selectedColors,
        selectedMaterials,
        queryParams: req.query,
        catalogPagination: {
          page: result.page,
          perPage: result.perPage,
          totalPages: result.total_pages,
          totalFiltered: result.count,
          perPageOptions: PER_PAGE_OPTIONS
        },
        facetOptionLabels,
        initialFacets: result.facets,
        familyNameById,
        familySlugById,
        catalogReturnPath: serializeCatalogQuery(req.query),
        siteTitle: brand.nome,
        siteDescription: brand.mote,
        theme: 'dark',
        helpers: {
          isFamilySelected: function (familyId) {
            return selectedFamilyIds.includes(familyId) ? 'checked' : '';
          },
          facetKey: function (label) {
            return String(label || '')
              .trim()
              .toLowerCase();
          }
        }
      });
    } catch (error) {
      console.error('Error in displayCatalog:', error);
      res.status(500).render('error', {
        title: 'Erro',
        message: 'Ocorreu um erro ao carregar o catálogo.',
        error: {},
        layout: false
      });
    }
  }
}

module.exports = CatalogController;
