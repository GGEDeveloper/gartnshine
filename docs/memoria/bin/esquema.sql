-- Índice derivado da biblioteca de memória.
-- A fonte de verdade são os ficheiros markdown em docs/memoria/notas/.
-- Esta base é reconstruível do zero: apagar e correr `mem reconstruir`.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------
-- Notas — bi-temporais
--   valid_from/valid_to : quando o facto foi verdade no mundo
--   ingested_at         : quando o sistema soube dele
-- Um facto corrigido não se apaga: fecha-se com valid_to e aponta-se
-- superseded_by para o sucessor, de modo a poder perguntar-se
-- "o que era verdade a 30 de julho".
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
  slug          TEXT PRIMARY KEY,
  path          TEXT NOT NULL,
  tipo          TEXT NOT NULL
                CHECK (tipo IN ('decisao','facto','estado','procedimento',
                                'entidade','preferencia','referencia')),
  -- Eixo ortogonal ao tipo: de que área é a nota. Permite ter um
  -- segmento próprio para o funcionamento do sistema de memória
  -- (dominio='memoria') sem o misturar com o resto.
  dominio       TEXT NOT NULL DEFAULT 'geral',
  titulo        TEXT NOT NULL,
  resumo        TEXT,
  corpo         TEXT NOT NULL,
  -- Expansão bilingue: o corpo fica em PT-PT (fidelidade e auditoria);
  -- aqui guardam-se os termos EN equivalentes. Medido: manter PT e
  -- expandir bate traduzir, e nunca colapsa quando a pergunta muda de
  -- língua (margem média 0,2595 contra 0,2422 PT puro e 0,2295 EN puro).
  keywords      TEXT,
  valid_from    TEXT,
  valid_to      TEXT,
  ingested_at   TEXT NOT NULL,
  superseded_by TEXT REFERENCES notes(slug) ON DELETE SET NULL,
  confianca     REAL NOT NULL DEFAULT 1.0,
  content_hash  TEXT NOT NULL,
  mtime         REAL
);

CREATE INDEX IF NOT EXISTS idx_notes_tipo    ON notes(tipo);
CREATE INDEX IF NOT EXISTS idx_notes_vigor   ON notes(valid_to, valid_from);
CREATE INDEX IF NOT EXISTS idx_notes_superse ON notes(superseded_by);

-- ---------------------------------------------------------------
-- Proveniência: de onde veio cada afirmação.
-- kind: commit | transcript | ficheiro | url | conversa | inferido
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sources (
  slug   TEXT NOT NULL REFERENCES notes(slug) ON DELETE CASCADE,
  kind   TEXT NOT NULL,
  ref    TEXT NOT NULL,
  detalhe TEXT
);
CREATE INDEX IF NOT EXISTS idx_sources_slug ON sources(slug);

-- ---------------------------------------------------------------
-- Grafo: entidades e relações datadas.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entities (
  nome    TEXT PRIMARY KEY,
  tipo    TEXT,               -- produto|categoria|ficheiro|sistema|pessoa|conceito
  aliases TEXT,               -- separados por |, para flexão e sinónimos
  nota    TEXT REFERENCES notes(slug) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS relations (
  src         TEXT NOT NULL,
  rel         TEXT NOT NULL,
  dst         TEXT NOT NULL,
  slug        TEXT REFERENCES notes(slug) ON DELETE CASCADE,
  valid_from  TEXT,
  valid_to    TEXT,
  ingested_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rel_src ON relations(src);
CREATE INDEX IF NOT EXISTS idx_rel_dst ON relations(dst);

-- Menções: liga entidades a notas sem afirmar uma relação tipada.
CREATE TABLE IF NOT EXISTS mentions (
  entidade TEXT NOT NULL,
  slug     TEXT NOT NULL,
  fonte    TEXT NOT NULL DEFAULT 'nota'
);
CREATE INDEX IF NOT EXISTS idx_mentions_ent  ON mentions(entidade);
CREATE INDEX IF NOT EXISTS idx_mentions_slug ON mentions(slug);

-- ---------------------------------------------------------------
-- Fragmentos indexáveis. Cobre notas, transcripts, docs e commits,
-- para que a busca alcance também o que ainda não virou nota.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chunks (
  id      INTEGER PRIMARY KEY,
  fonte   TEXT NOT NULL,      -- nota|transcript|doc|commit
  ref     TEXT NOT NULL,      -- slug, caminho ou sha
  ord     INTEGER NOT NULL DEFAULT 0,
  titulo  TEXT,
  texto   TEXT NOT NULL,
  keywords TEXT,              -- termos EN da expansão bilingue
  data    TEXT,               -- data do fragmento, para filtro temporal
  hash    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chunks_ref   ON chunks(fonte, ref);
CREATE INDEX IF NOT EXISTS idx_chunks_data  ON chunks(data);

-- BM25. `remove_diacritics 2` para que "memoria" encontre "memória";
-- o tokenizer separa também por underscore e hífen, o que importa
-- para referências como PPU0080 ou cat-4-hero-1920.
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  texto,
  titulo,
  keywords,
  content='chunks',
  content_rowid='id',
  tokenize="unicode61 remove_diacritics 2 tokenchars '-_'"
);

CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
  INSERT INTO chunks_fts(rowid, texto, titulo, keywords)
    VALUES (new.id, new.texto, new.titulo, new.keywords);
END;
CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, texto, titulo, keywords)
    VALUES('delete', old.id, old.texto, old.titulo, old.keywords);
END;
CREATE TRIGGER IF NOT EXISTS chunks_au AFTER UPDATE ON chunks BEGIN
  INSERT INTO chunks_fts(chunks_fts, rowid, texto, titulo, keywords)
    VALUES('delete', old.id, old.texto, old.titulo, old.keywords);
  INSERT INTO chunks_fts(rowid, texto, titulo, keywords)
    VALUES (new.id, new.texto, new.titulo, new.keywords);
END;

-- ---------------------------------------------------------------
-- Registo de capturas: alimenta a confiança progressiva.
-- Quantas mais aprovações sem rejeição um par (tipo, padrao) acumular,
-- menos confirmação passa a exigir.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capture_log (
  id      INTEGER PRIMARY KEY,
  ts      TEXT NOT NULL,
  tipo    TEXT NOT NULL,
  padrao  TEXT NOT NULL DEFAULT 'geral',
  decisao TEXT NOT NULL CHECK (decisao IN ('aprovada','rejeitada','editada','auto')),
  slug    TEXT,
  nota    TEXT
);
CREATE INDEX IF NOT EXISTS idx_capture ON capture_log(tipo, padrao);

-- Metadados do índice (versão do modelo de embeddings, etc.)
CREATE TABLE IF NOT EXISTS meta (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
