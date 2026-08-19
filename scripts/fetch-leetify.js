const fs = require('fs');
const path = require('path');

const API_KEY = process.env.LEETIFY_API_KEY;

if (!API_KEY) {
  console.log("⚠️ LEETIFY_API_KEY não foi encontrada nas variáveis de ambiente.");
  console.log("💡 O script continuará utilizando os mocks locais sem interromper o site.");
  process.exit(0);
}

const repoPath = path.resolve(__dirname, '..');
const dataFilePath = path.join(repoPath, 'data.js');

if (!fs.existsSync(dataFilePath)) {
  console.error("❌ Arquivo data.js não encontrado!");
  process.exit(1);
}

const dataContent = fs.readFileSync(dataFilePath, 'utf8');
const evalCode = dataContent.replace('const siteData', 'global.siteData');
eval(evalCode);

const jogadores = global.siteData?.jogadores || [];

async function updatePlayer(jogador) {
  if (!jogador.leetifyId && !jogador.steam64_id) {
    console.log(`⏩ [PULANDO] ${jogador.nome}: Jogador sem Leetify ID (AFK).`);
    return;
  }

  const targetId = jogador.leetifyId || jogador.steam64_id;
  if (!jogador.mockFile) return;

  const mockPath = path.join(repoPath, jogador.mockFile);
  const url = `https://api-public-docs.cs-prod.leetify.com/api/v1/players/${targetId}`;

  try {
    console.log(`🔄 [BUSCANDO] Atualizando ${jogador.nome} (ID: ${targetId})...`);

    const response = await fetch(url, {
      headers: {
        "_leetify_api_key": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "User-Agent": "MiojoTaticoBot/1.0"
      }
    });

    if (response.ok) {
      const data = await response.json();
      fs.writeFileSync(mockPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ [SUCESSO] ${jogador.nome} atualizado em ${jogador.mockFile}`);
    } else {
      console.warn(`⚠️ [AVISO] Leetify API retornou HTTP ${response.status} para ${jogador.nome}. Mantendo mock existente.`);
    }
  } catch (err) {
    console.error(`❌ [ERRO] Falha ao buscar dados de ${jogador.nome}:`, err.message);
  }
}

async function main() {
  console.log("🚀 Iniciando atualização automática Leetify API para Miojo Tático...");
  for (const jogador of jogadores) {
    await updatePlayer(jogador);
  }
  console.log("✨ Atualização concluída!");
}

main();
