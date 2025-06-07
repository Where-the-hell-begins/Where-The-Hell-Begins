// Variáveis globais do jogo para definir o fundo e as fases
const canvas = document.getElementById("canvas");
let faseAtual = parseInt(canvas.dataset.fase) || 1; // Corrigido para garantir número

// Constante para adaptar as variáveis de acordo com a fase
const configuracaoFases = [
  { nome: "Bem vindos ao jogo de tiro!" },
  { fase: "1", classeCanva: "fase1", classeBolas: "bolasFase1", classeBoss: "bossFase1", posicaoBolas: [100, 200, 300, 400, 500, 600, 700], posicaoBoss: 720, bossVidaMax: 5 },
  { fase: "2", classeCanva: "fase2", classeBolas: "bolasFase2", classeBoss: "bossFase2", posicaoBolas: [150, 250, 350, 450, 550, 650, 750], posicaoBoss: 770, bossVidaMax: 6 }
];

canvas.classList.add(`${configuracaoFases[faseAtual].classeCanva}`);

let maxmuni = 6;
let muni = maxmuni;
const posicaoBolas = configuracaoFases[faseAtual].posicaoBolas;
let bolasAcertadas = 0;
let recarregando = false;
let jogoAtivo = true;

let bossVidaMax = configuracaoFases[faseAtual].bossVidaMax;
const posicaoBoss = configuracaoFases[faseAtual].posicaoBoss;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false;
let tempoBossTimer = null;

let maxVidas = 5;
let vidas = maxVidas;
let bolasAtivas = [];

const barraContainer = document.createElement("div");
barraContainer.id = "barraVidaContainer";
barraContainer.style.display = "none"; // Melhor controle visual inicial

const barraVida = document.createElement("div");
barraVida.id = "barraVida";

const textoVida = document.createElement("span");
textoVida.id = "bossVidaText";

barraVida.appendChild(textoVida);
barraContainer.appendChild(barraVida);
document.body.appendChild(barraContainer);

function atualizarBarraVida() {
  const porcentagem = (bossVidaAtual / bossVidaMax) * 100;
  barraVida.style.width = porcentagem + "%";
  const verde = Math.floor((porcentagem / 100) * 255);
  const vermelho = 255 - verde;
  barraVida.style.backgroundColor = `rgb(${vermelho}, ${verde}, 0)`;
  textoVida.innerText = `${bossVidaAtual}/${bossVidaMax}`;
}

function iniciarTempoBoss() {
  if (tempoBossTimer) clearTimeout(tempoBossTimer);
  tempoBossTimer = setTimeout(() => {
    bossAtivo = false;
    barraContainer.style.display = "none";
    bolasAcertadas = 0;
    atualizarBarraVida();
    criarBola();
  }, 5000);
}

function criarBoss() {
  const boss = document.createElement("div");
  boss.classList.add("boss", configuracaoFases[faseAtual].classeBoss);
  boss.style.left = `${posicaoBoss - 50}px`;
  boss.style.top = "250px";
  canvas.appendChild(boss);

  boss.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!bossAtivo || !atirar()) return;
    bossVidaAtual--;
    atualizarBarraVida();
    if (bossVidaAtual <= 0) {
      mostrarVitoria();
    } else {
      iniciarTempoBoss();
    }
  });
}

function criarBola() {
  if (!jogoAtivo || bossAtivo) return;

  const ocupadas = new Array(posicaoBolas.length).fill(false);
  const livres = ocupadas.map((_, i) => i);
  if (livres.length === 0) {
    setTimeout(() => criarBola(), 200);
    return;
  }

  const indice = livres[Math.floor(Math.random() * livres.length)];
  const posX = posicaoBolas[indice] - 25;
  const posY = 300;

  const bossArea = { x: posicaoBoss - 50, y: 250, width: 100, height: 100 };
  if (
    posX < bossArea.x + bossArea.width &&
    posX + 50 > bossArea.x &&
    posY < bossArea.y + bossArea.height &&
    posY + 50 > bossArea.y
  ) {
    setTimeout(() => criarBola(), 100);
    return;
  }

  const colisao = bolasAtivas.some((b) => (
    posX < b.x + 50 &&
    posX + 50 > b.x &&
    posY < b.y + 50 &&
    posY + 50 > b.y
  ));

  if (colisao) {
    setTimeout(() => criarBola(), 100);
    return;
  }

  const envelope = document.createElement("div");
  envelope.style.position = "absolute";

  const bola = document.createElement("div");
  bola.classList.add("bola", configuracaoFases[faseAtual].classeBolas);

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
      if (vidas <= 0) mostrarGameOver();
    }
  }, 4000);

  const delay = Math.random() * 1000 + 500;
  setTimeout(() => {
    if (jogoAtivo && !bossAtivo) criarBola();
  }, delay);
}

function criaPersonagem() {
  const personagem = document.createElement("div");
  personagem.classList.add("personagem");
  canvas.appendChild(personagem);

  canvas.addEventListener("click", () => {
    atirar();
  });
}

function atualizarMunicao() {
  const container = document.getElementById("municao");
  container.innerHTML = "";
  for (let i = 0; i < maxmuni; i++) {
    const bala = document.createElement("span");
    bala.classList.add("bala");
    bala.innerText = "⏺";
    if (i >= muni) bala.classList.add("apagada");
    container.appendChild(bala);
  }
}

function atualizarVidas() {
  const container = document.getElementById("vidas");
  container.innerHTML = "";
  for (let i = 0; i < maxVidas; i++) {
    const vida = document.createElement("span");
    vida.classList.add("vida");
    vida.innerText = "❤";
    if (i >= vidas) vida.classList.add("perdida");
    container.appendChild(vida);
  }
}

function atirar() {
  if (recarregando || muni <= 0) return false;
  muni--;
  atualizarMunicao();
  return true;
}

window.addEventListener("keydown", (event) => {
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
  const proximaFase = faseAtual + 1;

  mensagem.className = "mensagem-vitoria";
  mensagem.innerText = "VITÓRIA!";
  canvas.appendChild(mensagem);
  if (proximaFase > configuracaoFases.length - 1) {
    mensagem.innerText = "Você completou todas as fases!";
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 5000);
  } else {
    mensagem.addEventListener("click", () => {
      window.location.href = `./fase${proximaFase}.html`;
    });
    setTimeout(() => {
      window.location.href = `./fase${proximaFase}.html`;
    }, 10000);
  }

}

function mostrarGameOver() {
  jogoAtivo = false;
  canvas.innerHTML = "";
  barraContainer.style.display = "none";
  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-derrota";
  mensagem.innerText = "GAME OVER";
  mensagem.addEventListener("click", () => {
    window.location.href = `./fase${faseAtual}.html`;
  });
  canvas.appendChild(mensagem);
  setTimeout(() => {
    window.location.href = `./fase${faseAtual}.html`;
  }, 10000);
}

function iniciarFase() {
  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-fase";
  mensagem.innerHTML = `<strong>Fase ${faseAtual}</strong><br>Prepare-se! Eles estão vindo em ondas... não desperdice sua munição!`;
  canvas.appendChild(mensagem);
  setTimeout(() => {
    mensagem.remove();
    criarBola();
    criarBoss();
    criaPersonagem();
    atualizarMunicao();
    atualizarVidas();
    atualizarBarraVida();
  }, 3000);
}

// Inicializa a fase ao carregar
iniciarFase();
