// Define 6 posições fixas em linha (horizontalmente)
const posicoesFixas = [320, 640,980,1300,1620,1920]; // Posições fixas em pixels
const ocupadas = [false, false, false, false, false, false]; // Posições livres/inativas

function criarBola() {
  // Verifica se ainda há posições livres
  const livres = posicoesFixas.map((_, i) => !ocupadas[i] ? i : null).filter(i => i !== null);
  if (livres.length === 0) {
    // Se todas estiverem ocupadas, tenta novamente em breve
    setTimeout(criarBola, 200);
    return;
  }

  // Escolhe uma posição aleatória entre as livres
  const indice = livres[Math.floor(Math.random() * livres.length)];
  ocupadas[indice] = true; // Marca como ocupada

  // Cria um contêiner para agrupar a bolinha e o círculo
  const envelope = document.createElement("div");
  envelope.style.position = "absolute";

  // Cria a bolinha
  const bola = document.createElement("div");
  bola.classList.add("bola");

  // Cria o círculo ao redor
  const circulo = document.createElement("div");
  circulo.classList.add("circulo");

  // Define a posição da bolinha na linha (top fixo, left da posição escolhida)
  envelope.style.left = `${posicoesFixas[indice]}px`;
  envelope.style.top = `300px`;

  // Adiciona a bolinha e o círculo dentro do contêiner
  envelope.appendChild(circulo);
  envelope.appendChild(bola);
  document.body.appendChild(envelope);

  // Remove ao clicar
  envelope.addEventListener("click", () => {
    envelope.remove();
    ocupadas[indice] = false; // Libera a posição ao clicar
  });

  // Remove automaticamente após 4s e libera a posição
  setTimeout(() => {
    envelope.remove();
    ocupadas[indice] = false;
  }, 4000);

  // Espera um tempo aleatório e chama a função novamente
  const delay = Math.random() * 1000 + 500; // Tempo entre 0.5s e 1.5s
  setTimeout(criarBola, delay);
}

// Começa o jogo
criarBola();
