const fs = require('fs');
const path = require('path');

const API_KEY = process.env.LEETIFY_API_KEY;

console.log("=========================================");
console.log("🔍 MIOJO TÁTICO - LEETIFY API SYNC BOT");
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
const cleanKey = API_KEY.trim();

function getAuthHeaders() {
  return {
    "_leetify_key": cleanKey,
    "Authorization": `Bearer ${cleanKey}`,
    "Accept": "application/json",
    "User-Agent": "MiojoTaticoBot/1.0"
  };
}

async function fetchPlayerProfile(jogador) {
  if (!jogador.mockFile || (!jogador.steam64_id && !jogador.leetifyId)) {
    console.log(`⏩ [PULANDO] ${jogador.nome}: sem ID cadastrado (AFK).`);
    return false;
  }

  const mockPath = path.join(repoPath, jogador.mockFile);
  const param = jogador.steam64_id ? `steam64_id=${jogador.steam64_id}` : `id=${jogador.leetifyId}`;
  const targetUrl = `https://api-public.cs-prod.leetify.com/v3/profile?${param}`;
  const headers = getAuthHeaders();

  try {
    console.log(`\n🔄 [PROCESSANDO] ${jogador.nome} (${param})...`);
    console.log(`🌐 Requisitando: ${targetUrl}`);

    const res = await fetch(targetUrl, { headers });
    const bodyText = await res.text();

    console.log(`   ➔ Status HTTP: ${res.status}`);

    if (res.ok) {
      try {
        const profileData = JSON.parse(bodyText);
        fs.writeFileSync(mockPath, JSON.stringify(profileData, null, 2), 'utf8');
        console.log(`🎉 [SUCESSO] ${jogador.nome} atualizado em ${jogador.mockFile}`);
        return true;
      } catch (jsonErr) {
        console.error(`   ❌ Resposta não é JSON válido: ${bodyText.slice(0, 150)}`);
      }
    } else {
      console.error(`   ❌ Erro HTTP ${res.status}: ${bodyText.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`   ❌ Falha ao requisitar ${targetUrl}:`, err.message);
  }

  return false;
}

async function main() {
  let successCount = 0;
  for (const jogador of jogadores) {
    const ok = await fetchPlayerProfile(jogador);
    if (ok) successCount++;
  }

  console.log("\n=========================================");
  console.log(`✨ Sincronização concluída! (${successCount}/${jogadores.length} jogadores atualizados)`);
  console.log("=========================================");
}

main();
