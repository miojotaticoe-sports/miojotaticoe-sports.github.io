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

// Lista de hosts possíveis para resiliência
const BASE_HOSTS = [
  "https://api-public-docs.cs-prod.leetify.com",
  "https://api.leetify.com/api",
  "https://api.cs-prod.leetify.com"
];

async function fetchFromLeetify(targetId, steam64Id) {
  const headers = {
    "_leetify_api_key": API_KEY,
    "Authorization": `Bearer ${API_KEY}`,
    "Accept": "application/json",
    "User-Agent": "MiojoTaticoBot/1.0"
  };

  for (const host of BASE_HOSTS) {
    // 1. Tentar endpoint v3/profile
    const param = targetId ? `id=${targetId}` : `steam64_id=${steam64Id}`;
    const profileUrl = `${host}/v3/profile?${param}`;

    try {
      console.log(`🌐 tentando: ${profileUrl}`);
      const res = await fetch(profileUrl, { headers });
      
      if (res.ok) {
        const text = await res.text();
        try {
          const profileData = JSON.parse(text);

          // Buscar histórico de partidas v3/profile/matches
          try {
            const matchesUrl = `${host}/v3/profile/matches?${param}`;
            const matchesRes = await fetch(matchesUrl, { headers });
            if (matchesRes.ok) {
              const matchesData = await matchesRes.json();
              if (Array.isArray(matchesData)) {
                profileData.recent_matches = matchesData;
              }
            }
          } catch (mErr) {
            console.warn(`  ⚠️ Não foi possível obter histórico de partidas: ${mErr.message}`);
          }

          return profileData;
        } catch (jsonErr) {
          console.warn(`  ⚠️ Resposta não é JSON em ${profileUrl} (provavelmente HTML de documentação)`);
        }
      } else {
        const errText = await res.text().catch(() => "");
        console.warn(`  ⚠️ HTTP ${res.status} em ${profileUrl}: ${errText.slice(0, 150)}`);
      }
    } catch (err) {
      console.warn(`  ❌ Falha ao conectar em ${profileUrl}: ${err.message}`);
    }

    // 2. Fallback tentar /api/v1/players/{id}
    if (targetId) {
      const v1Url = `${host}/api/v1/players/${targetId}`;
      try {
        const resV1 = await fetch(v1Url, { headers });
        if (resV1.ok) {
          const dataV1 = await resV1.json();
          return dataV1;
        }
      } catch (errV1) {
        // ignora
      }
    }
  }

  return null;
}

async function updatePlayer(jogador) {
  if (!jogador.leetifyId && !jogador.steam64_id) {
    console.log(`⏩ [PULANDO] ${jogador.nome}: Jogador sem Leetify ID (AFK).`);
    return;
  }

  if (!jogador.mockFile) return;

  const mockPath = path.join(repoPath, jogador.mockFile);
  console.log(`\n🔄 [PROCESSANDO] ${jogador.nome}...`);

  const updatedData = await fetchFromLeetify(jogador.leetifyId, jogador.steam64_id);

  if (updatedData) {
    fs.writeFileSync(mockPath, JSON.stringify(updatedData, null, 2), 'utf8');
    console.log(`✅ [SUCESSO] ${jogador.nome} atualizado em ${jogador.mockFile}`);
  } else {
    console.warn(`⚠️ [MANTIDO] Não foi possível atualizar ${jogador.nome} via API. Mantendo arquivo local intacto.`);
  }
}

async function main() {
  console.log("🚀 Iniciando atualização automática Leetify API para Miojo Tático...");
  for (const jogador of jogadores) {
    await updatePlayer(jogador);
  }
  console.log("\n✨ Processo de atualização finalizado!");
}

main();
