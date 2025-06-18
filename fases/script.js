/*-----------------------------------------------------------------------
  Variáveis globais do jogo para definir o fundo e as fases
-------------------------------------------------------------------------*/

const canvas = document.getElementById("canvas");
let faseAtual = parseInt(canvas.dataset.fase) || 1; // Corrigido para garantir número

const musicaFundo1 = document.getElementById('musica-fundo1');

/*-----------------------------------------------------------------------
  Ajusta o tamanho do canvas para a tela toda
-------------------------------------------------------------------------*/
function ajustarTela() {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("load", ajustarTela);
window.addEventListener("resize", ajustarTela);

window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    e.preventDefault(); // bloqueia zoom com Ctrl + roda do mouse
  }
}, { passive: false });

window.addEventListener('keydown', function (e) {
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

function criarCamadaSuperior() {
  const img = document.createElement("img");
  img.id = "camadaSuperior";
  document.body.appendChild(img);
}

// Chamada no momento certo, como após o carregamento da fase
window.addEventListener("load", () => {
  criarCamadaSuperior();
  ajustarImagemComCanvas(); // opcional
});

function ajustarImagemComCanvas() {
  const img = document.getElementById("camadaSuperior");
  const canvas = document.getElementById("canvas");
  const rect = canvas.getBoundingClientRect();

  img.style.position = "absolute";
  img.style.left = rect.left + "px";
  img.style.top = rect.top + "px";
  img.style.width = rect.width + "px";
  img.style.height = rect.height + "px";
}
window.addEventListener("resize", ajustarImagemComCanvas);

/*-----------------------------------------------------------------------
 Configurações das fases com posições relativas (1 a 2)
-------------------------------------------------------------------------*/

const configuracaoFases = [
  { nome: "Bem vindos ao jogo de tiro!" },

  {
    fase: "1", classeCanva: "fase1", classeBoss: "bossFase1", BossTimer: 6, posicaoBolas: [
      { x: 0.56, y: 0.25 }, //janela esquerda
      { x: 0.705, y: 0.25 }, //janela direita
      { x: 0.69, y: 0.48 }, // atras da carroça
      { x: 0.9, y: 0.53 }, // direita
      { x: 0.35, y: 0.48 }, // barril vermelho carroça
      { x: 0.21, y: 0.44 }, // dentro da corroça
      { x: 0.02, y: 0.48 } //esquerda
    ], posicaoBoss: [
      { x: 0.5, y: 0.5 } // Posição centralizada para o boss
    ], bossVidaMax: 1
  },

  {
    fase: "2", classeCanva: "fase2", classeBoss: "bossFase2", BossTimer: 2, posicaoBolas: [
      { x: 0.62, y: 0.08 }, //janela
      { x: 0.61, y: 0.41 }, // empiladeira
      { x: 0.77, y: 0.4 }, // direita meio
      { x: 0.09, y: 0.65 }, // direita meio
      { x: 0.29, y: 0.44 }, // caixa esquerda
      { x: 0.235, y: 0.44 }, // caixa direita
      { x: 0.08, y: 0.32 }, //esquerda cima

    ],
    classeCoins: "coinsFase2", posicaoCoins: [
      { x: 0.38, y: 0.52 }, //boss esquerda 1
      { x: 0.41, y: 0.45 }, //boss esquerda 2
      { x: 0.45, y: 0.40 }, //boss esquerda 3
      { x: 0.49, y: 0.40 }, //boss direita 3
      { x: 0.53, y: 0.45 }, //boss direita 2
      { x: 0.56, y: 0.52 }, //boss direita 1
    ],
    posicaoBoss: [
      { x: 0.48, y: 0.68 } // Posição centralizada para o boss
    ], bossVidaMax: 1
  },
];

// Aplica classe da fase ao canvas
canvas.classList.add(configuracaoFases[faseAtual].classeCanva);

/*-----------------------------------------------------------------------
  Variaveis do Player
-------------------------------------------------------------------------*/

let maxmuni = 6;
let muni = maxmuni;
const posicaoBolasRelativas = configuracaoFases[faseAtual].posicaoBolas;
let bolasAcertadas = 0;
let recarregando = false;
let jogoAtivo = true;

/*-----------------------------------------------------------------------
  Variaveis do Boss
-------------------------------------------------------------------------*/

let bossVidaMax = configuracaoFases[faseAtual].bossVidaMax;
const posicaoBossRelativa = configuracaoFases[faseAtual].posicaoBoss;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false;
let tempoBossTimer = null;
const bossTimerCanvas = document.getElementById('boss-timer-circle');
const bossTimerCtx = bossTimerCanvas.getContext('2d');
let tempoBossInterval = null;
let tempoTotalBoss = configuracaoFases[faseAtual].BossTimer;
let tempoAtualBoss = 0;
let bossVulneravel = false;

/*-----------------------------------------------------------------------
  Variaveis do Boss
-------------------------------------------------------------------------*/

let maxVidas = 6;
let vidas = maxVidas;
let bolasAtivas = [];
let coinsAcertadas = 0;
let coinsAtivas = [];

/*-----------------------------------------------------------------------
 Cria elementos da barra de vida do boss
-------------------------------------------------------------------------*/

const barraContainer = document.createElement("div");
barraContainer.id = "barraVidaContainer";
barraContainer.style.display = "none"; // Oculto inicialmente

const barraVida = document.createElement("div");
barraVida.id = "barraVida";

barraContainer.appendChild(barraVida);
document.body.appendChild(barraContainer);

/*-----------------------------------------------------------------------
  Mostra a fase atual no HUD
-------------------------------------------------------------------------*/

function atualizarFaseHUD(numero, nome) {
  const hud = document.getElementById("faseAtual");
  hud.textContent = `Fase ${numero}: ${nome}`;
}

/*-----------------------------------------------------------------------
  Atualiza a barra de vida do boss
-------------------------------------------------------------------------*/

function atualizarBarraVida() {
  const porcentagem = (bossVidaAtual / bossVidaMax) * 100;
  barraVida.style.width = porcentagem + "%";
  const verde = Math.floor((porcentagem / 100) * 255);
  const vermelho = 255 - verde;
  barraVida.style.backgroundColor = `rgb(${vermelho}, ${verde}, 0)`;
}

/*-----------------------------------------------------------------------
  Define o tempo dos bosses e cria o relogio de tempo
-------------------------------------------------------------------------*/

function iniciarTempoBoss() {
  if (tempoBossTimer) clearTimeout(tempoBossTimer);
  if (tempoBossInterval) clearInterval(tempoBossInterval);

  tempoAtualBoss = 0;
  bossTimerCanvas.style.display = "block";

  tempoBossInterval = setInterval(atualizarTempoBoss, 100);

  bossVulneravel = true;
  bossAtivo = true;
  barraContainer.style.display = "block";

  if (faseAtual === 2) {
    criarCoinsAoRedorDoBoss();
  }
}

function atualizarTempoBoss() {
  tempoAtualBoss += 0.1;

  if (tempoAtualBoss >= tempoTotalBoss) {
    tempoAtualBoss = tempoTotalBoss;
    clearInterval(tempoBossInterval);
    bossTimerCanvas.style.display = "none";

    bossVulneravel = false;
    bossAtivo = false;
    barraContainer.style.display = "none";

    const bossmorte = document.querySelector(".boss");
    if (bossmorte) bossmorte.classList.add("inativo");

    bolasAcertadas = 0;

    if (faseAtual === 2) {
      removerTodasCoins();
    }

    criarBola();
  } else {
    const bossmorte = document.querySelector(".boss");
    if (bossmorte) bossmorte.classList.remove("inativo");
    desenharBossTimer();
  }
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

/*-----------------------------------------------------------------------
  Função para converter posições relativas para pixels
-------------------------------------------------------------------------*/

function posicaoRelativaParaPixels(posRelativa) {
  const largura = canvas.clientWidth;
  const altura = canvas.clientHeight;
  return {
    x: Math.round(posRelativa.x * largura) - 25,
    y: Math.round(posRelativa.y * altura) - 25,
  };
}

/*-----------------------------------------------------------------------
  Cria o boss e suas interações
-------------------------------------------------------------------------*/
function criarBoss() {
  if (document.querySelector(".boss") || !jogoAtivo) return;

  bolasAtivas.forEach(b => b.el.remove());
  bolasAtivas = [];

  const bossSize = 400;
  const posicaoRelativa = posicaoBossRelativa[0];
  const posicao = posicaoRelativaParaPixels(posicaoRelativa);

  const posX = posicao.x;
  const posY = posicao.y;

  criarElementoBoss(posX, posY, bossSize, bossSize);
}



function criarElementoBoss(posX, posY, bossWidth, bossHeight) {
  const boss = document.createElement("div");
  boss.classList.add("boss", configuracaoFases[faseAtual].classeBoss);

  boss.style.width = `${bossWidth}px`;
  boss.style.height = `${bossHeight}px`;
  boss.style.position = "absolute";
  boss.style.left = `${posX - bossWidth / 2}px`;
  boss.style.top = `${posY - bossHeight / 2}px`;
  boss.style.backgroundSize = "contain";
  boss.style.backgroundRepeat = "no-repeat";
  boss.style.backgroundPosition = "center";
  boss.style.zIndex = "10";

  canvas.appendChild(boss);

  // Troca a imagem para o gif de entrada do boss
  if (faseAtual === 1) {
    boss.style.backgroundImage = "url('./imagens/gulaGif.gif')";

    //SFX para quando o boss aparece
    let gulaSFX = new Audio("../audio/GulaSFX.mp3");
    gulaSFX.volume = 0.15
    gulaSFX.play();

    //volta para a imagem estatica
    setTimeout(() => {
      boss.style.backgroundImage = "url('./imagens/Gula.png')";
    }, 1400); //tempo para que o boss surja antes da explosão termina

  } else if (faseAtual === 2) {
    boss.style.backgroundImage = "url('./imagens/avarezaGif.gif')";

    //SFX para quando o boss aparece
    let avarezaSFX = new Audio("../audio/AvarezaSFX.mp3");
    avarezaSFX.volume = 0.25
    avarezaSFX.play();

    //volta para a imagem estatica
    setTimeout(() => {
      boss.style.backgroundImage = "url('./imagens/avareza.png')";
    }, 1400); //tempo para que o boss surja antes da explosão termina
  }

  boss.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!bossAtivo || !bossVulneravel || !atirar()) return;

    const somDisparoBoss = somDisparo.cloneNode();
    somDisparoBoss.volume = 0.3;
    somDisparoBoss.play().catch(console.error);

    // Na fase 1, o dano é ao clicar direto no boss
    if (faseAtual === 1) {
      bossVidaAtual--;
      atualizarBarraVida();
      if (bossVidaAtual <= 0) {
        clearTimeout(tempoBossTimer);
        mostrarVitoria();
      }
    }
    // Na fase 2 o dano só vem das coins, clique no boss não diminui vida
  });
}


/*-----------------------------------------------------------------------
  Cria as coins ao redor do boss na fase 2
-------------------------------------------------------------------------*/

function criarCoinsAoRedorDoBoss() {
  if (faseAtual !== 2 || !bossVulneravel) return;

  const posicoes = configuracaoFases[faseAtual].posicaoCoins;
  coinsAcertadas = 0;
  coinsAtivas = [];

  posicoes.forEach((posRelativa) => {
    const pos = posicaoRelativaParaPixels(posRelativa);

    const coin = document.createElement("div");
    coin.classList.add("coin");
    coin.style.position = "absolute";
    coin.style.left = `${pos.x}px`;
    coin.style.top = `${pos.y}px`;
    coin.style.cursor = "pointer";

    coin.addEventListener("click", () => {
      if (!bossVulneravel) return;

      coin.remove();
      tocarSom(somMoeda);
      coinsAcertadas++;

      const somDisparoBoss = somDisparo.cloneNode();
      somDisparoBoss.volume = 0.3;
      somDisparoBoss.play().catch(console.error);

      bossVidaAtual--;
      atualizarBarraVida();

      if (bossVidaAtual <= 0) {
        mostrarVitoria();
        return;
      }

      if (coinsAcertadas >= posicoes.length) {
        clearInterval(tempoBossInterval);
        bossTimerCanvas.style.display = "none";
        bossVulneravel = false;
        bossAtivo = false;
        barraContainer.style.display = "none";

        bolasAcertadas = 0;
        criarBola();
      }
    });

    document.body.appendChild(coin);
    coinsAtivas.push(coin);
  });
}

/*-----------------------------------------------------------------------
  Remove todas as coins ativas
-------------------------------------------------------------------------*/

function removerTodasCoins() {
  coinsAtivas.forEach(coin => coin.remove());
  coinsAtivas = [];
  coinsAcertadas = 0;
}

/*-----------------------------------------------------------------------
  Cria os elementos dos circulo vermelho e do circulo branco
-------------------------------------------------------------------------*/


function criarBola() {
  if (!jogoAtivo || bossAtivo) return;

  const posicoesBolasPixels = posicaoBolasRelativas.map(pos => posicaoRelativaParaPixels(pos));

  // Filtra posições livres que não estão ocupadas por nenhuma bola ativa
  const posicoesDisponiveis = posicoesBolasPixels.filter(pos => {
    return !bolasAtivas.some(b => (
      pos.x < b.x + 50 &&
      pos.x + 50 > b.x &&
      pos.y < b.y + 50 &&
      pos.y + 50 > b.y
    ));
  });

  if (posicoesDisponiveis.length === 0) {
    // Se não tiver nenhuma posição disponível, tenta de novo em breve
    setTimeout(criarBola, 200);
    return;
  }

  // Escolhe uma posição aleatória entre as livres
  const posicaoEscolhida = posicoesDisponiveis[Math.floor(Math.random() * posicoesDisponiveis.length)];
  const posX = posicaoEscolhida.x;
  const posY = posicaoEscolhida.y;

  criarElementoBola(posX, posY);
}


function criarElementoBola(posX, posY) {
  // Criação dos elementos DOM
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

  criarInimigo(posX, posY, envelope);
  canvas.appendChild(envelope);

  bolasAtivas.push({ x: posX, y: posY, el: envelope });

  // Evento de clique na bola
  envelope.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!atirar()) return;

    // Remove a bola imediatamente para sumir o círculo da bola
    const bola = envelope.querySelector(".bola");
    if (bola) {
      bola.remove();
    }

    const circulo = envelope.querySelector(".circulo");
    if (circulo) {
      circulo.remove();
    }

    // Troca sprite e animação do inimigo
    const inimigo = envelope.querySelector(".inimigo");
    if (inimigo) {
      inimigo.src = "./imagens/inimigoMorte.png"; // troca o sprite
      inimigo.classList.add("morte"); // ativa a animação
    }

    setTimeout(() => {
      envelope.remove();
      bolasAtivas = bolasAtivas.filter((b) => b.el !== envelope);

      if (!bossAtivo) {
        bolasAcertadas++;
        if (bolasAcertadas >= 1) { //quantidade necessaria de inimigos mortos
          bolasAtivas.forEach(b => b.el.remove());
          bolasAtivas = [];

          bossAtivo = true;
          bossVulneravel = true;
          barraContainer.style.display = "block";
          atualizarBarraVida();
          criarBoss();
          iniciarTempoBoss();
        }
      }
    }, 2000); // espera a animação terminar
  });

  //remove a bola se nao acertar
  setTimeout(() => {
    if (document.body.contains(envelope)) {
      const inimigo = envelope.querySelector(".inimigo");
      if (inimigo) {
        inimigo.src = "./imagens/tiroinimigo.png";
      }

      const somTiroInimigo = new Audio("../audio/tiroSomInimigo.mp3");
      somTiroInimigo.volume = 0.1;
      somTiroInimigo.play().catch(() => { });

      setTimeout(() => {
        envelope.remove();
        bolasAtivas = bolasAtivas.filter((b) => b.el !== envelope);
        vidas--;

        // Atualiza HUD de vida
        atualizarVidas();

        // Troca temporária do HUD ao tomar dano
        const fundoHud = document.getElementById("fundoHud");
        fundoHud.src = "imagens/hudDano.png";
        setTimeout(() => {
          fundoHud.src = "imagens/hudNormal.png";
        }, 500); // tempo para voltar ao normal

        if (vidas <= 0) mostrarGameOver();
      }, 300);
    }
  }, 5000);//tempo pra bola sumir


  // Programar a próxima bola se o jogo estiver ativo e sem boss
  const delay = Math.random() * 1000 + 500;
  setTimeout(() => {
    if (jogoAtivo && !bossAtivo) criarBola();
  }, delay);
}

//antiga funcao de criar personagem, deixei o atirar pois nao funciona sem chamar aqui antes
function criaPersonagem() {
  canvas.addEventListener("click", () => {
    atirar();
  });
}

/*-----------------------------------------------------------------------
  Adiciona o sprite do inimigo na tela
-------------------------------------------------------------------------*/

function criarInimigo(posX, posY, container) {
  const inimigo = document.createElement("img");
  inimigo.src = "./imagens/inimigo.png";
  inimigo.className = "inimigo";
  inimigo.style.position = "absolute";
  inimigo.style.left = `-50px`; // relativo ao container
  inimigo.style.top = `-30px`;  // relativo ao container
  container.appendChild(inimigo);
}
/*-----------------------------------------------------------------------
  Atualiza a munição e as vidas no HUD
-------------------------------------------------------------------------*/

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

/*-----------------------------------------------------------------------
  Adicionando o som de disparo e recarregar
-------------------------------------------------------------------------*/

// Criando os objetos de áudio
const somDisparo = new Audio('../audio/tiroSom.mp3');
const somRecarregar = new Audio('../audio/recarregarSom.mp3');
const somMoeda = new Audio('../audio/som-moeda.mp3');

// Ajustando o volume
somDisparo.volume = 0.1; // 0.0 (silêncio) a 1.0 (volume máximo)
somRecarregar.volume = 0.5;
somMoeda.volume = 0.5;

// Definindo loop
somDisparo.loop = false; // Não repete o som
somRecarregar.loop = false; // Não repete o som
somMoeda.loop = false;

function tocarSom(som) {
  som.pause();       // Pausa o som, se estiver tocando
  som.currentTime = 0; // Volta o som pro começo
  som.play().catch(console.error); // Toca o som e captura erro, se der
}



/*-----------------------------------------------------------------------
  Função de disparo e recarregar
-------------------------------------------------------------------------*/

// Função de disparo
function atirar() {
  if (recarregando) return false;

  tocarMusica();

  if (faseAtual === 1 && bossAtivo) return true;

  if (muni <= 0) {
    mostrarMensagemRecarregar();
    return false;
  }

  muni--;
  atualizarMunicao();

  // Clonando e tocando o som de disparo
  const somDisparoClone = somDisparo.cloneNode();
  somDisparoClone.play();

  return true;
}

// Evento de tecla para recarregar
window.addEventListener("keydown", (event) => {
  if (
    (event.key === "r" || event.key === "R") &&
    !recarregando &&
    muni < maxmuni &&
    muni <= 5
  ) {
    somRecarregar.play(); // Toca o som de recarregamento
    recarregando = true;
    mostrarAnimacaoRecarregando();
    setTimeout(() => {
      muni = maxmuni;
      atualizarMunicao();
      recarregando = false;
    }, 500);
  }
});
/*-----------------------------------------------------------------------
  Funções de mensagem de recarregar e animação de recarregamento
-------------------------------------------------------------------------*/

const msgRecarregar = document.getElementById("mensagem-recarregar");
const barraRecarregando = document.getElementById("animacao-recarregando");

function mostrarMensagemRecarregar() {
  msgRecarregar.style.display = "block";
  setTimeout(() => {
    msgRecarregar.style.display = "none";
  }, 1500);
}

function mostrarAnimacaoRecarregando() {
  const iconeRecarregar = document.getElementById("iconeRecarregar");

  // Troca imagem para gif animado
  iconeRecarregar.src = "./imagens/recarregarAnimado.gif";

  setTimeout(() => {
    barraRecarregando.style.width = "150px";
  }, 10);

  setTimeout(() => {
    barraRecarregando.style.display = "none";
    barraRecarregando.style.width = "0";

    // Volta imagem para estado parado
    iconeRecarregar.src = "./imagens/recarregarParado.png";
  }, 550);
}


/*-----------------------------------------------------------------------
  Tela de vitória, reset das variaveis, e transição para a próxima fase/menu
-------------------------------------------------------------------------*/

function mostrarVitoria() {

  switch (faseAtual) {
    case 1:
      const bossMorte1 = document.querySelector(".boss");
      bossMorte1.style.backgroundImage = "url('./imagens/gulaMorteGif.gif')";
      bossMorte1.style.top = "400px";

      setTimeout(() => {
        bossMorte1.style.backgroundImage = "url('./imagens/GulaMorte.png')";
      }, 1400); // tempo do gif
      break;

    case 2:
      const bossMorte2 = document.querySelector(".boss");
      bossMorte2.style.backgroundImage = "url('./imagens/avarezaMorteGif.gif')";
      bossMorte2.style.top = "630px";

      setTimeout(() => {
        bossMorte2.style.backgroundImage = "url('./imagens/avarezaMorte.png')";
      }, 1400); // tempo do gif
      break;
  }

  setTimeout(() => {
    jogoAtivo = false;
    bolasAtivas.forEach(b => b.el.remove());
    bolasAtivas = [];
    coinsAtivas.forEach(c => c.remove());
    coinsAtivas = [];
    clearTimeout(tempoBossTimer);
    canvas.innerHTML = "";
    barraContainer.style.display = "none";

    const proximaFase = faseAtual + 1;
    const mensagemImg = document.createElement("img");
    mensagemImg.className = "mensagem-vitoria";

    if (proximaFase > configuracaoFases.length - 1) {
      mensagemImg.src = "imagens/vitoria.png";
      mensagemImg.alt = "Você completou todas as fases!";
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 5000);
    } else {
      mensagemImg.src = "imagens/vitoria.png";
      mensagemImg.alt = "VITÓRIA!";
      mensagemImg.addEventListener("click", () => {
        window.location.href = `./fase${proximaFase}.html`;
      });
      setTimeout(() => {
        window.location.href = `./fase${proximaFase}.html`;
      }, 10000);
    }

    canvas.appendChild(mensagemImg);
  }, 2000); //segundos do sprite de morte
}

/*-----------------------------------------------------------------------
  Mostra o game-over, reseta as variaveis, e transição para a mesma fase/menu
-------------------------------------------------------------------------*/

function mostrarGameOver() {
  jogoAtivo = false;
  bolasAtivas.forEach(b => b.el.remove());
  bolasAtivas = [];
  clearTimeout(tempoBossTimer);
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  // Cria o elemento img em vez da div texto
  const mensagemImg = document.createElement("img");
  mensagemImg.className = "mensagem-derrota";
  mensagemImg.src = "imagens/gameOver.png"; // caminho da sua imagem
  mensagemImg.alt = "GAME OVER";
  mensagemImg.style.cursor = "pointer";

  mensagemImg.addEventListener("click", () => {
    window.location.href = `./fase${faseAtual}.html`;
  });

  canvas.appendChild(mensagemImg);

  setTimeout(() => {
    window.location.href = `./fase${faseAtual}.html`;
  }, 10000);
}

/*-----------------------------------------------------------------------
  Função de tocar música ao clicar
-------------------------------------------------------------------------*/

function tocarMusica() {
  const musicaFundo1 = document.getElementById("musica-fundo1");
  musicaFundo1.volume = 0.1;
  musicaFundo1.play().catch(() => { });
}

function musica() {
  // Remove os listeners antigos para evitar duplicação
  window.removeEventListener("click", tocarMusica);
  window.addEventListener("click", tocarMusica, { once: true });
}




window.addEventListener("DOMContentLoaded", musica);

/*-----------------------------------------------------------------------
  Função para iniciar a fase e mostrar a mensagem de introdução
-------------------------------------------------------------------------*/

function iniciarFase() {
  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-fase";

  if (faseAtual == 1) {
    mensagem.innerHTML = `
    <strong>
      Fase ${faseAtual} 
    </strong> <br>
      A Gula foi despertada 
    <br>
      De a ela o que ela mais deseja: uma chuva de balas!
    <br>
    <button id="botaoComecarFase">Começar</button>
    `;
  } else {
    mensagem.style.backgroundSize = "27rem 8rem";
    mensagem.innerHTML = `
    <strong>
      Fase ${faseAtual} 
    </strong> <br>
      A Avareza foi despertada
    <br>
       Mostre que nem ouro pode protegê-la!
    <br>
    <button id="botaoComecarFase">Começar</button>
    `;
  }

  canvas.appendChild(mensagem);

  document.getElementById("botaoComecarFase").addEventListener("click", () => {
    mensagem.remove();
    criarBola();
    criaPersonagem();
    atualizarMunicao();  // ← Garantir que é chamado em ambas as fases
    atualizarVidas();
    atualizarBarraVida();
  });
}

// Inicializa a fase ao carregar
iniciarFase();