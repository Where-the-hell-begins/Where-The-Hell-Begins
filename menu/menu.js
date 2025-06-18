// Dados dos personagens
const personagens = [
    {
        nome: 'CLINT',
        descricao: 'PISTOLEIRO MORTO-VIVO, RESSUSCITADO PARA CAÇAR AS FORÇAS DO INFERNO.',
        imagem: './fases/imagens/profile-export.png',
        bloqueado: false
    },
    {
        nome: 'EM BREVE',
        bloqueado: true
    },
    {
        nome: 'EM BREVE',
        bloqueado: true
    }
];

let personagemSelecionadoIndex = 0;
const musicaFundo = document.getElementById('musica-fundo');

const elementos = {
    telas: {
        inicio: document.getElementById('tela-inicio'),
        menu: document.getElementById('tela-menu'),
        personagens: document.getElementById('tela-personagens'),
        configuracoes: document.getElementById('tela-configuracoes'),
        creditos: document.getElementById('tela-creditos')
    },
    botoes: {
        iniciar: document.getElementById('btn-iniciar'),
        voltarPersonagens: document.getElementById('btn-voltar-personagens'),
        voltarConfig: document.getElementById('btn-voltar-config'),
        voltarCreditos: document.getElementById('btn-voltar-creditos'),
        som: document.getElementById('btn-som'),
        telaCheia: document.getElementById('btn-tela-cheia')
    },
    listaPersonagens: document.getElementById('lista-personagens'),
    detalhesPersonagem: document.getElementById('detalhes-personagem')
};

document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    carregarPersonagens();
    configurarMusica();
    configurarTelaCheia();
});

//======================
// Configura os eventos=
//======================
function configurarEventos() {
    // Botão de iniciar na tela inicial
    elementos.botoes.iniciar.addEventListener('click', () => mostrarTela('menu'));

    // Opções do menu principal
    document.querySelectorAll('.opcao-menu').forEach(opcao => {
        opcao.addEventListener('click', function() {
            mostrarTela(this.dataset.tela);
        });
        opcao.addEventListener('mouseover', criarFaisca);
    });

    // Botões de voltar
    elementos.botoes.voltarPersonagens.addEventListener('click', () => mostrarTela('menu'));
    elementos.botoes.voltarConfig.addEventListener('click', () => mostrarTela('menu'));
    elementos.botoes.voltarCreditos.addEventListener('click', () => mostrarTela('menu'));
}

//================================================
// Mostra uma tela específica e esconde as outras=
//================================================
function mostrarTela(tela) {
    Object.values(elementos.telas).forEach(t => t.style.display = 'none');
    if (elementos.telas[tela]) elementos.telas[tela].style.display = 'flex';
}

//===================================================
// Carrega a lista de personagens na tela de seleção=
//===================================================
function carregarPersonagens() {
    elementos.listaPersonagens.innerHTML = '';
    
    personagens.forEach((personagem, index) => {
        const item = document.createElement('li');
        item.className = `list-group-item ${index === personagemSelecionadoIndex ? 'selecionado' : ''}`;
        
        if (personagem.bloqueado) {
            item.innerHTML = `
                <span>${personagem.nome}</span>
                <span class="cadeado">🔒</span>
            `;
            item.classList.add('bloqueado');
        } else {
            item.textContent = personagem.nome;
            item.dataset.index = index;
        }
        
        elementos.listaPersonagens.appendChild(item);
    });
    
    atualizarDetalhesPersonagem();
}

//==================================
// Seleciona um personagem da lista=
//==================================
function selecionarPersonagem(index) {
    personagemSelecionadoIndex = index;
    document.querySelectorAll('#lista-personagens .list-group-item').forEach((item, i) => {
        item.classList.toggle('selecionado', i === index && !item.classList.contains('bloqueado'));
    });
    atualizarDetalhesPersonagem();
}

//=======================================================
// Atualiza a área de detalhes do personagem selecionado=
//=======================================================
function atualizarDetalhesPersonagem() {
    const personagem = personagens[personagemSelecionadoIndex];
    
    if (personagem.bloqueado) {
        elementos.detalhesPersonagem.innerHTML = `
            <div class="personagem-bloqueado">
                <h3>Personagem Bloqueado</h3>
            </div>
        `;
        return;
    }
    
    elementos.detalhesPersonagem.innerHTML = `
        <img src="${personagem.imagem}" alt="${personagem.nome}">
        <h3>${personagem.nome}</h3>
        <p>${personagem.descricao}</p>
        <button class="btn-selecionar">Selecionar</button>
    `;
    
    elementos.detalhesPersonagem.querySelector('.btn-selecionar').addEventListener('click', () => {
        iniciarJogoComPersonagem(personagem);
    });
}

//=============================================================
// Mostra tela de carregamento e inicia o jogo após 3 segundos=
//=============================================================
function iniciarJogoComPersonagem(personagem) {
    elementos.telas.personagens.innerHTML = `
        <div class="tela-carregamento">
            <h2>INICIANDO...</h2>
            <div class="barra-carregamento">
                <div class="progresso-carregamento"></div>
            </div>
        </div>
    `;
    
    const barraProgresso = document.querySelector('.progresso-carregamento');
    barraProgresso.style.width = '0%';
    setTimeout(() => barraProgresso.style.width = '100%', 100);
    
    setTimeout(() => {
        sessionStorage.setItem('personagemSelecionado', JSON.stringify(personagem));
        sessionStorage.setItem('musicaLigada', !musicaFundo.muted);
        window.location.href = './cutscene.html';
    }, 3000);
}

//=============================
// Configura o controle de som=
//=============================
function configurarMusica() {
    elementos.botoes.som.textContent = musicaFundo.muted ? '🔇 Música Desligada' : '🔊 Música Ligada';
    
    elementos.botoes.som.addEventListener('click', function() {
        musicaFundo.muted = !musicaFundo.muted;
        this.textContent = musicaFundo.muted ? '🔇 Música Desligada' : '🔊 Música Ligada';
    });

    window.addEventListener('click', function iniciarMusica() {
        musicaFundo.play().catch(() => {});
        window.removeEventListener('click', iniciarMusica);
    }, { once: true });
}

//=========================================
// Cria efeito de faísca ao passar o mouse=
//=========================================
function criarFaisca(evento) {
    const faisca = document.createElement('div');
    faisca.className = 'faisca';
    faisca.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
    faisca.style.setProperty('--y', `${Math.random() * -100 - 50}px`);
    faisca.style.left = `${evento.clientX}px`;
    faisca.style.top = `${evento.clientY}px`;
    
    document.body.appendChild(faisca);
    faisca.addEventListener('animationend', () => faisca.remove());
}