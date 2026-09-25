const mockCache = {};

function toggleMenu() {
  const menu = document.getElementById("menu");
  if (menu) {
    menu.classList.toggle("show");
  }
}

// Fechar menu mobile ao clicar em um item
function setupMobileMenuAutoClose() {
  const menuLinks = document.querySelectorAll(".menu a");
  const menu = document.getElementById("menu");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (menu && menu.classList.contains("show")) {
        menu.classList.remove("show");
      }
    });
  });
}

// Scrollspy para destacar o link ativo do menu
function setupScrollspy() {
  const sections = document.querySelectorAll("main[id], section[id]");
  const navLinks = document.querySelectorAll(".menu a");

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -60% 0px",
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

// Helper de formatação de data (ex: 20/06/2026)
function formatarData(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Preencher dados da última vitória
function preencherVitoria() {
  if (!siteData || !siteData.ultimaVitoria) return;
  const timeCasa = document.getElementById("timeCasa");
  const placar = document.getElementById("placar");
  const dataVitoria = document.getElementById("dataVitoria");
  const timeFora = document.getElementById("timeFora");
  const mvp = document.getElementById("mvp");

  if (timeCasa) {
    if (siteData.ultimaVitoria.logoCasa) {
      timeCasa.innerHTML = `<img src="${siteData.ultimaVitoria.logoCasa}" alt="${siteData.ultimaVitoria.timeCasa}" class="team-logo-img" title="${siteData.ultimaVitoria.timeCasa}" />`;
    } else {
      timeCasa.innerText = siteData.ultimaVitoria.timeCasa;
    }
  }

  if (placar) placar.innerText = siteData.ultimaVitoria.placar;

  if (dataVitoria) {
    const dtFormatada = formatarData(siteData.ultimaVitoria.data);
    const mapaName = (siteData.ultimaVitoria.mapa || "").replace("de_", "").toUpperCase();
    dataVitoria.innerHTML = `📅 ${dtFormatada} ${mapaName ? '| ' + mapaName : ''}`;
  }

  if (timeFora) {
    if (siteData.ultimaVitoria.logoFora) {
      timeFora.innerHTML = `<img src="${siteData.ultimaVitoria.logoFora}" alt="${siteData.ultimaVitoria.timeFora}" class="team-logo-img" title="${siteData.ultimaVitoria.timeFora}" />`;
    } else {
      timeFora.innerText = siteData.ultimaVitoria.timeFora;
    }
  }

  if (mvp) mvp.innerText = "MVP: " + siteData.ultimaVitoria.mvp;
}

const allTeamMatchesMap = new Map();

// Preencher dados de partidas (próxima partida e fallback estático)
function preencherPartidas() {
  if (!siteData || !siteData.partidas) return;

  if (siteData.partidas.proxima) {
    const proxAdv = document.getElementById("proxAdversario");
    const proxData = document.getElementById("proxData");
    const proxMapa = document.getElementById("proxMapa");

    if (proxAdv) proxAdv.innerText = siteData.partidas.proxima.adversario;
    if (proxData) proxData.innerText = siteData.partidas.proxima.data;
    if (proxMapa) proxMapa.innerText = siteData.partidas.proxima.mapa;
  }
}

// Registrar partidas dos mocks e renderizar as 3 mais recentes com a lineup do time
function registrarPartidasDoJogador(jogador, mockData) {
  if (!mockData || !mockData.recent_matches) return;

  mockData.recent_matches.forEach(m => {
    if (!m.id) return;
    if (!allTeamMatchesMap.has(m.id)) {
      allTeamMatchesMap.set(m.id, {
        id: m.id,
        finished_at: m.finished_at,
        outcome: m.outcome,
        map_name: m.map_name,
        score: m.score,
        players: [{ nome: jogador.nome, foto: jogador.foto }]
      });
    } else {
      const match = allTeamMatchesMap.get(m.id);
      if (!match.players.some(p => p.nome === jogador.nome)) {
        match.players.push({ nome: jogador.nome, foto: jogador.foto });
      }
    }
  });

  renderizarHistoricoEquipe();
}

function renderizarHistoricoEquipe() {
  const historicoDiv = document.getElementById("historicoPartidas");
  if (!historicoDiv || allTeamMatchesMap.size === 0) return;

  const sortedMatches = Array.from(allTeamMatchesMap.values())
    .sort((a, b) => new Date(b.finished_at || 0) - new Date(a.finished_at || 0));

  const top3 = sortedMatches.slice(0, 3);
  historicoDiv.innerHTML = "";

  top3.forEach(m => {
    let resultado = "Empate";
    if (m.outcome === "win") resultado = "Vitória";
    else if (m.outcome === "loss") resultado = "Derrota";

    const placar = m.score ? `${m.score[0]} - ${m.score[1]}` : "N/A";
    const mapa = (m.map_name || "de_unknown").replace("de_", "").replace("cs_", "");
    const mapaFormatted = mapa.charAt(0).toUpperCase() + mapa.slice(1);
    const dtFormatada = formatarData(m.finished_at);

    const lineupBadges = m.players.map(p => `
      <span class="lineup-player" title="${p.nome}">
        <img src="${p.foto}" alt="${p.nome}" class="lineup-avatar" />
        <span>${p.nome}</span>
      </span>
    `).join("");

    const div = document.createElement("div");
    div.className = "match-item";
    div.innerHTML = `
      <strong>${resultado}</strong> — ${placar}<br>
      <small>📅 ${dtFormatada} | Mapa: ${mapaFormatted}</small>
      <div class="match-lineup">
        <span class="lineup-label">👥 Miojos em campo:</span>
        ${lineupBadges}
      </div>
    `;
    historicoDiv.appendChild(div);
  });

  // Atualizar dinamicamente a seção 'Última Vitória' se houver uma vitória mais recente nos dados do Leetify
  const ultimaVitDinamica = sortedMatches.find(m => m.outcome === "win");
  if (ultimaVitDinamica) {
    const dataDinamica = new Date(ultimaVitDinamica.finished_at || 0);
    const dataEstatica = siteData?.ultimaVitoria?.data ? new Date(siteData.ultimaVitoria.data) : new Date(0);

    if (dataDinamica >= dataEstatica) {
      const timeCasa = document.getElementById("timeCasa");
      const placar = document.getElementById("placar");
      const dataVitoria = document.getElementById("dataVitoria");
      const timeFora = document.getElementById("timeFora");
      const mvp = document.getElementById("mvp");

      if (timeCasa) {
        timeCasa.innerHTML = `<img src="logo.png" alt="Miojo Tático" class="team-logo-img" title="Miojo Tático" />`;
      }
      if (placar) {
        placar.innerText = `${ultimaVitDinamica.score[0]} - ${ultimaVitDinamica.score[1]}`;
      }
      if (dataVitoria) {
        const dtFormatada = formatarData(ultimaVitDinamica.finished_at);
        const mapaName = (ultimaVitDinamica.map_name || "").replace("de_", "").replace("cs_", "").toUpperCase();
        dataVitoria.innerHTML = `📅 ${dtFormatada} ${mapaName ? '| ' + mapaName : ''}`;
      }
      if (timeFora) {
        timeFora.innerText = "Matchmaking";
      }
      if (mvp) {
        const nomes = ultimaVitDinamica.players.map(p => p.nome).join(", ");
        mvp.innerText = "Destaques: " + (nomes || "Miojo Tático");
      }
    }
  }
}

// Preencher jogadores e conectar mocks do Leetify
async function carregarJogadores() {
  const lista = document.getElementById("listaJogadores");
  if (!lista || !siteData || !siteData.jogadores) return;

  lista.innerHTML = "";

  for (const jogador of siteData.jogadores) {
    const div = document.createElement("div");
    div.className = "card player-card";

    let statsHtml = `<div class="player-stats-fallback">Sem dados Leetify</div>`;
    let mockData = null;

    if (jogador.mockFile) {
      try {
        if (mockCache[jogador.mockFile]) {
          mockData = mockCache[jogador.mockFile];
        } else {
          const response = await fetch(`${jogador.mockFile}?t=${Date.now()}`);
          if (response.ok) {
            mockData = await response.json();
            mockCache[jogador.mockFile] = mockData;
          }
        }

        if (mockData) {
          registrarPartidasDoJogador(jogador, mockData);
          const leetifyRating = mockData.ranks?.leetify ?? null;
          const winratePct = mockData.winrate !== undefined ? (mockData.winrate * 100).toFixed(1) + "%" : "N/A";
          const totalMatches = mockData.total_matches ?? "N/A";

          let ratingClass = "rating-neutral";
          let ratingText = "N/A";

          if (leetifyRating !== null && leetifyRating !== undefined) {
            const formattedVal = (leetifyRating > 0 ? "+" : "") + Number(leetifyRating).toFixed(2);
            ratingClass = leetifyRating >= 0 ? "rating-positive" : "rating-negative";
            ratingText = formattedVal;
          }

          statsHtml = `
            <div class="player-stats">
              <div class="stat-badge ${ratingClass}" title="Rating Leetify">
                <span class="stat-label">Leetify:</span> <strong>${ratingText}</strong>
              </div>
              <div class="stat-badge" title="Taxa de Vitória">
                <span class="stat-label">Winrate:</span> <strong>${winratePct}</strong>
              </div>
              <div class="stat-badge" title="Total de Partidas">
                <span class="stat-label">Partidas:</span> <strong>${totalMatches}</strong>
              </div>
            </div>
          `;
        }
      } catch (err) {
        console.warn(`Não foi possível carregar o mock de ${jogador.nome}:`, err);
      }
    }

    const targetId = jogador.steam64_id || jogador.leetifyId || mockData?.steam64_id || mockData?.id;
    const leetifyLinkHtml = targetId
      ? `<a href="https://leetify.com/app/profile/${targetId}" target="_blank" rel="noopener noreferrer" class="leetify-data-link" onclick="event.stopPropagation()">View on Leetify ↗</a>`
      : "";

    div.innerHTML = `
      <img src="${jogador.foto}" alt="Foto de ${jogador.nome}" class="avatar" />
      <strong class="player-name">${jogador.nome}</strong><br>
      <small class="player-role">${jogador.funcao}</small>
      <div class="status">${jogador.status}</div>
      ${statsHtml}
      ${leetifyLinkHtml}
      <div class="click-hint">🔍 Clique para detalhes</div>
    `;

    // Evento de clique para abrir o Modal
    div.addEventListener("click", () => {
      abrirModalJogador(jogador, mockData);
    });

    lista.appendChild(div);
  }

  // Renderizar Hall da Fama, Comparador e Radar de Mapas após carregar os mocks
  renderizarHallDaFama();
  inicializarComparadorVersus();
  renderizarRadarDeMapas();
}

// ===== Hall da Fama (Troféus do Time) =====
function renderizarHallDaFama() {
  const trophyGrid = document.getElementById("trophyGrid");
  if (!trophyGrid) return;

  const validPlayers = [];
  for (const j of siteData.jogadores) {
    if (j.mockFile && mockCache[j.mockFile]) {
      validPlayers.push({ jogador: j, mock: mockCache[j.mockFile] });
    }
  }

  if (validPlayers.length === 0) return;

  // Calculando vencedores dos troféus:
  const mvpLeetify = [...validPlayers].sort((a, b) => (b.mock.ranks?.leetify ?? -999) - (a.mock.ranks?.leetify ?? -999))[0];
  const aimGod = [...validPlayers].sort((a, b) => (b.mock.rating?.aim ?? 0) - (a.mock.rating?.aim ?? 0))[0];
  const fastReaction = [...validPlayers].filter(p => p.mock.stats?.reaction_time_ms).sort((a, b) => a.mock.stats.reaction_time_ms - b.mock.stats.reaction_time_ms)[0];
  const teamFlasher = [...validPlayers].filter(p => p.mock.stats?.flashbang_hit_friend_per_flashbang !== undefined).sort((a, b) => b.mock.stats.flashbang_hit_friend_per_flashbang - a.mock.stats.flashbang_hit_friend_per_flashbang)[0];
  const utilMaster = [...validPlayers].sort((a, b) => (b.mock.rating?.utility ?? 0) - (a.mock.rating?.utility ?? 0))[0];

  const trophies = [
    {
      title: "👑 MVP do Leetify",
      desc: "Maior Rating Geral",
      winner: mvpLeetify?.jogador,
      val: mvpLeetify ? `${(mvpLeetify.mock.ranks?.leetify > 0 ? "+" : "")}${Number(mvpLeetify.mock.ranks?.leetify).toFixed(2)}` : "N/A",
      icon: "🏆"
    },
    {
      title: "🎯 Rei da Mira",
      desc: "Maior Precisão / Aim Rating",
      winner: aimGod?.jogador,
      val: aimGod ? `${Math.round(aimGod.mock.rating?.aim || 0)} / 100` : "N/A",
      icon: "🎯"
    },
    {
      title: "⚡ Reflexo de Gato",
      desc: "Menor Tempo de Reação",
      winner: fastReaction?.jogador,
      val: fastReaction ? `${Math.round(fastReaction.mock.stats?.reaction_time_ms)} ms` : "N/A",
      icon: "⚡"
    },
    {
      title: "💣 Terror dos Amigos",
      desc: "Maior Cegador de Aliados",
      winner: teamFlasher?.jogador,
      val: teamFlasher ? `${(teamFlasher.mock.stats?.flashbang_hit_friend_per_flashbang).toFixed(2)} / flash` : "N/A",
      icon: "😵‍💫"
    },
    {
      title: "🛡️ Mestre Utilitário",
      desc: "Melhor Uso de Granadas",
      winner: utilMaster?.jogador,
      val: utilMaster ? `${Math.round(utilMaster.mock.rating?.utility || 0)} / 100` : "N/A",
      icon: "💣"
    }
  ];

  trophyGrid.innerHTML = trophies.map(t => {
    if (!t.winner) return "";
    return `
      <div class="trophy-card">
        <div class="trophy-icon">${t.icon}</div>
        <div class="trophy-title">${t.title}</div>
        <div class="trophy-desc">${t.desc}</div>
        <div class="trophy-winner">
          <img src="${t.winner.foto}" alt="${t.winner.nome}" class="trophy-avatar" />
          <div>
            <strong>${t.winner.nome}</strong>
            <div class="trophy-val">${t.val}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ===== Comparador X1 (Modo Versus) =====
function inicializarComparadorVersus() {
  const sel1 = document.getElementById("playerSelect1");
  const sel2 = document.getElementById("playerSelect2");
  if (!sel1 || !sel2 || !siteData?.jogadores) return;

  const validJ = siteData.jogadores.filter(j => j.mockFile && mockCache[j.mockFile]);
  if (validJ.length < 2) return;

  const options = validJ
    .map(j => `<option value="${j.nome}">${j.nome}</option>`)
    .join("");

  sel1.innerHTML = options;
  sel2.innerHTML = options;

  sel1.selectedIndex = 0;
  sel2.selectedIndex = 1;

  compararJogadores();
}

function compararJogadores() {
  const sel1 = document.getElementById("playerSelect1");
  const sel2 = document.getElementById("playerSelect2");
  const resDiv = document.getElementById("versusResults");
  if (!sel1 || !sel2 || !resDiv) return;

  const j1 = siteData.jogadores.find(j => j.nome === sel1.value);
  const j2 = siteData.jogadores.find(j => j.nome === sel2.value);

  if (!j1 || !j2) return;

  const mock1 = mockCache[j1.mockFile] || {};
  const mock2 = mockCache[j2.mockFile] || {};

  const statsList = [
    { label: "Rating Leetify", v1: mock1.ranks?.leetify ?? 0, v2: mock2.ranks?.leetify ?? 0, fmt: v => (v > 0 ? "+" : "") + Number(v).toFixed(2) },
    { label: "Mira (Aim)", v1: Math.round(mock1.rating?.aim || 0), v2: Math.round(mock2.rating?.aim || 0), fmt: v => v + " / 100" },
    { label: "Posicionamento", v1: Math.round(mock1.rating?.positioning || 0), v2: Math.round(mock2.rating?.positioning || 0), fmt: v => v + " / 100" },
    { label: "Utilitárias", v1: Math.round(mock1.rating?.utility || 0), v2: Math.round(mock2.rating?.utility || 0), fmt: v => v + " / 100" },
    { label: "Winrate", v1: mock1.winrate ? Math.round(mock1.winrate * 100) : 0, v2: mock2.winrate ? Math.round(mock2.winrate * 100) : 0, fmt: v => v + "%" },
    { label: "Tempo de Reação", v1: Math.round(mock1.stats?.reaction_time_ms || 999), v2: Math.round(mock2.stats?.reaction_time_ms || 999), fmt: v => v + " ms", lowerIsBetter: true }
  ];

  const rows = statsList.map(st => {
    let win1 = false;
    let win2 = false;

    if (st.lowerIsBetter) {
      if (st.v1 < st.v2) win1 = true;
      else if (st.v2 < st.v1) win2 = true;
    } else {
      if (st.v1 > st.v2) win1 = true;
      else if (st.v2 > st.v1) win2 = true;
    }

    return `
      <div class="versus-row">
        <div class="versus-val ${win1 ? 'winner' : ''}">${st.fmt(st.v1)}</div>
        <div class="versus-label">${st.label}</div>
        <div class="versus-val ${win2 ? 'winner' : ''}">${st.fmt(st.v2)}</div>
      </div>
    `;
  }).join("");

  resDiv.innerHTML = `
    <div class="versus-header">
      <div class="versus-player">
        <img src="${j1.foto}" alt="${j1.nome}" class="versus-avatar" />
        <strong>${j1.nome}</strong>
        <small>${j1.funcao}</small>
      </div>
      <div class="versus-badge-vs">VS</div>
      <div class="versus-player">
        <img src="${j2.foto}" alt="${j2.nome}" class="versus-avatar" />
        <strong>${j2.nome}</strong>
        <small>${j2.funcao}</small>
      </div>
    </div>
    <div class="versus-rows-list">
      ${rows}
    </div>
  `;
}

// ===== Radar de Mapas (Pool da Equipe) =====
function renderizarRadarDeMapas() {
  const mapGrid = document.getElementById("mapGrid");
  if (!mapGrid || allTeamMatchesMap.size === 0) return;

  const mapStatsMap = new Map();

  allTeamMatchesMap.forEach(m => {
    if (!m.map_name) return;
    const cleanMap = m.map_name.replace("de_", "").replace("cs_", "");
    const mapName = cleanMap.charAt(0).toUpperCase() + cleanMap.slice(1);

    if (!mapStatsMap.has(mapName)) {
      mapStatsMap.set(mapName, { mapName, total: 0, wins: 0, losses: 0, ties: 0 });
    }

    const st = mapStatsMap.get(mapName);
    st.total++;
    if (m.outcome === "win") st.wins++;
    else if (m.outcome === "loss") st.losses++;
    else st.ties++;
  });

  const sortedMaps = Array.from(mapStatsMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  mapGrid.innerHTML = sortedMaps.map(m => {
    const winratePct = Math.round((m.wins / m.total) * 100);
    let barColor = "linear-gradient(90deg, #ff4444, #ffaa00)";
    if (winratePct >= 50) barColor = "linear-gradient(90deg, #00c6ff, #00ff9c)";

    return `
      <div class="map-card">
        <div class="map-header">
          <strong>${m.mapName}</strong>
          <span class="map-winrate">${winratePct}% Vitória</span>
        </div>
        <div class="map-progress-bg">
          <div class="map-progress-fill" style="width: ${winratePct}%; background: ${barColor}"></div>
        </div>
        <div class="map-details">
          <span>🎮 Jogos: ${m.total}</span>
          <span>🟢 V: ${m.wins} | 🟡 E: ${m.ties} | 🔴 D: ${m.losses}</span>
        </div>
      </div>
    `;
  }).join("");
}

// ===== Renderizar Notícias =====
function renderizarNoticias() {
  const newsGrid = document.getElementById("newsGrid");
  if (!newsGrid || !siteData?.noticias) return;

  newsGrid.innerHTML = siteData.noticias.map(n => `
    <div class="news-card">
      <div class="news-category">${n.categoria}</div>
      <h3 class="news-title">${n.titulo}</h3>
      <div class="news-date">📅 ${n.data}</div>
      <p class="news-snippet">${n.resumo}</p>
    </div>
  `).join("");
}

// ===== Renderizar Loja Oficial =====
function renderizarLoja() {
  const storeGrid = document.getElementById("storeGrid");
  if (!storeGrid || !siteData?.loja) return;

  storeGrid.innerHTML = siteData.loja.map(item => {
    const isEsgotado = item.status === "esgotado";
    const btnText = isEsgotado ? "Esgotado" : "🛒 Comprar";
    const btnClass = isEsgotado ? "btn-disabled" : "btn-buy";
    const onclickAttr = isEsgotado ? "" : `onclick="adicionarAoCarrinho('${item.nome}')"`;

    return `
      <div class="store-card">
        <span class="store-badge">${item.tag}</span>
        <img src="${item.foto}" alt="${item.nome}" class="store-img" />
        <h3 class="store-item-name">${item.nome}</h3>
        <div class="store-price">${item.preco}</div>
        <button class="${btnClass}" ${onclickAttr}>${btnText}</button>
      </div>
    `;
  }).join("");
}

function adicionarAoCarrinho(nomeItem) {
  alert(`🛒 [LOJA MIOJO] "${nomeItem}" foi adicionado ao seu carrinho fictício!`);
}

// ===== Renderizar Patrocinadores =====
function renderizarPatrocinadores() {
  const sponsorsGrid = document.getElementById("sponsorsGrid");
  if (!sponsorsGrid || !siteData?.patrocinadores) return;

  sponsorsGrid.innerHTML = siteData.patrocinadores.map(s => `
    <div class="sponsor-card">
      <div class="sponsor-icon">${s.icone}</div>
      <strong class="sponsor-name">${s.nome}</strong>
      <small class="sponsor-type">${s.tipo}</small>
    </div>
  `).join("");
}

// Lógica de Renderização do Modal
function abrirModalJogador(jogador, mockData) {
  const modal = document.getElementById("playerModal");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalBody) return;

  let ratingsSection = "";
  let keyStatsGrid = "";
  let recentMatchesHtml = "";

  if (mockData) {
    // Rating Bars (Mira, Posicionamento, Utilitárias)
    if (mockData.rating) {
      const aim = Math.round(mockData.rating.aim || 0);
      const pos = Math.round(mockData.rating.positioning || 0);
      const util = Math.round(mockData.rating.utility || 0);

      ratingsSection = `
        <div class="modal-section-title">📊 Habilidades (Leetify Rating)</div>
        <div class="rating-bar-group">
          <div class="rating-bar-header"><span>🎯 Mira (Aim)</span><strong>${aim} / 100</strong></div>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width: ${aim}%"></div></div>
        </div>
        <div class="rating-bar-group">
          <div class="rating-bar-header"><span>📍 Posicionamento</span><strong>${pos} / 100</strong></div>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width: ${pos}%"></div></div>
        </div>
        <div class="rating-bar-group">
          <div class="rating-bar-header"><span>💣 Utilitárias</span><strong>${util} / 100</strong></div>
          <div class="rating-bar-bg"><div class="rating-bar-fill" style="width: ${util}%"></div></div>
        </div>
      `;
    }

    // Calcular Melhor Mapa com base na média do leetify_rating das partidas recentes
    let melhorMapaStr = "N/A";
    if (mockData.recent_matches && mockData.recent_matches.length > 0) {
      const mapRatingsMap = new Map();
      mockData.recent_matches.forEach(m => {
        if (!m.map_name || m.leetify_rating === undefined) return;
        const cleanMap = m.map_name.replace("de_", "").replace("cs_", "");
        const mapName = cleanMap.charAt(0).toUpperCase() + cleanMap.slice(1);

        if (!mapRatingsMap.has(mapName)) {
          mapRatingsMap.set(mapName, { mapName, total: 0, count: 0 });
        }
        const st = mapRatingsMap.get(mapName);
        st.total += m.leetify_rating;
        st.count++;
      });

      const best = Array.from(mapRatingsMap.values())
        .map(m => ({ mapName: m.mapName, avg: m.total / m.count }))
        .sort((a, b) => b.avg - a.avg)[0];

      if (best) {
        const formattedRating = (best.avg > 0 ? "+" : "") + Number(best.avg).toFixed(2);
        melhorMapaStr = `${best.mapName} (${formattedRating})`;
      }
    }

    // Key Stats Grid (Reação, Flash nos Amigos, Winrate, HS %, Duetos, Melhor Mapa)
    const reactionTime = mockData.stats?.reaction_time_ms ? Math.round(mockData.stats.reaction_time_ms) + " ms" : "N/A";
    const teamFlashed = mockData.stats?.flashbang_hit_friend_per_flashbang !== undefined
      ? (mockData.stats.flashbang_hit_friend_per_flashbang).toFixed(2)
      : "N/A";
    const winratePct = mockData.winrate ? (mockData.winrate * 100).toFixed(1) + "%" : "N/A";
    const totalMatches = mockData.total_matches || "N/A";
    const hsPct = mockData.stats?.accuracy_head ? Math.round(mockData.stats.accuracy_head) + "%" : "N/A";
    const duelsPct = mockData.stats?.t_opening_duel_success_percentage ? Math.round(mockData.stats.t_opening_duel_success_percentage) + "%" : "N/A";

    keyStatsGrid = `
      <div class="modal-section-title">⚡ Estatísticas em Jogo</div>
      <div class="modal-stats-grid">
        <div class="modal-stat-card">
          <div class="lbl">Tempo Reação</div>
          <div class="val">${reactionTime}</div>
        </div>
        <div class="modal-stat-card">
          <div class="lbl">Flash em Amigos</div>
          <div class="val">${teamFlashed}</div>
        </div>
        <div class="modal-stat-card">
          <div class="lbl">Winrate</div>
          <div class="val">${winratePct}</div>
        </div>
        <div class="modal-stat-card">
          <div class="lbl">Total Jogos</div>
          <div class="val">${totalMatches}</div>
        </div>
        <div class="modal-stat-card">
          <div class="lbl">% Headshot</div>
          <div class="val">${hsPct}</div>
        </div>
        <div class="modal-stat-card">
          <div class="lbl">Duetos Abertura</div>
          <div class="val">${duelsPct}</div>
        </div>
        <div class="modal-stat-card" style="grid-column: span 2;">
          <div class="lbl">🗺️ Melhor Mapa</div>
          <div class="val" style="font-size: 14px;">${melhorMapaStr}</div>
        </div>
      </div>
    `;

    // Recent Matches
    if (mockData.recent_matches && mockData.recent_matches.length > 0) {
      const sorted = [...mockData.recent_matches].sort((a, b) => new Date(b.finished_at || 0) - new Date(a.finished_at || 0));
      const top3 = sorted.slice(0, 3);
      const rows = top3.map(m => {
        let outcomeClass = "outcome-tie";
        let outcomeLabel = "Empate";
        if (m.outcome === "win") { outcomeClass = "outcome-win"; outcomeLabel = "Vitória"; }
        else if (m.outcome === "loss") { outcomeClass = "outcome-loss"; outcomeLabel = "Derrota"; }

        const scoreStr = m.score ? `${m.score[0]} - ${m.score[1]}` : "";
        const mapName = (m.map_name || "de_unknown").replace("de_", "").replace("cs_", "");
        const mapFormatted = mapName.charAt(0).toUpperCase() + mapName.slice(1);

        const dtFormatada = formatarData(m.finished_at);
        return `
          <div class="modal-match-row">
            <div>
              <strong>${mapFormatted}</strong>
              <small style="color:#888; display:block;">📅 ${dtFormatada} | Placar: ${scoreStr}</small>
            </div>
            <div class="${outcomeClass}">${outcomeLabel}</div>
          </div>
        `;
      }).join("");

      recentMatchesHtml = `
        <div class="modal-section-title">📜 Últimas Partidas (Leetify)</div>
        <div class="modal-matches-list">${rows}</div>
      `;
    }
  } else {
    ratingsSection = `
      <div style="padding: 20px 0; text-align: center; color: #aaa; font-style: italic;">
        Sem dados de estatísticas sincronizados do Leetify (Jogador atualmente AFK ou em férias).
      </div>
    `;
  }

  const steamNick = mockData?.name ? `Steam: ${mockData.name}` : "Membro Miojo Tático";
  const targetId = jogador.steam64_id || jogador.leetifyId || mockData?.steam64_id || mockData?.id;
  const leetifyModalLink = targetId
    ? `<a href="https://leetify.com/app/profile/${targetId}" target="_blank" rel="noopener noreferrer" class="leetify-data-link" style="margin-top: 6px;">View on Leetify ↗</a>`
    : "";

  modalBody.innerHTML = `
    <div class="modal-header-info">
      <img src="${jogador.foto}" alt="${jogador.nome}" class="modal-avatar" />
      <div class="modal-title-group">
        <h2>${jogador.nome}</h2>
        <div class="modal-steam-name">${steamNick}</div>
        <div class="status">${jogador.status}</div>
        ${leetifyModalLink}
      </div>
    </div>
    ${ratingsSection}
    ${keyStatsGrid}
    ${recentMatchesHtml}
  `;

  modal.classList.add("show");
}

function fecharModalDirect() {
  const modal = document.getElementById("playerModal");
  if (modal) modal.classList.remove("show");
}

function fecharModal(event) {
  if (event.target.id === "playerModal") {
    fecharModalDirect();
  }
}

// Fechar com tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModalDirect();
  }
});

// Inicializar na carga da página
document.addEventListener("DOMContentLoaded", () => {
  preencherVitoria();
  preencherPartidas();
  carregarJogadores();
  renderizarNoticias();
  renderizarLoja();
  renderizarPatrocinadores();
  setupMobileMenuAutoClose();
  setupScrollspy();
});