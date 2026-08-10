# Deploy — Pulseiras de prata, correcção dos preços a zero e capas revistas

**Lote:** 32 pulseiras de prata da sessão de Julho de 2026, a entrar **sem
preço**; a correcção do `€0,00` que aparecia em vez de *Preço sob consulta*; e
os cartões de material refeitos.
**Migração:** `sql/migrations/017_pulseiras_julho_2026.sql` (só `INSERT`, mais
dois `UPDATE` guardados).
**Data de preparação:** 2026-08-10.

> A migração 016 (70 peças de Julho) tem de estar aplicada **antes** desta.
> Ver [`DEPLOY_LOTE_JULHO_2026.md`](DEPLOY_LOTE_JULHO_2026.md).

---

## 1. A correcção dos preços — é o que urge

O lote anterior fechou o `€0,00` em três vistas, mas ficaram **quatro sítios de
fora**, e dois deles estavam à vista de toda a gente. A causa é sempre a mesma:
`sale_price` chega da base de dados como **string**, e `"0.00"` é verdadeiro em
JavaScript; `formatted_sale_price` de zero é `"0,00 €"`, que também é verdadeiro.
Quem decide tem de ser o número.

| Ficheiro | O que mostrava | O que passa a mostrar |
|---|---|---|
| `views/public/catalog.ejs` | `0,00 €` no cartão de **/loja** | *Preço sob consulta* |
| `views/catalog/search-results.ejs` | `€0.00` nos resultados de pesquisa | *Preço sob consulta* |
| `views/catalog/product-detail.ejs` | `€0.00` no botão "copiar informação" e nas peças semelhantes | *Preço sob consulta* / *Sob consulta* |
| `views/layouts/main.ejs` e `views/partials/schema-product.ejs` | `"price": "0"` no JSON-LD | **sem bloco `offers`** |

O último é o mais grave dos quatro e não se via no site: anunciava ao Google que
a peça custa €0,00, e isso passa a viver nos resultados de pesquisa, onde já não
se corrige. Um `Product` sem `Offer` continua a ser schema válido.

Verificado localmente, peça a peça: uma peça sem preço não emite `offers`; uma
peça com preço continua a emitir (`"price": "15.00"`).

## 2. As 32 pulseiras

36 fotografias deram 32 peças — três grupos eram a mesma peça fotografada mais
do que uma vez (ver a secção *Por confirmar*). Referências `PPU0079` a
`PPU0110`, todas em *Pulseiras - Prata*, com `sale_price = 0` e
`current_stock = 1`, pelas mesmas razões do lote anterior.

As fotografias vêm no commit, já harmonizadas (enquadramento 1:1, balanço de
brancos pela cartolina, exposição igualada) e com todas as variantes. **Não há
nada a gerar no servidor.**

A migração resolve a família por `slug` e tem `NOT EXISTS` por referência —
idempotente. Testada duas vezes seguidas na base local: zero duplicados de
produto e zero de imagem.

A coluna `material` (âmbar, larimar) **não vai no `INSERT`**: pode não existir
nesta base de dados. É consultada em `information_schema` e o `UPDATE` só é
preparado se existir.

## 3. As capas revistas

Os cartões de material da homepage e da loja. Mesmos nomes de ficheiro, por
isso **não há nada a mudar na base de dados** — a migração 015 já lá pôs os
caminhos.

| Cartão | Antes | Agora |
|---|---|---|
| Prata | anel `PAN0024` sobre chão castanho | pulseira nova `PPU0080`, chão frio |
| Pedras Naturais | colar `PVO0005` pequeno ao alto | o mesmo colar, a preencher o cartão |
| Latão | gargantilha `LTG0002` | bracelete gravada `LTA0014` |
| Macramé | — | inalterado na peça; só ganhou tamanho |

Duas mudanças de fundo, ambas em `scripts/category-headers/build.js`:

- **O clarão do fundo passou a ter duas temperaturas.** O castanho serve o
  latão, o macramé e as pedras. À prata fazia o contrário: o metal acinzentado
  apanhava a dominante e lia-se castanho, baço, como se estivesse sujo. As oito
  categorias de prata (`capasFrias` no manifesto) passam a ter o clarão em
  cinza-prata da paleta.
- **A peça do cartão ocupa agora dois terços da altura**, e a largura deixa de
  travar nos 34 % — esse limite existia para a peça não ir parar por trás do
  título do cabeçalho, e no cartão não há título por cima.

Isto reconstrói **todas as 25 capas e os 5 cartões**. As capas de latão,
macramé e pedras ficam iguais ao que estavam, a menos do ruído do JPEG.

---

## Antes de correr

```bash
# 1. Backup da base de dados (obrigatório)
docker exec mariadb sh -c 'mysqldump -u root -p"$MARIADB_ROOT_PASSWORD" \
  artnshin_gonzagas_db' > ~/backups/artnshine-$(date +%Y%m%d-%H%M).sql

# 2. Confirmar que o backup não está vazio
ls -lh ~/backups/artnshine-*.sql | tail -1
```

## Passos

```bash
# 3. Código e imagens
cd /srv/stacks/artnshine/app_repo
git pull origin main

# 4. Confirmar que as fotografias chegaram (esperado: 32)
ls gonzagas_node/public/media/products/PPU0[01][0-9][0-9].jpg 2>/dev/null | \
  awk -F/ '$NF >= "PPU0079.jpg"' | wc -l

# 5. Migração
docker exec -i mariadb mysql -u root -p"$MARIADB_ROOT_PASSWORD" \
  artnshin_gonzagas_db < gonzagas_node/sql/migrations/017_pulseiras_julho_2026.sql

# 6. Reiniciar
docker restart artnshine-app
```

A migração imprime três linhas no fim:

```
32 de 32 peças do lote presentes
32 sem preço e com stock (como esperado)
familia            pecas
Pulseiras - Prata     32
```

## Condições de paragem

- backup falhado ou vazio;
- a primeira linha devolver **menos de 32** — algum `slug` de família não
  coincide; nada foi partido, mas perceber quais antes de seguir;
- a segunda linha não bater certo com a primeira.

## Verificação

O que interessa mesmo verificar é a correcção do preço, porque é o que estava
partido em produção:

```bash
# nenhum destes pode conter "0,00 €" nem "€0.00"
curl -s https://artnshine.pt/loja | grep -c "0,00 €"
curl -s "https://artnshine.pt/search?q=pulseira" | grep -c "€0.00"

# a ficha de uma peça sob consulta não pode declarar preço ao Google
curl -s https://artnshine.pt/loja/produto/pulseira-de-prata-malha-serpente-larga \
  | grep -c '"price": "0"'
```

Os três têm de devolver **0**. E a olho:

- `/loja` — as peças novas com **Preço sob consulta**, sem botão de carrinho;
- página inicial e `/loja` — os quatro cartões de material: a prata com uma
  pulseira e um brilho frio, sem o tom castanho de antes;
- `/categoria/pulseiras-prata` — 32 peças novas, fotografias harmonizadas entre
  si e com as antigas.

## Rollback

Bloco comentado no fim de `017_pulseiras_julho_2026.sql`: apaga
`product_images` e depois `products`, pelas 32 referências. Seguro — nenhuma
existia antes deste lote.

O código e as imagens voltam atrás com `git revert` do commit. As capas antigas
voltam pelo mesmo caminho: são ficheiros versionados.

---

## Por confirmar — precisa de quem tem as peças na mão

1. **Três grupos de fotografias foram tratados como uma peça só**, por serem
   indistinguíveis: `0836`+`0837`, `0838`+`0839`, e `0906`+`0907`+`0908`
   (larimar). Se forem peças diferentes, faltam duas ou quatro no catálogo —
   acrescentar é fácil, apagar duplicados não.
2. **Sete pulseiras já existentes não têm fotografia nenhuma** — `PPU0072` a
   `PPU0078`, criadas a 2026-06-23, com preço e stock. Alguns nomes batem certo
   com fotografias deste lote (`Elos Cubanos` ↔ `IMG_0822`, `Dragon Bone` ↔
   `IMG_0840`, `Cobra Achatada` ↔ as bandas achatadas). **Não foram tocadas**:
   ligar uma fotografia à peça errada é pior do que não a ligar. Se se
   confirmar, o certo é atribuir a foto à peça que já existe e apagar a nova.
3. **Sobreposição com peças já fotografadas.** As bandas achatadas e as malhas
   serpente deste lote são o mesmo modelo de `PPU0006`, `PPU0009`–`PPU0011`,
   `PPU0040`–`PPU0065`. O catálogo já trata cada peça física como um registo
   (há nomes repetidos entre as antigas), por isso entraram como novas — mas se
   forem restock do mesmo artigo, convém decidir a regra antes do próximo lote.
