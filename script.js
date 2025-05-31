const canvas = document.getElementById("canvas");

// Posições fixas para as bolas (excluindo o centro onde está o boss)
const posicoesFixas = [240, 400, 560, 880, 1040, 1200];
const ocupadas = posicoesFixas.map(() => false);

// Boss centralizado
const posicaoBoss = 720;

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

  envelope.style.left = `${posicoesFixas[indice] - 25}px`;
  envelope.style.top = `300px`;

  envelope.appendChild(circulo);
  envelope.appendChild(bola);
  canvas.appendChild(envelope);

  // Clique na bola
  envelope.addEventListener("click", (event) => {
    event.stopPropagation(); // Impede propagação para evitar múltiplas chamadas

    if (!tiro()) return; // Se não puder atirar, não remove

    envelope.remove();
    ocupadas[indice] = false;
  });

  // Remoção automática após 4 segundos
  setTimeout(() => {
    if (document.body.contains(envelope)) {
      envelope.remove();
      ocupadas[indice] = false;
    }
  }, 4000);

  // Cria nova bola após um pequeno delay aleatório
  const delay = Math.random() * 1000 + 500;
  setTimeout(criarBola, delay);
}

function boss() {
  const boss = document.createElement("div");
  boss.classList.add("boss");
  boss.style.left = `${posicaoBoss - 50}px`;
  boss.style.top = "250px";
  canvas.appendChild(boss);
}

function criarArma() {
  const arma = document.createElement("div");
  arma.classList.add("arma");
  canvas.appendChild(arma);

  //Removido o de seguir a mira

  canvas.addEventListener("click", () => {
    tiro(); // Disparo geral (caso queira animar tiros mesmo sem acertar algo)
  });
}

// Munição
let muni = 6;
const maxmuni = 6;

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

// Atirar
function tiro() {
  if (recarregando || muni <= 0) {
    return false;
  } else {
    muni--;
    atualizarMunicao();
    return true;
  }
}

// Recarregar
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

// Inicialização
criarBola();
boss();
criarArma();
atualizarMunicao(); // Corrigido: não chamar tiro() aqui
