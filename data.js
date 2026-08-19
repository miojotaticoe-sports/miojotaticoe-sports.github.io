const siteData = {
  ultimaVitoria: {
    timeCasa: "Miojo Tático",
    logoCasa: "logo.png",
    placar: "13 x 7",
    timeFora: "Inimigos do Clutch",
    logoFora: "enemy.jpg",
    data: "2026-06-20",
    mapa: "de_cache",
    mvp: "Foulen"
  },

  partidas: {
    proxima: {
      adversario: "Aguardando oponente digno",
      data: "A definir",
      mapa: "A definir"
    },
    historico: [
      { resultado: "Vitória", placar: "13 - 11", adversario: "Inimigos do Clutch", mapa: "Mirage", mvp: "Vavalk" },
      { resultado: "Derrota", placar: "4 - 13", adversario: "Tryhards FC", mapa: "Dust II", mvp: "Foulen" },
      { resultado: "Empate Moral", placar: "12 - 12", adversario: "Time Aleatório", mapa: "Nuke", mvp: "Lucão" }
    ]
  },

  jogadores: [
    { nome: "Andersono", funcao: "Support", foto: "avatars/andersono.png", status: "Support Caótico", mockFile: "mocks/andersono.json", leetifyId: null, steam64_id: "76561198063443948" },
    { nome: "Angeli", funcao: "Entry Fragger", foto: "avatars/angeli.png", status: "Não quer mais jogar", mockFile: "mocks/angeli.json", leetifyId: "5a42bac2-3c59-48eb-a259-eff6b8c67ae5", steam64_id: "76561198083071115" },
    { nome: "Ostaquinho", funcao: "Support", foto: "avatars/ostaquinho.png", status: "Teclado engordurado", mockFile: "mocks/ostaquinho.json", leetifyId: "c56ad5c9-12cf-47ab-82d6-199a7ee9564e", steam64_id: "76561199226399136" },
    { nome: "Foulen", funcao: "AWP", foto: "avatars/foulen.png", status: "Leite Ninho", mockFile: "mocks/foulen.json", leetifyId: "9fd199fb-5468-4cf0-93de-728b4de0b112", steam64_id: "76561198402512698" },
    { nome: "Lucão", funcao: "IGL", foto: "avatars/lucao.png", status: "Chamando tática duvidosa", mockFile: "mocks/lucao.json", leetifyId: "d0df4f97-0022-49c7-9f23-0dc971afec3e", steam64_id: "76561198020209185" },
    { nome: "Mouse Face", funcao: "Support", foto: "avatars/wendnel.png", status: "Rushando sem pensar", mockFile: "mocks/wendnel.json", leetifyId: "ff4ed643-9df7-4956-b3c6-fcf3cf743e15", steam64_id: "76561199014407329" },
    { nome: "Vavalk", funcao: "Support", foto: "avatars/vavalk.png", status: "Trabalhando", mockFile: "mocks/vavalk.json", leetifyId: "6a10c899-60d6-4eee-8e0d-ddc5596d26cd", steam64_id: "76561199679487431" },
    { nome: "Risadinha", funcao: "Support", foto: "avatars/risadinha.png", status: "Lurker", mockFile: "mocks/risadinha.json", leetifyId: "5daee43b-21fa-4a1a-8529-fa66120c9bfe", steam64_id: "76561198241857054" }
  ],

  conquistas: [
    { titulo: "13 - 0 Perfeito", desc: "Vitória esmagadora na Dust II sem perder um único round.", data: "2026", icone: "🏆" },
    { titulo: "Clutch 1v4 Inesquecível", desc: "Foulen garante o round de AWP no pistol contra 4 inimigos.", data: "2026", icone: "⚡" },
    { titulo: "Campeões do Corujão", desc: "1º Lugar no torneio amador de sexta-feira à noite.", data: "2026", icone: "🥇" },
    { titulo: "O Flash Mágico", desc: "Partida vencida com o time inteiro cego pelo Ostaquinho.", data: "2026", icone: "💥" }
  ],

  noticias: [
    {
      id: 1,
      titulo: "Miojo Tático renova com Vavalk por mais 5 pacotes de Miojo Galinha Caipira",
      data: "18/08/2026",
      categoria: "CONTRATAÇÕES",
      resumo: "Após atingir rating +4.13 no Leetify, o suporte garantiu permanência na equipe com bônus de tempero.",
      conteudo: "A diretoria do Miojo Tático E-Sports anunciou hoje a renovação do contrato de Vavalk. O jogador, que atualmente lidera o Leetify Rating da equipe com impressionantes +4.13, aceitou a proposta salarial que inclui 5 pacotes de miojo sabor Galinha Caipira e direito a escolher o mapa da próxima partida."
    },
    {
      id: 2,
      titulo: "Análise Tática: Por que rushar B no eco funciona 40% das vezes",
      data: "16/08/2026",
      categoria: "ESTRATÉGIA",
      resumo: "Estatísticas compiladas revelam que a falta de tática é a melhor tática do grupo.",
      conteudo: "Segundo dados extraídos do Leetify, o Miojo Tático possui uma taxa de sucesso de 40% em rounds eco quando todos os 5 jogadores correm juntos para o bombsite B sem olhar para trás. 'Se nós não sabemos o que estamos fazendo, o inimigo também não sabe', declarou o IGL Lucão."
    },
    {
      id: 3,
      titulo: "Lucão anuncia nova tática 'Fake A, Corre B e Reza'",
      data: "12/08/2026",
      categoria: "TREINAMENTO",
      resumo: "Nova jogada ensaiada promete revolucionar os jogos de sexta à noite.",
      conteudo: "Em sessão de treino no mapa Cache, Lucão apresentou a nova estratégia da equipe. A jogada consiste em jorrar 4 granadas no bomb A e correr imediatamente em fila indiana para a B pedindo proteção divina."
    }
  ],

  loja: [
    { id: "jersey", nome: "Jersey Oficial Cyberpunk 2026", preco: "R$ 139,90", tag: "NOVO", foto: "logo.png", status: "disponivel" },
    { id: "mousepad", nome: "Mousepad Gigante Sabor Galinha Caipira", preco: "R$ 59,90", tag: "MAIS VENDIDO", foto: "logo.png", status: "esgotado" },
    { id: "caneca", nome: "Caneca 'Chamando Tática Duvidosa'", preco: "R$ 39,90", tag: "EXCLUSIVO", foto: "logo.png", status: "disponivel" },
    { id: "dipirona", nome: "Kit Dipirona 500mg Pós-Ranked", preco: "R$ 19,90", tag: "ESSENCIAL", foto: "logo.png", status: "disponivel" }
  ],

  patrocinadores: [
    { nome: "Nissin Miojo", tipo: "Patrocinador Master", icone: "🍜" },
    { nome: "Café Extra Forte", tipo: "Energia pro Corujão", icone: "☕" },
    { nome: "Dipirona 500mg", tipo: "Suporte Pós-Ranked", icone: "💊" },
    { nome: "Teclado Engordurado Inc.", tipo: "Equipamentos Pro", icone: "⌨️" }
  ]
};