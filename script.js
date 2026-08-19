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

// Preencher dados da última vitória
function preencherVitoria() {
  if (!siteData || !siteData.ultimaVitoria) return;
  const timeCasa = document.getElementById("timeCasa");
  const placar = document.getElementById("placar");
  const timeFora = document.getElementById("timeFora");
  const mvp = document.getElementById("mvp");

  if (timeCasa) timeCasa.innerText = siteData.ultimaVitoria.timeCasa;
  if (placar) placar.innerText = siteData.ultimaVitoria.placar;
  if (timeFora) timeFora.innerText = siteData.ultimaVitoria.timeFora;
  if (mvp) mvp.innerText = "MVP: " + siteData.ultimaVitoria.mvp;
}

// Preencher dados de partidas
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

  const historicoDiv = document.getElementById("historicoPartidas");
  if (historicoDiv && siteData.partidas.historico) {
    historicoDiv.innerHTML = "";
    siteData.partidas.historico.forEach(jogo => {
      const div = document.createElement("div");
      div.className = "match-item";
      div.innerHTML = `
        <strong>${jogo.resultado}</strong> — ${jogo.placar} vs ${jogo.adversario}<br>
        <small>Mapa: ${jogo.mapa} | MVP: ${jogo.mvp}</small>
      `;
      historicoDiv.appendChild(div);
    });
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
          const response = await fetch(jogador.mockFile);
          if (response.ok) {
            mockData = await response.json();
            mockCache[jogador.mockFile] = mockData;
          }
        }

        if (mockData) {
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

    div.innerHTML = `
      <img src="${jogador.foto}" alt="Foto de ${jogador.nome}" class="avatar" />
      <strong class="player-name">${jogador.nome}</strong><br>
      <small class="player-role">${jogador.funcao}</small>
      <div class="status">${jogador.status}</div>
      ${statsHtml}
      <div class="click-hint">🔍 Clique para detalhes</div>
    `;

    // Evento de clique para abrir o Modal
    div.addEventListener("click", () => {
      abrirModalJogador(jogador, mockData);
    });

    lista.appendChild(div);
  }
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

    // Key Stats Grid (Reação, Flash nos Amigos, Winrate, Partidas)
    const reactionTime = mockData.stats?.reaction_time_ms ? Math.round(mockData.stats.reaction_time_ms) + " ms" : "N/A";
    const teamFlashed = mockData.stats?.flashbang_hit_friend_per_flashbang !== undefined
      ? (mockData.stats.flashbang_hit_friend_per_flashbang).toFixed(2)
      : "N/A";
    const winratePct = mockData.winrate ? (mockData.winrate * 100).toFixed(1) + "%" : "N/A";
    const totalMatches = mockData.total_matches || "N/A";

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
      </div>
    `;

    // Recent Matches
    if (mockData.recent_matches && mockData.recent_matches.length > 0) {
      const top3 = mockData.recent_matches.slice(0, 3);
      const rows = top3.map(m => {
        let outcomeClass = "outcome-tie";
        let outcomeLabel = "Empate";
        if (m.outcome === "win") { outcomeClass = "outcome-win"; outcomeLabel = "Vitória"; }
        else if (m.outcome === "loss") { outcomeClass = "outcome-loss"; outcomeLabel = "Derrota"; }

        const scoreStr = m.score ? `${m.score[0]} - ${m.score[1]}` : "";
        const mapName = (m.map_name || "de_unknown").replace("de_", "").replace("cs_", "");
        const mapFormatted = mapName.charAt(0).toUpperCase() + mapName.slice(1);

        return `
          <div class="modal-match-row">
            <div>
              <strong>${mapFormatted}</strong>
              <small style="color:#888; display:block;">Placar: ${scoreStr}</small>
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

  modalBody.innerHTML = `
    <div class="modal-header-info">
      <img src="${jogador.foto}" alt="${jogador.nome}" class="modal-avatar" />
      <div class="modal-title-group">
        <h2>${jogador.nome}</h2>
        <div class="modal-steam-name">${steamNick}</div>
        <div class="status">${jogador.status}</div>
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
  setupMobileMenuAutoClose();
  setupScrollspy();
});