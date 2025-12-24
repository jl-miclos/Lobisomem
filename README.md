# 🐺 Lobinho: Pass-and-Play (React)

Um jogo de dedução social inspirado em clássicos como **Cidade Dorme**, **Máfia** e **Lobisomem (Werewolf)**. O projeto foi desenvolvido em React e focado na experiência **Pass-and-Play**, onde múltiplos jogadores locais utilizam o mesmo dispositivo para realizar suas ações secretas.

## 🚀 Funcionalidades

- **Configuração Dinâmica:** Adicione jogadores com numeração automática inteligente.
- **Distribuição de Papéis:** Sorteio automático de Lobisomens, Aldeões e papéis especiais.
- **Ciclo Noite/Dia:** Interface temática que muda conforme a fase do jogo.
- **Papéis Especiais Implementados:**
  - **👁️ Vidente:** Descobre o papel de outros jogadores.
  - **🛡️ Médico:** Protege um alvo contra ataques noturnos.
  - **🧪 Bruxa:** Possui uma poção de cura e uma de veneno (uso único).
  - **🏹 Caçador:** Se morrer, dispara uma vingança imediata contra um alvo.
- **Lógica de Conflitos Refinada:** O sistema resolve automaticamente interações complexas (Ex: O Médico não pode se proteger da vingança do Caçador, mas pode se proteger do veneno da Bruxa).
- **Interface Responsiva:** Otimizada para dispositivos móveis (Mobile First).

## 🛠️ Tecnologias Utilizadas

- **React.js** (Hooks: `useState`, `useEffect`)
- **CSS3** (Flexbox, Grid, Variáveis CSS)
- **JavaScript (ES6+)**
- **Git/GitHub**