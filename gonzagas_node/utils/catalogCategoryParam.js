/**
 * Categorias no URL da loja: `?categoria=prata` em vez de `?families=16`.
 *
 * Porquê: `/loja?families=16` não diz nada a ninguém — nem a quem lê o URL
 * numa partilha, nem ao Google, que usa as palavras do endereço como sinal.
 * Pior, o id é interno: se uma categoria for recriada muda de número e todos
 * os links partilhados passam a apontar para outra coisa. O slug é estável e
 * legível, e já existia na tabela para as páginas /categoria/:slug.
 *
 * O parâmetro antigo continua a ser aceite e redireccionado (301) para a
 * forma nova — há links por aí e o histórico de SEO não se deita fora.
 */

/** Nome do parâmetro público. `families` fica só como forma legada. */
const PARAM = 'categoria';
const PARAM_LEGADO = 'families';

/**
 * Lê `?categoria=` do query string. Aceita repetido (`?categoria=a&categoria=b`)
 * e separado por vírgulas (`?categoria=a,b`) — quem escreve o URL à mão tende
 * a usar a vírgula, e não custa nada aceitar as duas.
 *
 * @returns {string[]} slugs em minúsculas, sem repetições, sem vazios
 */
function parseCategoriaParam(query) {
  if (!query) return [];
  const bruto = query[PARAM];
  if (bruto === undefined || bruto === null || bruto === '') return [];

  const partes = (Array.isArray(bruto) ? bruto : [bruto])
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(partes)];
}

/**
 * Slugs → ids de família. Slugs desconhecidos são simplesmente ignorados: um
 * URL com uma categoria que já não existe deve mostrar a loja inteira, não um
 * erro. Devolve também os que ficaram por resolver, para quem quiser decidir
 * se vale a pena um 404.
 */
function slugsParaIds(slugs, flatFamilies) {
  const porSlug = new Map();
  (flatFamilies || []).forEach((f) => {
    if (f && f.slug) porSlug.set(String(f.slug).toLowerCase(), Number(f.id));
  });

  const ids = [];
  const desconhecidos = [];
  (slugs || []).forEach((s) => {
    const id = porSlug.get(s);
    if (id !== undefined) ids.push(id);
    else desconhecidos.push(s);
  });

  return { ids, desconhecidos };
}

/**
 * Ids → slugs, para converter um URL legado na forma nova. Uma família sem
 * slug (base antiga por migrar) fica de fora — melhor perder o filtro do que
 * gerar um URL partido.
 */
function idsParaSlugs(ids, flatFamilies) {
  const porId = new Map();
  (flatFamilies || []).forEach((f) => {
    if (f && f.slug) porId.set(Number(f.id), String(f.slug).toLowerCase());
  });

  const slugs = [];
  let todosConvertidos = true;
  (ids || []).forEach((id) => {
    const slug = porId.get(Number(id));
    if (slug) slugs.push(slug);
    else todosConvertidos = false;
  });

  return { slugs: [...new Set(slugs)], todosConvertidos };
}

/**
 * Lê o parâmetro legado `?families=16`, tolerando repetição e vírgulas tal
 * como o novo.
 */
function parseFamiliesLegado(query) {
  if (!query) return [];
  const bruto = query[PARAM_LEGADO];
  if (bruto === undefined || bruto === null || bruto === '') return [];

  const ids = (Array.isArray(bruto) ? bruto : [bruto])
    .flatMap((v) => String(v).split(','))
    .map((v) => parseInt(String(v).trim(), 10))
    .filter((n) => !Number.isNaN(n));

  return [...new Set(ids)];
}

module.exports = {
  PARAM,
  PARAM_LEGADO,
  parseCategoriaParam,
  parseFamiliesLegado,
  slugsParaIds,
  idsParaSlugs
};
