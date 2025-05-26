# Documentação da Página "Sobre" (About)

## 📄 Arquivo principal
- **views/about.ejs**

---

## 🔎 Estrutura da Página
A página About é composta por quatro secções principais:

1. **about-header**: Cabeçalho com o nome da marca e uma faixa decorativa.
2. **about-story**: História e missão da marca, com imagem e texto.
3. **about-values**: Valores da marca apresentados em cartões com ícones.
4. **about-connect**: Área de contato e redes sociais.

---

## 🖼️ Detalhes de cada secção

### 1. about-header
- Exibe o nome "Gonzaga's Art & Shine" e um divisor geométrico decorativo.

### 2. about-story
- Mostra uma imagem de destaque da marca.
- Apresenta a missão, inspiração e filosofia da marca em texto.

### 3. about-values
- Título "Valores" e divisor geométrico.
- Três cartões de valor: Qualidade, Arte, Autenticidade.
- Cada cartão tem um ícone SVG, título e descrição.

### 4. about-connect
- Título "Fale conosco" e breve texto.
- Ícones de redes sociais:
  - **Instagram**: https://www.instagram.com/gonzagaartnshine/
  - **Facebook**: https://www.facebook.com/profile.php?id=61574526369910
  - **Email**: Botão com ícone de envelope, abre o cliente de email para geral@artnshine.pt
- Todos os ícones usam SVG para visual moderno e responsivo.

---

## 🎨 Estilo e Customização
- Os estilos principais estão associados a classes como `.about-header`, `.about-story`, `.about-values`, `.about-connect`.
- Ícones SVG podem ser trocados facilmente se necessário.
- Para adicionar novas redes sociais, basta duplicar um `<a class="social-link">` e alterar o link e o SVG.
- Para alterar textos, basta editar o conteúdo textual dentro das tags `<h2>`, `<h3>`, `<p>`.
- As imagens podem ser trocadas alterando o atributo `src` dos `<img>`.

---

## 🛠️ Como editar
- **Adicionar/Remover valores:**
  - Duplique/remova um bloco `.value-card` na secção `about-values`.
- **Alterar links sociais:**
  - Edite o `href` dos `<a class="social-link">` na secção `about-connect`.
- **Alterar email de contato:**
  - Modifique o `mailto:` do botão de email.
- **Alterar texto ou títulos:**
  - Edite diretamente o texto entre as tags HTML.

---

## 📝 Boas práticas
- Sempre feche corretamente as tags HTML.
- Use SVGs para ícones para melhor escalabilidade.
- Teste a responsividade após alterações.

---

## 📁 Localização dos arquivos
- **about.ejs:** views/about.ejs
- **Imagens:** public/media/
- **Documentação:** frontend-docs/about.md

---

## 📞 Suporte
Para dúvidas ou problemas, contate a equipe de desenvolvimento.

Atualizado em: Maio de 2025
