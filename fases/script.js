
// Variáveis globais do jogo para definir o fundo e as fases
const canvas = document.getElementById("canvas");
let faseAtual = parseInt(canvas.dataset.fase) || 1; // Corrigido para garantir número

// Ajusta o tamanho do canvas para a tela toda
function ajustarTela() {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  
}
window.addEventListener("load", ajustarTela);
window.addEventListener("resize", ajustarTela);

window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) {
    e.preventDefault(); // bloqueia zoom com Ctrl + roda do mouse
  }
}, { passive: false });

window.addEventListener('keydown', function(e) {
  // Bloquear Ctrl + '+' ou Ctrl + '-' e Ctrl + '0'
  if (e.ctrlKey) {
    if (
      e.key === '+' || 
      e.key === '-' || 
      e.key === '=' || // '=' também pode ser o '+'
      e.key === '0'
    ) {
      e.preventDefault();
    }
  }
});



// Configurações das fases com posições relativas (0 a 1)
const configuracaoFases = [
  { nome: "Bem vindos ao jogo de tiro!" },
  { fase: "1", classeCanva: "fase1", classeBolas: "bolasFase1", classeBoss: "bossFase1", posicaoBolas: [
  { x: 805, y: 100 },
  { x: 1015, y: 100 },
  { x: 1280, y: 320 },
  { x: 130, y: 370 },
  { x: 300, y: 275 },
  { x: 990, y: 275 },
  { x: 510, y: 290 }
], posicaoBoss: 630, bossVidaMax: 100 },
  { fase: "2", classeCanva: "fase2", classeBolas: "bolasFase2", classeBoss: "bossFase2", posicaoBolas: [
   { x: 805, y: 100 },
  { x: 1015, y: 100 },
  { x: 1280, y: 320 },
  { x: 130, y: 370 },
  { x: 300, y: 275 },
  { x: 990, y: 275 },
  { x: 510, y: 290 }
], posicaoBoss: 770, bossVidaMax: 6 }
];

// Aplica classe da fase ao canvas
canvas.classList.add(configuracaoFases[faseAtual].classeCanva);

let maxmuni = 6;
let muni = maxmuni;
const posicaoBolasRelativas = configuracaoFases[faseAtual].posicaoBolas;
let bolasAcertadas = 0;
let recarregando = false;
let jogoAtivo = true;

let bossVidaMax = configuracaoFases[faseAtual].bossVidaMax;
const posicaoBossRelativa = configuracaoFases[faseAtual].posicaoBoss;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false;
let tempoBossTimer = null;
const bossTimerCanvas = document.getElementById('boss-timer-circle');
const bossTimerCtx = bossTimerCanvas.getContext('2d');
let tempoBossInterval = null;
let tempoTotalBoss = 8; // 8 segundos de duração
let tempoAtualBoss = 0;

let maxVidas = 6;
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

function atualizarFaseHUD(numero, nome) {
  const hud = document.getElementById("faseAtual");
  hud.textContent = `Fase ${numero}: ${nome}`;
}

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
  if (tempoBossInterval) clearInterval(tempoBossInterval);

  tempoAtualBoss = 0;
  bossTimerCanvas.style.display = "block";

  tempoBossInterval = setInterval(() => {
    tempoAtualBoss += 0.1;
    if (tempoAtualBoss >= tempoTotalBoss) {
      tempoAtualBoss = tempoTotalBoss;
      clearInterval(tempoBossInterval);
      bossTimerCanvas.style.display = "none";
      bossAtivo = false;
      barraContainer.style.display = "none";
      bolasAcertadas = 0;

      const boss = document.querySelector(".boss");
      if (boss) boss.remove();

      if (faseAtual === 1) {
        muni = maxmuni;
        atualizarMunicao();
      }

      atualizarBarraVida();
      criarBola();
    }

    desenharBossTimer();
  }, 100);
}

function desenharBossTimer() {
  const ctx = bossTimerCtx;
  const canvasTimer = bossTimerCanvas;
  const raio = 45;
  const centroX = canvasTimer.width / 2;
  const centroY = canvasTimer.height / 2;

  ctx.clearRect(0, 0, canvasTimer.width, canvasTimer.height);

  // Fundo cinza
  ctx.beginPath();
  ctx.arc(centroX, centroY, raio, 0, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();

  const angulo = (tempoAtualBoss / tempoTotalBoss) * 2 * Math.PI;

  // "fatia de pizza" em vermelho
  ctx.beginPath();
  ctx.moveTo(centroX, centroY);
  ctx.arc(centroX, centroY, raio, -Math.PI / 2, -Math.PI / 2 + angulo);
  ctx.closePath();
  ctx.fillStyle = 'red';
  ctx.fill();

  // Borda branca
  ctx.beginPath();
  ctx.arc(centroX, centroY, raio, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 4;
  ctx.stroke();
}

// Função auxiliar para converter posição relativa para pixels com ajuste de offset (50px para centralizar)
// OFFSET considera largura/altura do elemento (50x50)
function posicaoRelativaParaPixels(posRelativa) {
  const largura = canvas.clientWidth;
  const altura = canvas.clientHeight;
  return {
    x: Math.round(posRelativa.x * largura) - 25,
    y: Math.round(posRelativa.y * altura) - 25,
  };
}

function criarBoss() {
  if (document.querySelector(".boss") || !jogoAtivo) return;

  const boss = document.createElement("div");
  boss.classList.add("boss", configuracaoFases[faseAtual].classeBoss);
  boss.style.left = `${posicaoBoss - 25}px`;
  boss.style.backgroundSize = "350px";
  boss.style.top = "25px";
  canvas.appendChild(boss);

  boss.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!bossAtivo || !atirar()) return;
    bossVidaAtual--;
    atualizarBarraVida();
    if (bossVidaAtual <= 0) {
      clearTimeout(tempoBossTimer);
      mostrarVitoria();
    }
  });
}

function criarBola() {
  if (!jogoAtivo || bossAtivo) return;

  // converte posições relativas para pixels toda vez para acompanhar o tamanho da tela
  const posicoesBolasPixels = posicaoBolasRelativas.map(pos => posicaoRelativaParaPixels(pos));

  // seleciona posições livres para evitar sobreposição com bolasAtivas
  const livres = posicoesBolasPixels
    .map((pos, i) => {
      const ocupado = bolasAtivas.some(b => b.x === pos.x && b.y === pos.y);
      return !ocupado ? i : null;
    })
    .filter(i => i !== null);

  if (livres.length === 0) {
    setTimeout(() => criarBola(), 200);
    return;
  }

  const indice = livres[Math.floor(Math.random() * livres.length)];
  const posX = posicoesBolasPixels[indice].x;
  const posY = posicoesBolasPixels[indice].y;

  // Área do boss (dimensões aproximadas 100x100)
  const bossPosPixels = posicaoRelativaParaPixels(posicaoBossRelativa);
  const bossArea = { x: bossPosPixels.x, y: bossPosPixels.y, width: 100, height: 100 };

  // Verifica se bola está sobre a área do boss
  if (
    posX < bossArea.x + bossArea.width &&
    posX + 50 > bossArea.x &&
    posY < bossArea.y + bossArea.height &&
    posY + 50 > bossArea.y
  ) {
    setTimeout(() => criarBola(), 100);
    return;
  }

  // Verifica colisão com outras bolas ativas
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

  // Cria o envelope e bola com as classes e posições
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
        criarBoss();
        iniciarTempoBoss(); // Inicia uma única vez aqui
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
    vida.innerHTML = '<img src="imagens/coracao.png" class="icone-coracao">'; //agora a vida não é um emote
    if (i >= vidas) vida.classList.add("perdida");
    container.appendChild(vida);
  }
}

function atirar() {
  if (recarregando) return false;

  if (faseAtual === 1 && bossAtivo) return true;

  if (muni <= 0) {
    mostrarMensagemRecarregar();
    return false;
  }

  muni--;
  atualizarMunicao();
  return true;
}

window.addEventListener("keydown", (event) => {
  if (event.key === "r" && !recarregando && muni < maxmuni) {
    recarregando = true;
    mostrarAnimacaoRecarregando();
    setTimeout(() => {
      muni = maxmuni;
      atualizarMunicao();
      recarregando = false;
    }, 500);
  }
});

const msgRecarregar = document.getElementById("mensagem-recarregar");
const barraRecarregando = document.getElementById("animacao-recarregando");

function mostrarMensagemRecarregar() {
  msgRecarregar.style.display = "block";
  setTimeout(() => {
    msgRecarregar.style.display = "none";
  }, 1500);
}

function mostrarAnimacaoRecarregando() {
  barraRecarregando.style.display = "block";
  barraRecarregando.style.width = "0";
  barraRecarregando.style.transition = "width 0.5s linear";
  setTimeout(() => {
    barraRecarregando.style.width = "150px";
  }, 10);
  setTimeout(() => {
    barraRecarregando.style.display = "none";
    barraRecarregando.style.width = "0";
  }, 550);
}

function mostrarVitoria() {
  jogoAtivo = false;
  bolasAtivas.forEach(b => b.el.remove());
  bolasAtivas = [];
  clearTimeout(tempoBossTimer);
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
  bolasAtivas.forEach(b => b.el.remove());
  bolasAtivas = [];
  clearTimeout(tempoBossTimer);
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
  mensagem.innerHTML = `<strong>Fase ${faseAtual}</strong><br>A Gula foi despertada <br>De a ela o que ela mais deseja: uma chuva de balas!`;
  canvas.appendChild(mensagem);

  setTimeout(() => {
    mensagem.remove();
    criarBola();               // Começa as bolas
    criaPersonagem();          // Mostra personagem
    atualizarMunicao();
    atualizarVidas();
    atualizarBarraVida();      // Só mostrará se boss aparecer
  }, 3000);


  /*//CODIGO DE TESTE BOSS
  setTimeout(() => {
  mensagem.remove();
  criaPersonagem();          
  atualizarMunicao();
  atualizarVidas();
  
  bossAtivo = true;
  barraContainer.style.display = "block";
  atualizarBarraVida();
  criarBoss();               // Força o boss aparecer
  iniciarTempoBoss();       // Inicia o tempo do boss
}, 1000);*/

}

// Inicializa a fase ao carregar
iniciarFase();
