/**
 * A marca, num sítio só.
 *
 * Antes disto o nome estava escrito à mão em 25 ficheiros e em quatro formas
 * diferentes — `Gonzaga's Art & Shine`, `Gonzaga's Art &amp; Shine`,
 * `Art&Shine`, `Art & Shine` — o que tornava qualquer mudança de nome um
 * trabalho de procurar e substituir com pontas soltas garantidas.
 *
 * Regra: **nenhum ficheiro fora daqui escreve o nome da marca.** Se precisar
 * do nome, importa este módulo (código) ou usa `brand.*` (vistas, exposto em
 * `app.locals`).
 */

/**
 * O nome antigo mantém-se no `alternateName` do schema.org durante a
 * transição. Serve para o Google ligar as duas identidades: quem procurar
 * "Art & Shine" continua a encontrar a loja enquanto o nome novo não ganha
 * reconhecimento próprio. Ver `docs/rebranding/PLANO.md` para quando o tirar.
 */
const NOME_ANTERIOR = "Gonzaga's Art & Shine";

module.exports = {
  /** Como aparece a quem visita: cabeçalho, rodapé, textos. */
  nome: 'Gonzaga',

  /** Cabeçalho estreito e telemóvel, onde o nome completo não cabe. */
  nomeCurto: 'Gonzaga',

  /**
   * `<title>`, schema.org e feeds.
   *
   * Leva o descritor de propósito: "Gonzaga" sozinho é apelido comum,
   * universidade nos EUA e cidade no Brasil — como termo de pesquisa é muito
   * mais disputado do que "Art & Shine", que era praticamente único. O
   * descritor é invisível no site e desambigua onde importa.
   */
  nomeSeo: 'Gonzaga Jewellery',

  /** Nome anterior, para o schema.org durante a transição. */
  nomeAnterior: NOME_ANTERIOR,

  /** Sufixo dos títulos. Só entra se o título ainda couber em ~60 chars. */
  sufixoTitulo: 'Gonzaga',

  /** Assinatura curta usada em descrições geradas. */
  assinatura: 'Gonzaga Jewellery',

  email: 'g.art.shine@gmail.com',
  telefone: '+351939500592',

  /** Endereço base. `BASE_URL` sobrepõe-se, para ambientes e para o dia em
   *  que o domínio mudar (ver Fase 5 do plano). */
  get baseUrl() {
    return process.env.BASE_URL || 'https://artnshine.pt';
  },

  redes: {
    instagram: 'https://www.instagram.com/gonzagaartnshine/',
    facebook: 'https://www.facebook.com/profile.php?id=61573519807731'
  },

  /** Mote da marca. */
  mote: 'Elegância que nasce da terra'
};
