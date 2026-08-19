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
const mockPath = path.join(repoPath, 'mocks', 'lucao.json');
const steam64Id = "76561198020209185";
const cleanKey = API_KEY.trim();

async function fetchLucaoProfile() {
  const targetUrl = `https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=${steam64Id}`;

  const headers = {
    "_leetify_key": cleanKey,
    "Authorization": `Bearer ${cleanKey}`,
    "Accept": "application/json",
    "User-Agent": "MiojoTaticoBot/1.0"
  };

  try {
    console.log(`🌐 Requisitando perfil do Lucão: ${targetUrl}`);
    const res = await fetch(targetUrl, { headers });
    const bodyText = await res.text();

    console.log(`   ➔ Status HTTP: ${res.status}`);

    if (res.ok) {
      const profileData = JSON.parse(bodyText);
      fs.writeFileSync(mockPath, JSON.stringify(profileData, null, 2), 'utf8');
      console.log(`🎉 [SUCESSO] Resposta completa do perfil do Lucão salva com sucesso em mocks/lucao.json!`);
    } else {
      console.error(`❌ [ERRO HTTP ${res.status}]: ${bodyText.slice(0, 300)}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ [ERRO CONEXÃO]:`, err.message);
    process.exit(1);
  }
}

fetchLucaoProfile();
