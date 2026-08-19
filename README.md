# 🍜 Miojo Tático E-Sports

Site oficial da equipe amadora de CS2 **Miojo Tático**. O projeto consome estatísticas em tempo real diretamente da API do **Leetify** através de automação serverless via **GitHub Actions**.

🌐 **Acesse o site:** [https://miojotaticoe-sports.github.io](https://miojotaticoe-sports.github.io)

---

## 🚀 Funcionalidades

- **Cards da Equipe:** Exibição do rating Leetify, winrate % e total de partidas em tempo real.
- **Modal Interativo de Jogador:** Barras dinâmicas de Mira, Posicionamento e Utilitárias + Tempo de Reação + Flash em amigos.
- **Histórico da Equipe Agrupado:** Cruza as partidas recentes de todos os jogadores para identificar jogos disputados juntos com avatares da lineup em campo.
- **Seção Última Vitória & Próxima Partida:** Destaque para os últimos resultados do time.
- **Automação Leetify (CI/CD):** Cron job executado a cada 4 horas via GitHub Actions que requisita a API do Leetify e atualiza os mocks JSON sem custo de servidor.

---

## 🛠️ Estrutura do Repositório

```text
miojotaticoe-sports.github.io/
├── .github/
│   └── workflows/
│       └── update-leetify.yml   # Workflow do GitHub Actions (Cron + Trigger Manual)
├── avatars/                      # Imagens de perfil dos jogadores
├── mocks/                        # Respostas JSON da API do Leetify por jogador
├── scripts/
│   └── fetch-leetify.js         # Script Node.js de busca e sincronização com o Leetify
├── data.js                       # Cadastro da equipe, IDs Steam64 e informações estáticas
├── index.html                    # Estrutura principal da aplicação web (JAMstack)
├── logo.png                      # Logo oficial do time
├── script.js                     # Lógica frontend, ordenação, agrupamento e modal
└── styles.css                    # Design system (Glassmorphism, Dark Theme, Flexbox/Grid)
```

---

## 🔑 Configuração do GitHub Actions

Para a sincronização automática funcionar no repositório:

1. Vá em **Settings** no GitHub ➔ **Secrets and variables** ➔ **Actions**.
2. Crie a Secret de Repositório chamada `LEETIFY_API_KEY` com sua chave obtida no [Leetify Developer](https://leetify.com/app/developer).
3. Vá em **Actions** ➔ **General** e garanta que **Workflow permissions** esteja definido para *Read and write permissions*.
