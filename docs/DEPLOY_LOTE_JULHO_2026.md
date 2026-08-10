# Deploy — Lote de Julho de 2026 (70 peças sob consulta)

**Lote:** 70 peças novas fotografadas na sessão de Julho de 2026, a entrar
**sem preço** e visíveis como *Preço sob consulta*.
**Migração:** `sql/migrations/016_lote_julho_2026.sql` (só `INSERT`).
**Commits:** `5558ca0a` (peças + salvaguardas) e `70e2fd93` (harmonização das
fotografias). Ambos já em `origin/main`.
**Data de preparação:** 2026-08-10.

---

## O que muda

| | |
|---|---|
| 66 anéis de prata | família `aneis-prata` |
| 1 colar de âmbar | `colares-prata` |
| 1 pendente de larimar | `pendentes-prata` |
| 2 pendentes crescente (osso e madeira) | `pendentes-latao` |

Entram com `sale_price = 0` e `current_stock = 1`. As fotografias vêm no
mesmo commit, em `gonzagas_node/public/media/products/`, já com as variantes
`full`/`medium`/`small`/`thumb` em `jpg` e `webp` — **não há nada a gerar no
servidor**.

### Porque é que stock 1 e preço 0 andam juntos

O stock é o que as torna visíveis enquanto a definição `hide_out_of_stock`
estiver ligada. O preço a zero é o que faz aparecer *Preço sob consulta*. A
combinação abriria a porta a uma compra a €0, por isso o commit fecha-a em
três sítios:

- `views/partials/_productCard.ejs`, `_productCardHomepage.ejs` e
  `catalog/product-detail.ejs` deixam de mostrar `€0,00` e escondem o botão de
  carrinho — `formatted_sale_price` de zero é uma **string** e portanto sempre
  verdadeira, que era o bug;
- `modules/ecommerce/cart/services/cartService.js` recusa do lado do servidor:
  a API validava activo e stock, mas não o preço.

---

## O que a migração toca — e o que não toca

**Toca:** só `INSERT` em `products` e `product_images`.

**Não toca** em nenhum produto, preço, stock, encomenda, cliente, carrinho,
categoria, coleção nem galeria já existentes. Não há `UPDATE`, `DELETE`,
`DROP` nem `ALTER`.

### As salvaguardas

1. **A família é resolvida por `slug`**, nunca por `id` — os ids de produção
   não são os do repositório. Se um `slug` não existir em produção, a peça
   simplesmente não entra; nada rebenta.
2. **Cada `INSERT` tem `NOT EXISTS` pela referência.** Correr duas vezes não
   cria duplicados.
3. **As referências foram reservadas a partir do fim de cada série** — a
   numeração segue a subcategoria, como no resto do inventário. `PAN0091` em
   diante, `PNC0007`, `PNP0001`, `LTPD0006`–`LTPD0007`.
4. **Idempotente.** Pode correr as vezes que forem precisas.

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

# 4. Confirmar que as fotografias chegaram (esperado: 70)
ls gonzagas_node/public/media/products/PAN01[0-5]*.jpg \
   gonzagas_node/public/media/products/PNC0007.jpg \
   gonzagas_node/public/media/products/PNP0001.jpg \
   gonzagas_node/public/media/products/LTPD000[67].jpg 2>/dev/null | wc -l

# 5. Migração
docker exec -i mariadb mysql -u root -p"$MARIADB_ROOT_PASSWORD" \
  artnshin_gonzagas_db < gonzagas_node/sql/migrations/016_lote_julho_2026.sql

# 6. Reiniciar
docker restart artnshine-app
```

A migração imprime três linhas de verificação no fim:

```
70 de 70 peças do lote presentes
70 sem preço e com stock (como esperado)
familia            pecas
Aneis - Prata        66
Colares - Prata       1
Pendentes - Prata     1
Pendentes - Latão     2
```

## Condições de paragem

Parar e não continuar se:

- o backup falhar ou sair vazio;
- a primeira linha de verificação devolver **menos de 70** — significa que
  algum `slug` de família não coincide. Nada foi partido, mas convém perceber
  quais antes de seguir;
- a segunda linha não bater certo com a primeira — alguma peça ficou com
  preço ou sem stock e não se vai comportar como esperado.

## Verificação

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://artnshine.pt/categoria/aneis-prata
curl -s -o /dev/null -w "%{http_code}\n" https://artnshine.pt/media/products/PAN0091-medium.jpg
```

E a olho:

- `/categoria/aneis-prata` — as peças novas aparecem com **Preço sob
  consulta**, sem `€0,00` e **sem botão de carrinho**;
- tentar adicionar uma ao carrinho pela API deve devolver erro
  (`Preço sob consulta — peça não disponível para compra online`);
- as fotografias estão harmonizadas entre si (fundo e exposição), não
  destoam das antigas na mesma grelha.

## Rollback

Bloco comentado no fim de `016_lote_julho_2026.sql`: apaga primeiro
`product_images` e depois `products`, pelas 70 referências. É seguro porque
nenhuma delas existia antes deste lote.

Depois `docker restart artnshine-app`. O código volta atrás com
`git revert 70e2fd93 5558ca0a`.

---

## Fica de fora deste lote

- **33 pulseiras** da mesma sessão, retidas por dúvida real: as fotografias
  `0809`/`0811` (malha achatada, fecho de gancho) podem ser a peça que já está
  em inventário como `PPU0011`. À espera de confirmação de quem tem as peças.
- **`PAN0075` está na família errada** — são brincos catalogados em
  *Aneis - Prata*. Assinalado, não corrigido: mexer nisso é `UPDATE` num
  produto vivo e não pertence a um lote que só insere.
