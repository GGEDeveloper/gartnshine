# Fase 1: Robots.txt e BASE_URL

## O Problema
1. O ficheiro `robots.txt` antigo continha a regra `Disallow: /*.xml$`, que bloqueava explicitamente o Googlebot de ler o `sitemap.xml`.
2. A aplicação tentava gerar URLs absolutos no sitemap, mas a variável de ambiente `BASE_URL` não estava configurada nem documentada, gerando falhas em ambientes locais ou de produção.

## A Solução Implementada

### 1. Correção do `robots.txt`
O ficheiro foi limpo de regras obstrutivas e desnecessárias (como referências antigas ao Bingbot ou bloqueios de `.json`).

**Regras Atuais:**
- Permitir (`Allow`): Todo o site, incluindo diretórios core como `/catalog`, `/about`, `/collections`.
- Bloquear (`Disallow`): Diretórios de administração e sistema (`/admin/`, `/api/`, `/uploads/temp/`).
- Indicar explicitamente o caminho para o sitemap.

### 2. Normalização do `BASE_URL`
O `BASE_URL` foi formalmente introduzido na arquitetura.

**Ficheiros alterados:**
- `gonzagas_node/.env.example`
- `gonzagas_node/scripts/.env.example`

```env
# URL Base da Aplicação (ex: https://artnshine.pt em prod, http://localhost:3000 em dev)
BASE_URL=https://artnshine.pt
```

Em código (ex: `app.js` e `seo.js`), foi implementado um fallback seguro:
```javascript
const baseUrl = process.env.BASE_URL || 'https://artnshine.pt';
```

## Como Testar
1. Aceder a `https://artnshine.pt/robots.txt` (ou `http://localhost:3000/robots.txt`)
2. Confirmar que a última linha aponta corretamente para o domínio: `Sitemap: https://artnshine.pt/sitemap.xml`
3. Confirmar a ausência da linha `Disallow: /*.xml$`