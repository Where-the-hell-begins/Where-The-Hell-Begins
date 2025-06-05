const canvas = document.getElementById("canvas");
let muni = 6;
let maxmuni = 6;
const posicaoBoss = 720;
let bolasAcertadas = 0;  // Contador de bolas pequenas acertadas
let bossVidaMax = 5;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false; // Se o boss pode receber dano
let tempoBossTimer = null;

// Criar barra de vida do boss
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

function atualizarBarraVida() {
  const porcentagem = (bossVidaAtual / bossVidaMax) * 100;
  barraVida.style.width = porcentagem + "%";

  // Cor vai de verde para vermelho
  const verde = Math.floor((porcentagem / 100) * 255);
  const vermelho = 255 - verde;
  barraVida.style.backgroundColor = `rgb(${vermelho}, ${verde}, 0)`;
}

function iniciarTempoBoss() {
  if (tempoBossTimer) clearTimeout(tempoBossTimer);

  tempoBossTimer = setTimeout(() => {
    // Tempo acabou, resetar só as bolasAcertadas e desativar boss,
    // mas mantém bossVidaAtual e barra de vida.
    bossAtivo = false;
    barraContainer.style.display = "none";
    bolasAcertadas = 0;
    // NÃO resetar bossVidaAtual aqui!
  }, 5000);
}

function boss() {
  const boss = document.createElement("div");
  boss.classList.add("boss");
  boss.style.left = `${posicaoBoss - 50}px`;
  boss.style.top = "250px";
  canvas.appendChild(boss);

  boss.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!bossAtivo) return;

    if (!tiro()) return;

    // Boss leva dano
    bossVidaAtual--;
    atualizarBarraVida();

    if (bossVidaAtual <= 0) {
      mostrarWin();
    } else {
      iniciarTempoBoss(); // Reset timer a cada acerto no boss
    }
  });
}

function criarBolas(posicaoBolas) {

  const ocupadas = posicoesBolas.map(() => false);
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

  envelope.style.left = `${posicoesBolas[indice] - 25}px`;
  envelope.style.top = `300px`;

  envelope.appendChild(circulo);
  envelope.appendChild(bola);
  canvas.appendChild(envelope);

  // Clique na bola
  envelope.addEventListener("click", (event) => {
    event.stopPropagation();

    if (!tiro()) return;

    envelope.remove();
    ocupadas[indice] = false;

    if (!bossAtivo) {
      // Contar acertos nas bolas pequenas
      bolasAcertadas++;
      if (bolasAcertadas >= 10) {
        bossAtivo = true;
        barraContainer.style.display = "block";
        iniciarTempoBoss();
      }
    }
  });

  // Remoção automática após 4 segundos
  setTimeout(() => {
    if (document.body.contains(envelope)) {
      envelope.remove();
      ocupadas[indice] = false;
    }
  }, 4000);

  const delay = Math.random() * 1000 + 500;
  setTimeout(criarBola, delay);
}

function criarArma() {
  const arma = document.createElement("div");
  arma.classList.add("arma");
  canvas.appendChild(arma);

  canvas.addEventListener("click", () => {
    tiro();
  });
}

function atualizarMunicao() {
  const container = document.getElementById("municao");
  container.innerHTML = "";

  for (let i = 0; i < maxmuni; i++) {
    const bala = document.createElement("span");
    bala.classList.add("bala");
    bala.innerText = "⏺︎";

    if (i >= muni) {
      bala.classList.add("apagada");
    }

    container.appendChild(bala);
  }
}

function tiro() {
  if (recarregando || muni <= 0) {
    return false;
  } else {
    muni--;
    atualizarMunicao();
    return true;
  }
}

let recarregando = false;

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

function mostrarWin() {
  // Limpa o canvas
  canvas.innerHTML = "";

  // Remove barra de vida
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
  mensagem.innerText = "WIN";

  canvas.appendChild(mensagem);

  // Para evitar novas interações, remove eventos e timers
  bossAtivo = false;
  bolasAcertadas = 0;
  clearTimeout(tempoBossTimer);
}

function fases(IndexFase) {
  switch (IndexFase) {
    case 1:
      document.getElementById("canvas").classList.add("fase1");
      const pocicaoFase1 = [100, 200, 300, 400, 500, 600, 700];
      criarBola(pocicaoFase1);
      boss();
      criarArma();
      atualizarMunicao();
      atualizarBarraVida();
      break;
    case 2:
      break;
  }
}

// Inicialização
criarBola();
boss();
criarArma();
atualizarMunicao();
atualizarBarraVida(); // Atualiza a barra inicialmente (vida cheia)
