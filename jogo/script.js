const canvas = document.getElementById("canvas");

// Posições fixas para as bolas (excluindo o centro onde está o boss)
const posicoesFixas = [240, 400, 560, 880, 1040, 1200];
const ocupadas = posicoesFixas.map(() => false);

// Boss centralizado
const posicaoBoss = 720;

function criarBola() {
  const livres = posicoesFixas
    .map((_, i) => !ocupadas[i] ? i : null)
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

  envelope.addEventListener("click", () => {
    envelope.remove();
    tiro();
    ocupadas[indice] = false;
  });

  setTimeout(() => {
    envelope.remove();
    ocupadas[indice] = false;
  }, 4000);

  const delay = Math.random() * 1000 + 500;
  setTimeout(criarBola, delay);
}

function boss() {
  const boss = document.createElement("div");
  boss.classList.add("boss");
  boss.style.left = `${posicaoBoss - 50}px`; // Centralizado (100px de largura)
  boss.style.top = "250px";
  canvas.appendChild(boss);
}

function criarArma() {
  const arma = document.createElement("div");
  arma.classList.add("arma");
  canvas.appendChild(arma);

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const armaX = rect.left + canvas.clientWidth / 2;
    const armaY = rect.top + canvas.clientHeight;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dx = mouseX - armaX;
    const dy = mouseY - armaY;

    const angulo = Math.atan2(dy, dx);
    arma.style.transform = `translateX(-50%) rotate(${angulo}rad)`;
  });

  canvas.addEventListener("click", () => {
    tiro(); // dispara ao clicar
  });
  

}

let muni = 6; // valor inicial de munição

function atualizarMunicao() {
  const span = document.getElementById("municao");
  span.innerText = `Munição: ${muni}`;
}

function tiro() {
  if (muni > 0) {
    muni--;
    atualizarMunicao();
  }
}


// Inicialização do jogo
criarBola();
boss();
criarArma();
tiro();
atualizarMunicao();