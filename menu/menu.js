// Dados dos personagens
const personagens = [
    {
        nome: 'CLINT',
        descricao: 'PISTOLEIRO MORTO-VIVO, RESSUSCITADO PARA CAÇAR AS FORÇAS DO INFERNO.',
        imagem: 'https://i.pinimg.com/736x/9b/e9/50/9be95049887c336a5bea6e25feed3c2d.jpg',
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

// Variáveis globais
let personagemSelecionadoIndex = 0;
const musicaFundo = document.getElementById('musica-fundo');

// Elementos da DOM
const elementos = {
    telas: {
        inicio: document.getElementById('tela-inicio'),
        menu: document.getElementById('tela-menu'),
        personagens: document.getElementById('tela-personagens'),
        configuracoes: document.getElementById('tela-configuracoes')
    },
    botoes: {
        iniciar: document.getElementById('btn-iniciar'),
        voltarPersonagens: document.getElementById('btn-voltar-personagens'),
        voltarConfig: document.getElementById('btn-voltar-config'),
        som: document.getElementById('btn-som'),
        telaCheia: document.getElementById('btn-tela-cheia')
    },
    listaPersonagens: document.getElementById('lista-personagens'),
    detalhesPersonagem: document.getElementById('detalhes-personagem')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    carregarPersonagens();
    configurarMusica();
    configurarTelaCheia();
});

function configurarEventos() {
    elementos.botoes.iniciar.addEventListener('click', () => mostrarTela('menu'));

    document.querySelectorAll('.opcao-menu').forEach(opcao => {
        opcao.addEventListener('click', function() {
            mostrarTela(this.dataset.tela);
        });
        opcao.addEventListener('mouseover', criarFaisca);
    });

    elementos.botoes.voltarPersonagens.addEventListener('click', () => mostrarTela('menu'));
    elementos.botoes.voltarConfig.addEventListener('click', () => mostrarTela('menu'));

    elementos.listaPersonagens.addEventListener('click', function(e) {
        const item = e.target.closest('.list-group-item');
        if (item && !item.classList.contains('bloqueado') && item.dataset.index) {
            selecionarPersonagem(parseInt(item.dataset.index));
        }
    });
}

function mostrarTela(tela) {
    Object.values(elementos.telas).forEach(t => t.style.display = 'none');
    if (elementos.telas[tela]) elementos.telas[tela].style.display = 'flex';
}

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

function selecionarPersonagem(index) {
    personagemSelecionadoIndex = index;
    document.querySelectorAll('#lista-personagens .list-group-item').forEach((item, i) => {
        item.classList.toggle('selecionado', i === index && !item.classList.contains('bloqueado'));
    });
    atualizarDetalhesPersonagem();
}

function atualizarDetalhesPersonagem() {
    const personagem = personagens[personagemSelecionadoIndex];
    
    if (personagem.bloqueado) {
        elementos.detalhesPersonagem.innerHTML = `
            <div class="personagem-bloqueado">
                <h3 class="fonte-pixelada-titulo">PERSONAGEM BLOQUEADO</h3>
                <p class="fonte-pixelada-texto">DISPONÍVEL EM UMA ATUALIZAÇÃO FUTURA</p>
                <div class="cadeado-grande">🔒</div>
            </div>
        `;
        return;
    }
    
    elementos.detalhesPersonagem.innerHTML = `
        <img src="${personagem.imagem}" alt="${personagem.nome}">
        <h3 class="fonte-pixelada-titulo">${personagem.nome}</h3>
        <p class="fonte-pixelada-texto">${personagem.descricao}</p>
        <button class="btn-selecionar fonte-pixelada-menu">SELECIONAR</button>
    `;
    
    elementos.detalhesPersonagem.querySelector('.btn-selecionar').addEventListener('click', () => {
        iniciarJogoComPersonagem(personagem);
    });
}

function iniciarJogoComPersonagem(personagem) {
    elementos.telas.personagens.innerHTML = `
        <div class="tela-carregamento">
            <h2 class="fonte-pixelada-titulo">INICIANDO...</h2>
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
        window.location.href = './fases/fase1.html';
    }, 3000);
}

function configurarMusica() {
    elementos.botoes.som.textContent = musicaFundo.muted ? '🔇 SOM DESLIGADO' : '🔊 SOM LIGADO';
    
    elementos.botoes.som.addEventListener('click', function() {
        musicaFundo.muted = !musicaFundo.muted;
        this.textContent = musicaFundo.muted ? '🔇 SOM DESLIGADO' : '🔊 SOM LIGADO';
    });

    window.addEventListener('click', function iniciarMusica() {
        musicaFundo.play().catch(() => {});
        window.removeEventListener('click', iniciarMusica);
    }, { once: true });
}

function configurarTelaCheia() {
    elementos.botoes.telaCheia.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => this.textContent = '🖥️ SAIR DA TELA CHEIA')
                .catch(err => console.error('Erro ao entrar em tela cheia:', err));
        } else {
            document.exitFullscreen();
            this.textContent = '🖥️ TELA CHEIA';
        }
    });
}

//========================================
// Cria efeito de faísca ao passar o mouse
//========================================
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