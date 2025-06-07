// Variáveis globais do jogo
const canvas = document.getElementById("canvas");
let muni = 6;
let maxmuni = 6;
let bolasAcertadas = 0;
let bossVidaMax = 5;
const posicaoBoss = 720; // Posição do boss na tela
let bossVidaAtual = bossVidaMax;
let bossAtivo = false;
let tempoBossTimer = null;
let recarregando = false;
let jogoAtivo = true; // Variável para controlar o estado do jogo
let vidas = 5; // Vidas do personagem
const maxVidas = 5; // Máximo de vidas do personagem
let bolasAtivas = []; // Para rastrear bolas criadas

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

// Atualiza a barra de vida do boss
function atualizarBarraVida() {
  const porcentagem = (bossVidaAtual / bossVidaMax) * 100;
  barraVida.style.width = porcentagem + "%";

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
    atualizarBarraVida();

    // Reinicia o ciclo de criação de bolas
    const posicaoBolas = [100, 200, 300, 400, 500, 600, 700];
    criarBola(posicaoBolas);
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

// Cria bola com checagens de colisão e vidas
function criarBola(posicaoBolas) {
  if (!jogoAtivo || bossAtivo) return;

  const ocupadas = new Array(posicaoBolas.length).fill(false);
  const livres = [];

  for (let i = 0; i < ocupadas.length; i++) {
    if (!ocupadas[i]) livres.push(i);
  }

  if (livres.length === 0) {
    setTimeout(() => criarBola(posicaoBolas), 200);
    return;
  }

  const indice = livres[Math.floor(Math.random() * livres.length)];
  const posX = posicaoBolas[indice] - 25;
  const posY = 300;

  // Verifica colisão com boss
  const bossArea = {
    x: posicaoBoss - 50,
    y: 250,
    width: 100,
    height: 100
  };

  if (
    posX < bossArea.x + bossArea.width &&
    posX + 50 > bossArea.x &&
    posY < bossArea.y + bossArea.height &&
    posY + 50 > bossArea.y
  ) {
    setTimeout(() => criarBola(posicaoBolas), 100);
    return;
  }

  // Verifica colisão com outras bolas
  const colisao = bolasAtivas.some((b) => {
    return (
      posX < b.x + 50 &&
      posX + 50 > b.x &&
      posY < b.y + 50 &&
      posY + 50 > b.y
    );
  });

  if (colisao) {
    setTimeout(() => criarBola(posicaoBolas), 100);
    return;
  }

  const envelope = document.createElement("div");
  envelope.style.position = "absolute";

  const bola = document.createElement("div");
  bola.classList.add("bola");

  const circulo = document.createElement("div");
  circulo.classList.add("circulo");

  const circuloMenor = document.createElement("div");
  circuloMenor.classList.add("circuloMenor");

  circulo.appendChild(circuloMenor);
  envelope.style.left = `${posX}px`;
  envelope.style.top = `${posY}px`;

  envelope.appendChild(circulo);
  envelope.appendChild(bola);
  canvas.appendChild(envelope);

  bolasAtivas.push({ x: posX, y: posY, el: envelope });

  envelope.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!atirar()) return;

    envelope.remove();
    bolasAtivas = bolasAtivas.filter((b) => b.el !== envelope);

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

  setTimeout(() => {
    if (document.body.contains(envelope)) {
      envelope.remove();
      bolasAtivas = bolasAtivas.filter((b) => b.el !== envelope);

      vidas--;
      atualizarVidas();

      if (vidas <= 0) {
        mostrarGameOver();
      }
    }
  }, 4000);

  const delay = Math.random() * 1000 + 500;
  setTimeout(() => {
    if (jogoAtivo && !bossAtivo) {
      criarBola(posicaoBolas);
    }
  }, delay);
}

// Cria personagem
function criaPersonagem() {
  const personagem = document.createElement("div");
  personagem.classList.add("personagem");
  canvas.appendChild(personagem);

  canvas.addEventListener("click", () => {
    atirar();
  });
}

// Atualiza munição
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

// Atualiza vidas
function atualizarVidas() {
  const container = document.getElementById("vidas");
  container.innerHTML = "";

  for (let i = 0; i < maxVidas; i++) {
    const vida = document.createElement("span");
    vida.classList.add("vida");
    vida.innerText = "❤";

    if (i >= vidas) {
      vida.classList.add("perdida");
    }

    container.appendChild(vida);
  }
}

// Atirar
function atirar() {
  if (recarregando || muni <= 0) {
    return false;
  } else {
    muni--;
    atualizarMunicao();
    return true;
  }
}

// Recarregar
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

// Vitória
function mostrarVitoria() {
  jogoAtivo = false;
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-vitoria";
  mensagem.innerText = "VITÓRIA!";
  mensagem.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  canvas.appendChild(mensagem);
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 10000);
}

// Derrota
function mostrarGameOver() {
  jogoAtivo = false;
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-derrota";
  mensagem.innerText = "GAME OVER";
  mensagem.addEventListener("click", () => {
    window.location.href = "../index.html";
  });

  canvas.appendChild(mensagem);
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 10000);
}

// Iniciar fase
function iniciarFase(numeroFase) {
  // Cria mensagem de início de fase
  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-fase";
  mensagem.innerHTML = `<strong>Fase ${numeroFase}</strong><br>Prepare-se! Eles estão vindo em ondas... não desperdice sua munição!`;
  canvas.appendChild(mensagem);

  // Aguarda 3 segundos antes de iniciar o jogo
  setTimeout(() => {
    mensagem.remove(); // Remove a mensagem

    switch (numeroFase) {
      case 1:
        canvas.classList.add("fase1");
        const posicaoBolasFase1 = [100, 200, 300, 400, 500, 600, 700];
        criarBola(posicaoBolasFase1);
        criarBoss();
        criaPersonagem();
        atualizarMunicao();
        atualizarVidas();
        atualizarBarraVida();
        break;
      case 2:
        // Implemente outras fases aqui
        break;
    }
  }, 3000); // Aguarda 3 segundos
}



document.addEventListener("DOMContentLoaded", function () {
  const fase = parseInt(canvas.dataset.fase) || 1;
  iniciarFase(fase);
});
