// Dados dos personagens
const personagens = [
    {
        nome: 'Reaper Bill',
        descricao: 'Pistoleiro morto-vivo, ressuscitado para caçar as forças do inferno.',
        imagem: 'https://i.pinimg.com/736x/9b/e9/50/9be95049887c336a5bea6e25feed3c2d.jpg'
    },
    {
        nome: 'Lilith Flame',
        descricao: 'Bruxa do deserto com pacto demoníaco reverso.',
        imagem: 'https://i.pinimg.com/736x/08/46/55/08465588aa672e99967c1636728afbd9.jpg'
    },
    {
        nome: 'Father Graves',
        descricao: 'Exorcista com espingarda sagrada e passado sombrio.',
        imagem: 'https://i.pinimg.com/736x/d2/0d/04/d20d043b427f8263d0c6621bb9338c5a.jpg'
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

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    configurarEventos();
    carregarPersonagens();
    configurarMusica();
    configurarTelaCheia();
});

/**
 * Configura todos os eventos da aplicação
 */
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

    // Lista de personagens
    elementos.listaPersonagens.addEventListener('click', function(e) {
        if (e.target.classList.contains('list-group-item')) {
            selecionarPersonagem(parseInt(e.target.dataset.index));
        }
    });
}

/**
 * Mostra uma tela específica e esconde as outras
 */
function mostrarTela(tela) {
    Object.values(elementos.telas).forEach(t => t.style.display = 'none');
    if (elementos.telas[tela]) elementos.telas[tela].style.display = 'flex';
}

/**
 * Carrega a lista de personagens na tela de seleção
 */
function carregarPersonagens() {
    elementos.listaPersonagens.innerHTML = '';
    
    personagens.forEach((personagem, index) => {
        const item = document.createElement('li');
        item.className = `list-group-item ${index === personagemSelecionadoIndex ? 'selecionado' : ''}`;
        item.textContent = personagem.nome;
        item.dataset.index = index;
        elementos.listaPersonagens.appendChild(item);
    });
    
    atualizarDetalhesPersonagem();
}

/**
 * Seleciona um personagem da lista
 */
function selecionarPersonagem(index) {
    personagemSelecionadoIndex = index;
    document.querySelectorAll('#lista-personagens .list-group-item').forEach((item, i) => {
        item.classList.toggle('selecionado', i === index);
    });
    atualizarDetalhesPersonagem();
}

/**
 * Atualiza a área de detalhes do personagem selecionado
 */
function atualizarDetalhesPersonagem() {
    const personagem = personagens[personagemSelecionadoIndex];
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

/**
 * Mostra tela de carregamento e inicia o jogo após 3 segundos
 */
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
        window.location.href = '../fases/fase.html';
    }, 3000);
}

//============================
// Configura o controle de som
//============================
function configurarMusica() {
    elementos.botoes.som.textContent = musicaFundo.muted ? '🔇 Som Desligado' : '🔊 Som Ligado';
    
    elementos.botoes.som.addEventListener('click', function() {
        musicaFundo.muted = !musicaFundo.muted;
        this.textContent = musicaFundo.muted ? '🔇 Som Desligado' : '🔊 Som Ligado';
    });

    // Inicia música no primeiro clique
    window.addEventListener('click', function iniciarMusica() {
        musicaFundo.play().catch(() => {});
        window.removeEventListener('click', iniciarMusica);
    }, { once: true });
}

//=================================
 // Configura o botão de tela cheia
 //=================================
function configurarTelaCheia() {
    elementos.botoes.telaCheia.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => this.textContent = '🖥️ Sair da Tela Cheia')
                .catch(err => console.error('Erro ao entrar em tela cheia:', err));
        } else {
            document.exitFullscreen();
            this.textContent = '🖥️ Tela Cheia';
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