# Checklist de Deploy (Produção)

Antes ou imediatamente após o deploy destas melhorias (Fases 1 a 5) para o servidor de produção (`dominios.pt`), execute os seguintes passos obrigatórios.

## 1. Variáveis de Ambiente
No servidor (cPanel / Terminal), aceda ao ficheiro `.env` e garanta que estas duas variáveis estão definidas:

```env
# Essencial para o Sitemap.xml e Canonical URLs
BASE_URL=https://artnshine.pt

# Essencial para o Google Analytics 4 (obter no Google Analytics)
GA_TRACKING_ID=G-XXXXXXXXXX
```

## 2. Substituição da Imagem Open Graph
O projeto contém um ficheiro temporário de 1x1px em `gonzagas_node/public/images/og-artnshine.jpg`.

1. Crie uma imagem de alta qualidade representando a marca (ex: uma peça em prata 925 com Ónix ou Olho-de-tigre sobre fundo negro).
2. Dimensões estritas: **1200x630 pixels**.
3. Formato: `.jpg` (preferencial para redes sociais).
4. Guarde no servidor exatamente com o mesmo nome e path, substituindo o ficheiro placeholder.

## 3. Validação Google Search Console (GSC)
Após o código estar live em `artnshine.pt`:

1. Aceda ao [Google Search Console](https://search.google.com/search-console).
2. Se ainda não tiver conta, adicione a propriedade do domínio (`artnshine.pt`).
3. No menu lateral esquerdo, clique em **Sitemaps**.
4. Insira `sitemap.xml` no campo de texto e clique em **Submit**.
5. Aguarde que o estado mude para \"Success\".
6. Isto irá forçar o Googlebot a indexar todas as páginas estáticas, os mais de 260 produtos e as respetivas imagens.

## 4. Teste de Validação Final
Com o código em produção, abra uma janela anónima e verifique:

- [ ] `https://artnshine.pt/robots.txt` não tem a regra `Disallow: /*.xml$`.
- [ ] `https://artnshine.pt/sitemap.xml` carrega em formato XML válido, sem mostrar páginas como `/catalogo` ou `/artesaos`.
- [ ] Entrar na página de um produto, inspecionar o código (`Ctrl+U`) e garantir que a `<link rel=\"canonical\">` aponta para o URL absoluto do `artnshine.pt` e não `gonzagaartshine.com` nem `localhost`.
- [ ] No código fonte, o ID do GA4 carregou na tag `<script>`.