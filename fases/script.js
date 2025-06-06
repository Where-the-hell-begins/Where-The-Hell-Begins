// Variáveis globais do jogo
const canvas = document.getElementById("canvas");
let muni = 6;
let maxmuni = 6;
let bolasAcertadas = 0;
let bossVidaMax;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false;
let tempoBossTimer = null;
let recarregando = false;
let jogoAtivo = true; // Variável para controlar o estado do jogo

// Barra de vida do boss
const barraContainer = document.createElement("div");
barraContainer.id = "barraVidaContainer";

const barraVida = document.createElement("div");
barraVida.id = "barraVida";

const textoVida = document.createElement("span");
textoVida.id = "bossVidaText";

barraVida.appendChild(textoVida);
barraContainer.appendChild(barraVida);
document.body.appendChild(barraContainer);

// Função para atualizar a barra de vida do boss
function atualizarBarraVida() {
  const porcentagem = (bossVidaAtual / bossVidaMax) * 100;
  barraVida.style.width = porcentagem + "%";

  // Muda a cor de verde para vermelho conforme a vida diminui
  const verde = Math.floor((porcentagem / 100) * 255);
  const vermelho = 255 - verde;
  barraVida.style.backgroundColor = `rgb(${vermelho}, ${verde}, 0)`;
}

// Temporizador do boss
function iniciarTempoBoss() {
  if (tempoBossTimer) clearTimeout(tempoBossTimer);

  tempoBossTimer = setTimeout(() => {
    bossAtivo = false;
    barraContainer.style.display = "none";
    bolasAcertadas = 0;
    bossVidaAtual = bossVidaMax;
    atualizarBarraVida();
  }, 5000);
}

// Cria o boss
function criarBoss(posicaoBoss) {
  const boss = document.createElement("div");
  boss.classList.add("boss");
  boss.style.left = `${posicaoBoss - 50}px`;
  boss.style.top = "250px";
  canvas.appendChild(boss);

  boss.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!bossAtivo) return;

    if (!atirar()) return;

    bossVidaAtual--;
    atualizarBarraVida();

    if (bossVidaAtual <= 0) {
      mostrarVitoria();
    } else {
      iniciarTempoBoss();
    }
  });
}

// Cria as bolas pequenas
function criarBola(posicaoBolas) {
  // Verifica se o jogo ainda está ativo
  if (!jogoAtivo) return;

  // Inicializa o array de ocupadas com false para cada posição
  const ocupadas = new Array(posicaoBolas.length).fill(false);

  // Encontra índices das posições livres
  const livres = [];
  for (let i = 0; i < ocupadas.length; i++) {
    if (!ocupadas[i]) {
      livres.push(i);
    }
  }

  if (livres.length === 0) {
    setTimeout(() => criarBola(posicaoBolas), 200);
    return;
  }

  const indice = livres[Math.floor(Math.random() * livres.length)];
  ocupadas[indice] = true;

  const envelope = document.createElement("div");
  envelope.style.position = "absolute";

  const bola = document.createElement("div");
  bola.classList.add("bola");

  const circulo = document.createElement("div");
  circulo.classList.add("circulo");

  const circuloMenor = document.createElement("div");
  circuloMenor.classList.add("circuloMenor");

  circulo.appendChild(circuloMenor);
  envelope.style.left = `${posicaoBolas[indice] - 25}px`;
  envelope.style.top = `300px`;

  envelope.appendChild(circulo);
  envelope.appendChild(bola);
  canvas.appendChild(envelope);

  // Evento de clique na bola
  envelope.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!atirar()) return;

    envelope.remove();
    ocupadas[indice] = false;

    if (!bossAtivo) {
      bolasAcertadas++;
      if (bolasAcertadas >= 10) {
        bossAtivo = true;
        barraContainer.style.display = "block";
        atualizarBarraVida();
        iniciarTempoBoss();
      }
    }
  });

  // Remove a bola após 4 segundos se não for clicada
  setTimeout(() => {
    if (document.body.contains(envelope)) {
      envelope.remove();
      ocupadas[indice] = false;
    }
  }, 4000);

  const delay = Math.random() * 1000 + 500;
  setTimeout(() => {
    if (jogoAtivo) {
      criarBola(posicaoBolas);
    }
  }, delay);
}

// Cria a arma do jogador
function criarArma() {
  const arma = document.createElement("div");
  arma.classList.add("arma");
  canvas.appendChild(arma);

  // Evento de clique para atirar
  canvas.addEventListener("click", () => {
    atirar();
  });
}

// Atualiza a exibição da munição
function atualizarMunicao() {
  const container = document.getElementById("municao");
  container.innerHTML = "";

  for (let i = 0; i < maxmuni; i++) {
    const bala = document.createElement("span");
    bala.classList.add("bala");
    bala.innerText = "⏺";

    if (i >= muni) {
      bala.classList.add("apagada");
    }

    container.appendChild(bala);
  }
}

// Função de atirar
function atirar() {
  if (recarregando || muni <= 0) {
    return false;
  } else {
    muni--;
    atualizarMunicao();
    return true;
  }
}

// Recarregar a arma
document.addEventListener("keydown", (event) => {
  if (event.key === "r" && !recarregando && muni < maxmuni) {
    recarregando = true;

    setTimeout(() => {
      muni = maxmuni;
      atualizarMunicao();
      recarregando = false;
    }, 500);
  }
});

function mostrarVitoria() {
  jogoAtivo = false;
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-vitoria"; // Aplica a classe CSS
  mensagem.innerText = "VITÓRIA!";

  // Mantém o evento de clique no JavaScript
  mensagem.addEventListener("click", () => {
    window.location.href = '../index.html';
  });

  canvas.appendChild(mensagem);

  setTimeout(() => {
    window.location.href = '../index.html';
  }, 10000);
}

// Iniciar fase
function iniciarFase(numeroFase) {
  switch (numeroFase) {
    case 1:
      canvas.classList.add("fase1");
      const posicaoBolasFase1 = [100, 200, 300, 400, 500, 600, 700];
      const posicaoBossFase1 = 1000; // Posição do boss na fase 1
      criarBola(posicaoBolasFase1);
      criarBoss(posicaoBossFase1);
      criarArma();
      atualizarMunicao();
      atualizarBarraVida();
      break;
    case 2:
      // Implemente outras fases aqui
      break;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const fase = parseInt(canvas.dataset.fase) || 1;

  iniciarFase(fase);
});