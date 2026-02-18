function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("show");
}

// Preencher dados da última vitória
document.getElementById("timeCasa").innerText = siteData.ultimaVitoria.timeCasa;
document.getElementById("placar").innerText = siteData.ultimaVitoria.placar;
document.getElementById("timeFora").innerText = siteData.ultimaVitoria.timeFora;
document.getElementById("mvp").innerText = "MVP: " + siteData.ultimaVitoria.mvp;

// Preencher jogadores
const lista = document.getElementById("listaJogadores");

siteData.jogadores.forEach(jogador => {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <img src="${jogador.foto}" alt="Foto de ${jogador.nome}" class="avatar" />
    <strong>${jogador.nome}</strong><br>
    <small>${jogador.funcao}</small>
    <div class="status">${jogador.status}</div>
  `;

  lista.appendChild(div);
});

document.getElementById("proxAdversario").innerText = siteData.partidas.proxima.adversario;
document.getElementById("proxData").innerText = siteData.partidas.proxima.data;
document.getElementById("proxMapa").innerText = siteData.partidas.proxima.mapa;

const historicoDiv = document.getElementById("historicoPartidas");

siteData.partidas.historico.forEach(jogo => {
  const div = document.createElement("div");
  div.className = "match-item";

  div.innerHTML = `
    <strong>${jogo.resultado}</strong> — ${jogo.placar} vs ${jogo.adversario}<br>
    <small>Mapa: ${jogo.mapa} | MVP: ${jogo.mvp}</small>
  `;

  historicoDiv.appendChild(div);
});