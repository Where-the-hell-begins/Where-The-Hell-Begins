// Se não existir os containers de munição e vidas, cria eles no body
if (!document.getElementById("municao")) {
  const muniContainer = document.createElement("div");
  muniContainer.id = "municao";
  muniContainer.style.position = "absolute";
  muniContainer.style.top = "10px";
  muniContainer.style.left = "10px";
  muniContainer.style.color = "white";
  muniContainer.style.fontSize = "24px";
  muniContainer.style.fontFamily = "Arial, sans-serif";
  document.body.appendChild(muniContainer);
}

if (!document.getElementById("vidas")) {
  const vidasContainer = document.createElement("div");
  vidasContainer.id = "vidas";
  vidasContainer.style.position = "absolute";
  vidasContainer.style.top = "40px";
  vidasContainer.style.left = "10px";
  vidasContainer.style.color = "red";
  vidasContainer.style.fontSize = "24px";
  vidasContainer.style.fontFamily = "Arial, sans-serif";
  document.body.appendChild(vidasContainer);
}

// Posições fixas para as bolas (excluindo o centro onde está o boss)
const posicoesFixas = [240, 400, 560, 880, 1040, 1200];
const ocupadas = posicoesFixas.map(() => false);

// Boss centralizado
const posicaoBoss = 720;

let bolasAcertadas = 0;  // Contador de bolas pequenas acertadas
let bossVidaMax = 3;
let bossVidaAtual = bossVidaMax;
let bossAtivo = false; // Se o boss pode receber dano
let tempoBossTimer = null;

let muni = 6;
const maxmuni = 6;

let vidas = 5;
const maxVidas = 5;

let recarregando = false;

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
  }, 5000);
}

function criarBola() {
  const livres = posicoesFixas
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

  envelope.style.left = `${posicoesFixas[indice] - 25}px`;
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
      bolasAcertadas++;

      if (bolasAcertadas >= 3) {
        bossAtivo = true;
        barraContainer.style.display = "block";
        boss();
        iniciarTempoBoss();
      }
    }
  });

  // Remoção automática após 4 segundos
  setTimeout(() => {
    if (document.body.contains(envelope)) {
      envelope.remove();
      ocupadas[indice] = false;

      if (!bossAtivo) {
        vidas--;
        atualizarVidas();
        if (vidas <= 0) mostrarGameOver();
      }
    }
  }, 4000);

  const delay = Math.random() * 1000 + 500;
  setTimeout(criarBola, delay);
}

function boss() {
  if (document.querySelector(".boss")) return; // Evita múltiplos bosses

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

function criarPersonagem() {
  const personagem = document.createElement("div");
  personagem.classList.add("personagem");
  canvas.appendChild(personagem);

  canvas.addEventListener("click", () => {
    tiro();
  });
}

function atualizarMunicao() {
  const container = document.getElementById("municao");
  container.innerHTML = "";

  for (let i = 0; i < maxmuni; i++) {
    const bala = document.createElement("img");
    bala.classList.add("bala");

    bala.src = "./imagens/bala.jpg";  // caminho da sua imagem da bala (substitua conforme sua estrutura)
    bala.alt = "bala";
    bala.style.width = "28px";       // ajuste o tamanho conforme desejar
    bala.style.height = "28px";
    bala.style.opacity = i >= muni ? "0.2" : "1"; // sem munição fica semi-transparente
    bala.style.transition = "opacity 0.2s ease";

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

    if (i >= vidas) {
      vida.classList.add("perdida");
    }

    container.appendChild(vida);
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
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  const mensagem = document.createElement("div");
  mensagem.style.position = "fixed";  // mudar para fixed na tela toda
  mensagem.style.top = "50%";
  mensagem.style.left = "50%";
  mensagem.style.transform = "translate(-50%, -50%)";
  mensagem.style.color = "white";
  mensagem.style.fontSize = "60px";
  mensagem.style.fontWeight = "bold";
  mensagem.style.textShadow = "2px 2px 4px black";
  mensagem.style.backgroundColor = "rgba(0,0,0,0.8)";
  mensagem.style.padding = "20px 40px";
  mensagem.style.borderRadius = "10px";
  mensagem.style.cursor = "pointer";
  mensagem.style.zIndex = "10000";
  mensagem.innerText = "WIN";

  mensagem.addEventListener("click", resetarJogo);

  document.body.appendChild(mensagem);

  bossAtivo = false;
  bolasAcertadas = 0;
  clearTimeout(tempoBossTimer);
}

function mostrarGameOver() {
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  const mensagem = document.createElement("div");
  mensagem.style.position = "fixed";
  mensagem.style.top = "50%";
  mensagem.style.left = "50%";
  mensagem.style.transform = "translate(-50%, -50%)";
  mensagem.style.color = "red";
  mensagem.style.fontSize = "60px";
  mensagem.style.fontWeight = "bold";
  mensagem.style.textShadow = "2px 2px 4px black";
  mensagem.style.backgroundColor = "rgba(0,0,0,0.8)";
  mensagem.style.padding = "20px 40px";
  mensagem.style.borderRadius = "10px";
  mensagem.style.cursor = "pointer";
  mensagem.style.zIndex = "10000";
  mensagem.innerText = "GAME OVER";

  mensagem.addEventListener("click", resetarJogo);

  document.body.appendChild(mensagem);

  bossAtivo = false;
  bolasAcertadas = 0;
  clearTimeout(tempoBossTimer);
}

function resetarJogo() {
  // Resetar variáveis
  bolasAcertadas = 0;
  bossVidaAtual = bossVidaMax;
  bossAtivo = false;
  muni = maxmuni;
  vidas = maxVidas;
  recarregando = false;

  // Limpar canvas e barra
  canvas.innerHTML = "";
  barraContainer.style.display = "none";

  // Remover mensagens WIN ou GAME OVER se existirem
  const msgs = document.querySelectorAll("body > div");
  msgs.forEach(div => {
    if (div.innerText === "WIN" || div.innerText === "GAME OVER") {
      div.remove();
    }
  });

  // Reiniciar elementos do jogo
  criarBola();
  criarPersonagem();
  atualizarMunicao();
  atualizarVidas();
  atualizarBarraVida();
}
// Inicialização
criarBola();
criarPersonagem();
atualizarMunicao();
atualizarVidas();
atualizarBarraVida();
