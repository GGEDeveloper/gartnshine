// Grava dentro de cada imagem tratada a que peças se refere e em que estado
// está. Assim a informação viaja com o ficheiro: quem o abrir daqui a um ano,
// noutra máquina, sabe de onde veio e o que mostra sem precisar deste JSON.
const sharp = require('/home/ggedeveloper/gartnshine-3/gonzagas_node/node_modules/sharp');
const fs = require('fs');
const path = require('path');
const S = __dirname;
const man = JSON.parse(fs.readFileSync(path.join(S, 'galeria-manifesto.json'), 'utf8'));
const lista = require('./galeria-lista.json');

const marcados = [];

async function marcar(ficheiro, campos) {
  const origem = path.join(S, ficheiro);
  if (!fs.existsSync(origem)) { console.log('falta', ficheiro); return; }
  const tmp = origem + '.tmp';
  await sharp(origem)
    .withExif({
      IFD0: {
        ImageDescription: campos.descricao,
        Artist: 'Gonzaga Jewellery',
        Copyright: 'Gonzaga Jewellery — artnshine.pt',
        Software: 'scripts/novos-produtos — tratamento de ambiente',
        // XPKeywords aceita texto e é o que o Explorador do Windows mostra
        // como "Etiquetas"; serve para procurar por referência.
        XPKeywords: campos.etiquetas,
      },
    })
    .jpeg({ quality: 92 })
    .toFile(tmp);
  fs.renameSync(tmp, origem);
  marcados.push({ ficheiro, ...campos });
  console.log(`${ficheiro}\n   ${campos.descricao}`);
}

(async () => {
  for (const f of man.fotos) {
    if (f.estado !== 'tratada' || !f.saida) continue;
    const refs = f.pecas.length ? f.pecas.join(', ') : 'por identificar';
    const dubio = f.porConfirmar ? ` Por confirmar: ${f.porConfirmar}.` : '';
    await marcar(f.saida, {
      descricao: `Ambiente · ${f.mostra}. Peças: ${refs}.${dubio} Origem: media/gallery/${lista[f.i]} (índice ${f.i}). Tratamento: corte, saturação a 62 %, aquecimento leve e vinheta. Fotografia real, sem elementos gerados.`,
      etiquetas: ['ambiente', 'tratada', ...f.pecas].join(';'),
    });
  }
  for (const m of man.montagens) {
    await marcar(m.ficheiro, {
      descricao: `MONTAGEM (não é fotografia) · ${m.peca} sobre ${m.cenario}. A peça e o cenário são fotografias reais da casa; a junção é composta. Usar como imagem de atmosfera, nunca como fotografia principal de catálogo.`,
      etiquetas: ['montagem', 'ambiente', 'nao-e-fotografia'].join(';'),
    });
  }
  fs.writeFileSync(path.join(S, 'marcados.json'), JSON.stringify(marcados, null, 1));
  console.log(`\n${marcados.length} ficheiros marcados`);
})();
