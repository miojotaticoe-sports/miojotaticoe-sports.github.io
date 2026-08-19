const fs = require('fs');
const path = require('path');

const API_KEY = process.env.LEETIFY_API_KEY;

console.log("=========================================");
console.log("🔍 MIOJO TÁTICO - LEETIFY API SYNC (LUCÃO)");
console.log("=========================================");

if (!API_KEY || API_KEY.trim() === "") {
  console.error("❌ ERRO CRÍTICO: LEETIFY_API_KEY não foi encontrada nas variáveis de ambiente!");
  console.error("👉 Cadastre a Secret 'LEETIFY_API_KEY' nas configurações do repositório no GitHub.");
  process.exit(1);
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

function getAuthHeaders(apiKey) {
  const cleanKey = apiKey.trim();
  return {
    "_leetify_key": cleanKey,
    "Authorization": `Bearer ${cleanKey}`,
    "Accept": "application/json",
    "User-Agent": "MiojoTaticoBot/1.0"
  };
}

async function fetchLucaoProfile(steam64Id) {
  const headers = getAuthHeaders(API_KEY);
  const targetUrl = `https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=${steam64Id}`;

  try {
    console.log(`🌐 Requisitando perfil do Lucão: ${targetUrl}`);
    const res = await fetch(targetUrl, { headers });
    const bodyText = await res.text();

    console.log(`   ➔ Status HTTP: ${res.status}`);

    if (res.ok) {
      try {
        const profileData = JSON.parse(bodyText);
        console.log(`   ✅ Perfil obtido com sucesso!`);

        // Tentar obter também histórico de partidas
        try {
          const matchesUrl = `https://api-public.cs-prod.leetify.com/v3/profile/matches?steam64_id=${steam64Id}`;
          console.log(`🌐 Buscando partidas do Lucão: ${matchesUrl}`);
          const matchesRes = await fetch(matchesUrl, { headers });
          if (matchesRes.ok) {
            const matchesData = await matchesRes.json();
            if (Array.isArray(matchesData)) {
              profileData.recent_matches = matchesData;
              console.log(`   ✅ Partidas recentes integradas (${matchesData.length} partidas).`);
            }
          }
        } catch (mErr) {
          console.warn(`   ⚠️ Falha ao buscar partidas:`, mErr.message);
        }

        return profileData;
      } catch (jsonErr) {
        console.error(`   ❌ Falha ao parsear JSON retornado: ${bodyText.slice(0, 200)}`);
      }
    } else {
      console.error(`   ❌ Resposta de erro (HTTP ${res.status}): ${bodyText.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`   ❌ Falha ao requisitar ${targetUrl}:`, err.message);
  }

  return null;
}

async function main() {
  const lucao = jogadores.find(j => j.nome === "Lucão");
  if (!lucao) {
    console.error("❌ Jogador Lucão não foi encontrado em data.js!");
    process.exit(1);
  }

  const mockPath = path.join(repoPath, lucao.mockFile);
  console.log(`\n🔄 [TESTE ISOLADO] Processando apenas Lucão (steam64_id: ${lucao.steam64_id})...`);

  const updatedData = await fetchLucaoProfile(lucao.steam64_id);

  if (updatedData) {
    fs.writeFileSync(mockPath, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log(`\n🎉 [SUCESSO] Dados do Lucão atualizados e salvos em ${lucao.mockFile}!`);
  } else {
    console.error(`\n❌ [FALHA] Não foi possível atualizar os dados do Lucão via API Leetify.`);
    process.exit(1);
  }

  console.log("=========================================");
  console.log("✨ Teste do Lucão finalizado!");
  console.log("=========================================");
}

main();
