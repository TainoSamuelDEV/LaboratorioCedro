# 🌿 Brand Book & Guia de Estilo UI/UX: Laboratório Cedro
> **Projeto:** Plataforma de Experiência do Cliente (INDECX / Cedro)  
> **Referência Oficial Mapeada:** [labcedro.com.br](https://labcedro.com.br/)  
> **Objetivo:** Estabelecer a fundação estética, paleta de cores, tipografia, tokens de design, componentes de interface e regras de acessibilidade para o desenvolvimento do **Front-end (Next.js + Tailwind CSS + shadcn/ui)**.

---

## 1. Identidade e Filosofia da Marca

O **Laboratório Cedro** é a maior rede de análises clínicas e anatomia patológica do Maranhão (mais de 60 unidades). A identidade visual da marca transmite:
- **Precisão e Confiabilidade Médica:** Linhas sóbrias, contraste nítido e legibilidade máxima.
- **Acolhimento e Cuidado Humano:** Tons de verde inspirados na natureza (cedro), fundos neutros quentes e elementos arredondados que diminuem a frieza hospitalar tradicional.
- **Modernidade e Tecnologia:** Microinterações suaves, cartões flutuantes com sombras difusas e tipografia sem serifa contemporânea.

---

## 2. Logotipo Oficial

O logotipo oficial do Laboratório Cedro é composto pelo **símbolo orgânico** (anéis concêntricos estilizados que representam as camadas de crescimento de um cedro e a copa de uma árvore) e pela **marca nominativa** ("laboratório" em caixa baixa com peso leve e "CEDRO" em caixa alta com kerning expandido).

* **Cor Oficial do Vetor do Logotipo:** `#255521` (Verde Cedro Profundo).
* **Fundo de Aplicação Preferencial:** `#F3F3F3` (cinza clínico institucional) ou `#FFFFFF`.

### Código SVG Oficial do Logotipo
```xml
<svg width="321" height="101" viewBox="0 0 321 101" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Símbolo: Anéis e Copa do Cedro -->
  <path d="M80.0131 56.1206V57.5314C80.0131 58.2368 79.4377 58.812 78.7323 58.812H23.1881C22.4826 58.812 21.9107 58.2402 21.9107 57.5348V56.0897C21.9313 55.3467 22.2395 54.6789 22.7258 54.1858C23.0408 53.8708 23.4347 53.6277 23.8696 53.4907C23.9518 53.4667 24.0374 53.4428 24.1196 53.4291L24.1573 53.4188C24.1949 53.4085 24.236 53.4051 24.2737 53.3983L24.4175 53.3811C24.4484 53.3811 24.4758 53.3743 24.5066 53.3709C24.5682 53.3709 24.6333 53.364 24.7018 53.364H77.3658C78.0816 53.4017 78.7254 53.7099 79.1946 54.1824C79.6672 54.655 79.9754 55.2987 80.0097 56.0144C80.0097 56.0487 80.0097 56.0795 80.0097 56.1171L80.0131 56.1206Z" fill="#255521"/>
  <path d="M74.2015 48.683V50.0527C74.2015 50.7616 73.6295 51.3334 72.9206 51.3334H28.9997C28.2908 51.3334 27.7189 50.7616 27.7189 50.0527V48.683C27.7189 48.6351 27.7189 48.5872 27.7189 48.5392C27.7531 47.8235 28.0613 47.1763 28.5339 46.7072C29.0031 46.2347 29.6504 45.9265 30.3661 45.8922H30.51H71.4104H71.5542C72.9994 45.9299 74.1638 47.0942 74.198 48.5426C74.198 48.5906 74.198 48.6385 74.198 48.6865L74.2015 48.683Z" fill="#255521"/>
  <path d="M46.3523 10.6495C58.1331 10.6495 69.2084 15.2381 77.5371 23.5659C85.8658 31.8938 90.4548 42.9679 90.4548 54.7474C90.4548 66.527 85.8658 77.6011 77.5371 85.9289C69.2084 94.2568 58.1331 98.8453 46.3523 98.8453C34.5716 98.8453 23.4963 94.2568 15.1676 85.9289C6.83889 77.6011 2.24987 66.527 2.24987 54.7474C2.24987 42.9679 6.83889 31.8938 15.1676 23.5659C23.4963 15.2381 34.5716 10.6495 46.3523 10.6495ZM46.3523 8.86548C21.01 8.86548 0.465637 29.4077 0.465637 54.7474C0.465637 80.0871 21.01 100.629 46.3523 100.629C71.6946 100.629 92.239 80.0871 92.239 54.7474C92.239 29.4077 71.6946 8.86548 46.3523 8.86548Z" fill="#255521"/>
  <!-- Texto: laboratório CEDRO -->
  <path d="M148.091 78.1832C145.965 79.8611 143.609 81.1623 141.02 82.0766C138.431 82.9909 135.581 83.4497 132.468 83.4497C129.355 83.4497 126.277 82.8881 123.595 81.7616C120.914 80.635 118.619 79.0358 116.708 76.9539C114.797 74.8753 113.311 72.3482 112.249 69.3759C111.188 66.4036 110.653 63.0513 110.653 59.3257C110.653 55.2884 111.246 51.7374 112.434 48.6727C113.619 45.608 115.229 43.0329 117.263 40.9544C119.297 38.8758 121.67 37.3041 124.379 36.2391C127.092 35.1742 129.972 34.6434 133.023 34.6434C135.643 34.6434 138.03 35.0064 140.187 35.7289C141.218 36.0748 142.204 36.4925 143.15 36.9822C144.92 37.8999 145.77 39.9613 145.198 41.8687L145.126 42.1084C144.506 44.1766 142.211 45.2724 140.239 44.3889C139.862 44.2212 139.482 44.0671 139.098 43.9301C137.451 43.3445 135.749 43.0535 133.992 43.0535C132.235 43.0535 130.55 43.3788 128.931 44.026C127.314 44.6732 125.896 45.6628 124.677 46.988C123.458 48.3166 122.489 49.9671 121.766 51.9395C121.04 53.9153 120.681 56.213 120.681 58.836C120.681 61.3049 120.996 63.5341 121.629 65.5236C122.259 67.5131 123.16 69.2116 124.331 70.6155C125.503 72.0195 126.92 73.0913 128.585 73.8309C130.249 74.5706 132.112 74.9404 134.177 74.9404C136.581 74.9404 138.708 74.5466 140.554 73.7624C141.338 73.4303 142.105 73.0296 142.859 72.5605C144.4 71.5983 146.434 72.4064 146.937 74.1528L148.091 78.1763V78.1832Z" fill="#255521"/>
  <path d="M189.845 78.0428C187.41 79.7686 184.738 81.1007 181.828 82.0389C178.917 82.9772 175.735 83.4497 172.283 83.4497C168.831 83.4497 165.427 82.9019 162.53 81.8095C159.632 80.7172 157.177 79.1283 155.156 77.0498C153.139 74.9712 151.581 72.4441 150.489 69.4718C149.393 66.4996 148.848 63.1335 148.848 59.3736C148.848 55.6138 149.372 52.2203 150.42 49.183C151.468 46.149 152.93 43.5432 154.811 41.3722C156.691 39.2012 158.93 37.537 161.537 36.3796C164.139 35.2256 166.999 34.6469 170.108 34.6469C173.006 34.6469 175.615 35.1468 177.944 36.1501C180.269 37.15 182.266 38.5985 183.93 40.4956C185.595 42.3892 186.872 44.6869 187.766 47.3818C188.66 50.0767 189.105 53.1346 189.105 56.5554C189.105 57.3567 189.088 58.1032 189.057 58.7983C189.006 59.9215 188.077 60.8084 186.954 60.8084H158.694V61.2227C158.848 63.38 159.28 65.3216 159.989 67.044C160.698 68.7698 161.687 70.232 162.951 71.4339C164.215 72.6359 165.728 73.5604 167.485 74.2076C169.242 74.8548 171.235 75.1767 173.454 75.1767C176.232 75.1767 178.762 74.7623 181.047 73.9302C182.29 73.4782 183.512 72.9064 184.711 72.2147C186.245 71.3312 188.204 72.1599 188.677 73.8652L189.841 78.0428H189.845ZM179.536 53.5969C179.506 51.9943 179.259 50.515 178.797 49.159C178.334 47.803 177.677 46.6387 176.828 45.6696C175.978 44.7006 174.968 43.9438 173.793 43.4062C172.619 42.8686 171.307 42.5981 169.855 42.5981C168.403 42.5981 167.129 42.8446 165.941 43.3377C164.752 43.8308 163.694 44.5568 162.766 45.5087C161.838 46.4641 161.054 47.6181 160.403 48.9741C159.756 50.3301 159.276 51.871 158.968 53.5969H179.536Z" fill="#255521"/>
  <path d="M296.498 34.6503C299.703 34.6503 302.731 35.1913 305.58 36.2666C308.429 37.3452 310.933 38.917 313.09 40.9818C315.248 43.0466 316.957 45.5738 318.221 48.5597C319.484 51.5491 320.114 54.9357 320.114 58.7264C320.114 62.5171 319.484 66.1366 318.221 69.2184C316.957 72.3003 315.231 74.8959 313.042 77.0052C310.854 79.1146 308.289 80.7172 305.347 81.8129C302.406 82.9053 299.269 83.4532 295.943 83.4532C292.618 83.4532 289.697 82.9121 286.817 81.8369C283.936 80.7583 281.416 79.1865 279.258 77.1217C277.101 75.0568 275.392 72.54 274.128 69.5643C272.865 66.592 272.234 63.1951 272.234 59.3736C272.234 55.5521 272.875 51.9737 274.152 48.9056C275.43 45.8409 277.163 43.2452 279.351 41.1188C281.539 38.9923 284.111 37.3829 287.07 36.2905C290.029 35.1982 293.169 34.6503 296.498 34.6503Z" fill="#255521"/>
</svg>
```

---

## 3. Paleta de Cores Mapeada (Tokens Oficiais)

A paleta foi extraída diretamente das regras CSS compiladas da aplicação em produção do Cedro:

| Papel no Design | Nome do Token | Hex | RGB / HSL | Uso Primário no INDECX |
| :--- | :--- | :---: | :---: | :--- |
| **Primária Oficial da Marca** | `cedro-dark` | `#255521` | `rgb(37, 85, 33)` | Logo vetorial, header corporativo, crachás VIP. |
| **Primária Institucional (Headings)** | `cedro-forest` | `#075618` | `rgb(7, 86, 24)` | Títulos principais (`h1`, `h2`), bordas ativas, botões primários. |
| **Primária Interativa (Ações)** | `cedro-emerald` | `#02A562` | `rgb(2, 165, 98)` | Botões de submissão, seleção de texto, estados ativos. |
| **Secundária / Hover** | `cedro-green-hover` | `#23823D` | `rgb(35, 130, 61)` | Estado `:hover` dos botões e cards interativos. |
| **Cor de Tema / Links** | `cedro-theme` | `#008F66` | `rgb(0, 143, 102)` | Meta theme-color, links de texto, botões de ação secundária. |
| **Acento Suave / Divisórias** | `cedro-mint` | `#93CBA0` | `rgb(147, 203, 160)` | Bordas decorativas, sublinhado dinâmico de abas, badges de status suave. |
| **Acento Quente (CTA / Alerta)** | `cedro-orange` | `#F29222` | `rgb(242, 146, 34)` | Botões de chamado urgente, pendências atrasadas, botão WhatsApp. |
| **Feedback de Erro / Crítico** | `cedro-danger` | `#CA2E24` | `rgb(202, 46, 36)` | Mensagens de validação, status `Escalonada`, notas baixas (1 e 2). |
| **Fundo Clínico Oficial** | `cedro-bg` | `#F3F3F3` | `rgb(243, 243, 243)` | Background de página, área do dashboard, fundos de formulários. |
| **Superfície dos Cards** | `cedro-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | Modais, tabelas, cards do dashboard, caixas de pergunta. |
| **Bordas e Divisórias Neutras** | `cedro-border` | `#E3E3E3` | `rgb(227, 227, 227)` | Separadores de tabela, inputs inativos, cards. |
| **Texto de Alta Ênfase** | `cedro-text-dark` | `#171717` | `rgb(23, 23, 23)` | Cabeçalhos de cards, labels de formulários. |
| **Texto de Corpo** | `cedro-text-body` | `#323232` | `rgb(50, 50, 50)` | Parágrafos, comentários de clientes, respostas de unidades. |
| **Texto Suave / Muted** | `cedro-text-muted` | `#999999` | `rgb(153, 153, 153)` | Placeholders, datas, rodapés, protocolos secundários. |

---

## 4. Tipografia & Escala Modular

A tipografia oficial do Cedro é a família **`Lato`**. É obrigatório carregar todos os pesos correspondentes via Google Fonts ou fontes locais otimizadas (woff2).

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet">
```

### Escala de Tipos no Tailwind CSS:
* **H1 / Page Titles (`.title`):** `font-black text-4xl lg:text-5xl text-[#075618] tracking-tight` (Lato 900).
* **H2 / Section Titles (`.subtitle`):** `font-bold text-2xl lg:text-3xl text-[#075618]` (Lato 700).
* **H3 / Card Titles:** `font-bold text-xl text-[#171717]` (Lato 700).
* **Body / Parágrafos:** `font-normal text-base text-[#323232] leading-relaxed` (Lato 400).
* **Labels & Metadados:** `font-semibold text-xs lg:text-sm uppercase tracking-wider text-[#999999]` (Lato 600).
* **Buttons & Badges:** `font-bold text-sm uppercase tracking-normal` (Lato 700).

---

## 5. Componentes UI Específicos para a Plataforma INDECX

### 5.1. Botões (Buttons)
* **Botão Primário de Ação:**
  - `bg-[#02A562] hover:bg-[#23823D] text-white font-semibold text-sm uppercase px-6 py-3 rounded-lg shadow-sm transition-all duration-150`
* **Botão de Destaque / Escalonamento:**
  - `bg-[#075618] hover:bg-[#F29222] text-white font-bold text-sm uppercase px-6 py-3 rounded-lg shadow-md transition-all duration-150`
* **Botão Pill de Fechamento / Filtro:**
  - `border border-[#02A562] text-[#02A562] hover:bg-[#02A562] hover:text-white rounded-full px-5 py-2 text-xs font-bold transition-all`

### 5.2. Cards de Manifestação e Superfícies
* Fundo branco puro (`bg-white`), bordas arredondadas de `12px` (`rounded-xl`), com leve borda de delimitação (`border border-[#E9E9E9]`) e sombra discreta e elegante:
  - `shadow-[-10px_15px_30px_rgba(0,0,0,0.04)]`

### 5.3. Sistema de Cores para as Notas de Satisfação (1 a 5)
Para os formulários de pesquisa de satisfação do cliente (escala 1 a 5):
* **Nota 1 (Muito Ruim):** `#CA2E24` (Vermelho Alerta)
* **Nota 2 (Ruim):** `#E65100` (Laranja Escuro)
* **Nota 3 (Regular):** `#F29222` (Laranja Cedro)
* **Nota 4 (Bom):** `#93CBA0` (Verde Menta)
* **Nota 5 (Excelente):** `#02A562` (Verde Esmeralda Clínico)

### 5.4. Badges de Status da Máquina de Estados
* **Nova:** `bg-emerald-50 text-[#075618] border border-emerald-200`
* **Não respondida:** `bg-amber-50 text-amber-800 border border-amber-200`
* **Em tratamento:** `bg-sky-50 text-sky-800 border border-sky-200`
* **Escalonada:** `bg-rose-50 text-[#CA2E24] border border-rose-300 font-bold animate-pulse`
* **Respondida:** `bg-teal-50 text-teal-800 border border-teal-200`
* **Concluída:** `bg-[#255521] text-white border border-[#255521]`

---

## 6. Configuração Pronta para o Tailwind CSS (`tailwind.config.ts`)

Para garantir que o time de desenvolvimento aplique a estética do Cedro de forma padronizada no Next.js:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cedro: {
          dark: '#255521',        // Verde oficial da logo
          forest: '#075618',      // Headings e ênfase institucional
          emerald: '#02A562',     // Ações principais e botões
          hover: '#23823D',       // Hover de botões primários
          theme: '#008F66',       // Meta theme e links
          mint: '#93CBA0',        // Detalhes e bordas suaves
          orange: '#F29222',      // Alertas e CTA
          danger: '#CA2E24',      // Erros e escalonamentos
          bg: '#F3F3F3',          // Background do sistema
          surface: '#FFFFFF',     // Cards e modais
          border: '#E3E3E3',      // Bordas sutis
          text: {
            dark: '#171717',
            body: '#323232',
            muted: '#999999',
          },
        },
      },
      fontFamily: {
        sans: ['Lato', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        pill: '60px',
      },
      boxShadow: {
        'cedro-card': '-10px 15px 30px rgba(0, 0, 0, 0.04)',
        'cedro-modal': '0 14px 30px rgba(0, 0, 0, 0.1)',
        'cedro-dropdown': '0 1px 4px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

## 7. Diretrizes de UX (User Experience)

1. **Acessibilidade em Cores (WCAG AA):**
   - Nunca use o verde claro `#93CBA0` como cor de texto sobre fundo branco (contraste insuficiente). Use `#075618` ou `#255521` para texto verde.
   - O laranja `#F29222` deve ser utilizado com texto branco apenas em botões com tamanho de fonte e peso adequados (`font-bold text-sm` ou superior).
2. **Microinterações:**
   - Hovers com transição curta (`transition-all duration-150 ease-in-out`).
   - Botões de envio com sutil elevação ou preenchimento dinâmico.
3. **Página de Pesquisa do Cliente (Mobile-First):**
   - Como os respondentes acessarão via QR Code nas unidades físicas do Cedro, os botões das notas (1 a 5) devem ter área de toque generosa (mínimo `48px x 48px`).
