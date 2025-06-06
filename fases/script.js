// Variáveis globais do jogo
const canvas = document.getElementById("canvas");
let muni = 6;
let maxmuni = 6;
const posicaoBoss = 720;
let bolasAcertadas = 0;
let bossVidaMax = 5;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false;
let tempoBossTimer = null;
let recarregando = false;

// Barra de vida do boss
const barraContainer = document.createElement("div");
barraContainer.style.position = "absolute";
barraContainer.style.top = "10px";
barraContainer.style.left = "50%";
barraContainer.style.transform = "translateX(-50%)";
barraContainer.style.width = "300px";
barraContainer.style.height = "25px";
barraContainer.style.border = "2px solid white";
barraContainer.style.backgroundColor = "#222";
barraContainer.style.display = "none";
barraContainer.style.zIndex = "1000";

const barraVida = document.createElement("div");
barraVida.style.height = "100%";
barraVida.style.width = "100%";
barraVida.style.backgroundColor = "green";
barraVida.style.transition = "width 0.3s, background-color 0.3s";

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
function criarBoss() {
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
  const ocupadas = posicaoBolas.map(() => false);

  const livres = posicaoBolas
    .map((_, i) => (!ocupadas[i] ? i : null))
    .filter(i => i !== null);

  if (livres.length === 0) {
    setTimeout(criarBola, 200);
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
  setTimeout(criarBola, delay);
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

// Mostrar tela de vitória
function mostrarVitoria() {
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  const mensagem = document.createElement("div");
  mensagem.style.position = "absolute";
  mensagem.style.top = "50%";
  mensagem.style.left = "50%";
  mensagem.style.transform = "translate(-50%, -50%)";
  mensagem.style.color = "white";
  mensagem.style.fontSize = "60px";
  mensagem.style.fontWeight = "bold";
  mensagem.style.textShadow = "2px 2px 4px black";
  mensagem.innerText = "VITÓRIA!";

  canvas.appendChild(mensagem);

  bossAtivo = false;
  bolasAcertadas = 0;
  clearTimeout(tempoBossTimer);
}

// Iniciar fase
function iniciarFase(numeroFase) {
  switch (numeroFase) {
    case 1:
      canvas.classList.add("fase1");
      const posicaoBolasFase1 = [100, 200, 300, 400, 500, 600, 700];
      criarBola(posicaoBolasFase1);
      criarBoss();
      criarArma();
      atualizarMunicao();
      atualizarBarraVida();
      break;
    case 2:
      // Implemente outras fases aqui
      break;
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const fase = parseInt(canvas.dataset.fase) || 1;
    
    iniciarFase(fase);
});
