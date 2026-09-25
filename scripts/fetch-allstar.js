const fs = require('fs');
const path = require('path');

// Carregar variáveis do arquivo .env local se existir
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const API_KEY = process.env.ALLSTAR_API_KEY;

console.log("=========================================");
console.log("🎬 MIOJO TÁTICO - ALLSTAR.GG CLIPS BOT");
console.log("=========================================");

if (!API_KEY || API_KEY.trim() === "") {
  console.error("❌ ERRO CRÍTICO: ALLSTAR_API_KEY não foi encontrada nas variáveis de ambiente!");
  console.error("👉 Cadastre a Secret 'ALLSTAR_API_KEY' no GitHub Actions ou em um arquivo .env local.");
  console.error("   Exemplo no .env: ALLSTAR_API_KEY=sua_chave_aqui");
  process.exit(1);
}

const repoPath = path.resolve(__dirname, '..');
const dataFilePath = path.join(repoPath, 'data.js');
const clipsFilePath = path.join(repoPath, 'mocks', 'clips.json');

if (!fs.existsSync(dataFilePath)) {
  console.error("❌ Arquivo data.js não encontrado!");
  process.exit(1);
}

// Carregar jogadores do data.js
const dataContent = fs.readFileSync(dataFilePath, 'utf8');
const evalCode = dataContent.replace('const siteData', 'global.siteData');
eval(evalCode);

const jogadores = global.siteData?.jogadores || [];
const cleanKey = API_KEY.trim();

// Carregar clips existentes para não apagar caso a API não retorne novo clipe
let existingClipsData = { updatedAt: new Date().toISOString(), clips: {} };
if (fs.existsSync(clipsFilePath)) {
  try {
    existingClipsData = JSON.parse(fs.readFileSync(clipsFilePath, 'utf8'));
    if (!existingClipsData.clips) existingClipsData.clips = {};
  } catch (err) {
    console.warn("⚠️ Não foi possível ler mocks/clips.json existente, iniciando novo.");
  }
}

function getAuthHeaders() {
  return {
    "X-API-Key": cleanKey,
    "Accept": "application/json",
    "User-Agent": "MiojoTaticoClipsBot/1.0"
  };
}

// Extrai metadados do array do Allstar
function parseMetadata(metaArray) {
  const result = {
    map: "",
    weapon: "",
    killCount: "",
    headshots: "",
    situation: ""
  };

  if (!Array.isArray(metaArray)) return result;

  metaArray.forEach(item => {
    const key = (item.key || "").toLowerCase();
    const val = item.value || "";

    if (key.includes("map")) result.map = val;
    else if (key.includes("weapon")) result.weapon = val;
    else if (key.includes("kill count") || key === "killcount") result.killCount = val;
    else if (key.includes("headshot")) result.headshots = val;
    else if (key.includes("situation")) result.situation = val;
  });

  return result;
}

async function fetchPlayerClip(jogador) {
  if (!jogador.steam64_id) {
    console.log(`⏩ [PULANDO] ${jogador.nome}: sem steam64_id cadastrado.`);
    return false;
  }

  const steamId = jogador.steam64_id.trim();
  const headers = getAuthHeaders();

  // Tentativa 1: Endpoint /user/clips com sort por date
  // Tentativa 2: Endpoint /cs/clips caso o primeiro não retorne
  const endpoints = [
    `https://prt.allstar.gg/user/clips?steamId=${steamId}&limit=1&sort=date`,
    `https://prt.allstar.gg/cs/clips?steamId=${steamId}&limit=1`
  ];

  console.log(`\n🔍 [BUSCANDO] ${jogador.nome} (SteamID: ${steamId})...`);

  for (const url of endpoints) {
    try {
      console.log(`   🌐 GET: ${url}`);
      const res = await fetch(url, { headers });
      const bodyText = await res.text();

      if (res.ok) {
        let json;
        try {
          json = JSON.parse(bodyText);
        } catch (e) {
          console.error(`   ❌ Resposta inválida da API:`, bodyText.slice(0, 100));
          continue;
        }

        const clips = json?.data?.clips;
        if (Array.isArray(clips) && clips.length > 0) {
          const rawClip = clips[0];
          const parsedMeta = parseMetadata(rawClip.metadata || rawClip.additionalData);

          const formattedClip = {
            id: rawClip._id || rawClip.shareId || `clip_${jogador.nome}`,
            clipUrl: rawClip.clipUrl || `https://allstar.gg/iframe?clip=${rawClip.shareId || rawClip._id}`,
            shareId: rawClip.shareId || rawClip._id,
            title: rawClip.clipTitle || `${jogador.nome} Destaque CS2`,
            snapshotUrl: rawClip.clipSnapshotURL || rawClip.clipImageThumbURL || "",
            thumbUrl: rawClip.clipImageThumbURL || rawClip.clipSnapshotURL || "",
            length: rawClip.clipLength || 0,
            round: rawClip.roundNumber || 0,
            createdDate: rawClip.createdDate || new Date().toISOString(),
            metadata: parsedMeta,
            playerName: jogador.nome,
            playerFoto: jogador.foto,
            playerRole: jogador.funcao,
            steamId: jogador.steam64_id
          };

          existingClipsData.clips[jogador.nome] = formattedClip;
          console.log(`   🎉 [SUCESSO] Clipe encontrado: "${formattedClip.title}" (${formattedClip.clipUrl})`);
          return true;
        } else {
          console.log(`   ℹ️ Nenhum clipe encontrado neste endpoint para ${jogador.nome}.`);
        }
      } else if (res.status === 404) {
        console.log(`   ⚠️ Jogador não possui clipes registrados no Allstar (HTTP 404).`);
        break; // Não adianta tentar o próximo se o usuário não existe
      } else {
        console.error(`   ❌ HTTP ${res.status}: ${bodyText.slice(0, 150)}`);
      }
    } catch (err) {
      console.error(`   ❌ Erro ao conectar com Allstar API:`, err.message);
    }
  }

  // Se já existia um clipe salvo anteriormente, mantemos e marcamos aviso
  if (existingClipsData.clips[jogador.nome]) {
    console.log(`   💾 Mantendo clipe anterior de ${jogador.nome}.`);
  } else {
    console.log(`   ⚪ ${jogador.nome} permanece sem clipes no momento.`);
  }

  return false;
}

async function main() {
  let updatedCount = 0;

  for (const jogador of jogadores) {
    const success = await fetchPlayerClip(jogador);
    if (success) updatedCount++;
  }

  existingClipsData.updatedAt = new Date().toISOString();

  // Salvar no arquivo mocks/clips.json
  fs.writeFileSync(clipsFilePath, JSON.stringify(existingClipsData, null, 2), 'utf8');

  console.log("\n=========================================");
  console.log(`✨ Sincronização de Clipes concluída!`);
  console.log(`📊 Clipes atualizados nesta execução: ${updatedCount}/${jogadores.length}`);
  console.log(`📁 Salvo em: ${clipsFilePath}`);
  console.log("=========================================");
}

main();
