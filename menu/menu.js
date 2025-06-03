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

// Elementos da DOM
const telas = {
    inicio: document.getElementById('tela-inicio'),
    menu: document.getElementById('tela-menu'),
    personagens: document.getElementById('tela-personagens'),
    configuracoes: document.getElementById('tela-configuracoes')
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos
    configurarEventos();
    
    // Carregar lista de personagens
    carregarPersonagens();
    
    // Configurar música de fundo
    configurarMusica();
});

/**
 * Configura todos os eventos da aplicação
 */
function configurarEventos() {
    // Botão de iniciar na tela inicial
    document.getElementById('btn-iniciar').addEventListener('click', function() {
        mostrarTela('menu');
    });
    
    // Opções do menu principal
    document.querySelectorAll('.opcao-menu').forEach(opcao => {
        opcao.addEventListener('click', function() {
            mostrarTela(this.dataset.tela);
        });
        
        // Efeito de faísca ao passar o mouse
        opcao.addEventListener('mouseover', criarFaisca);
    });
    
    // Botão voltar na tela de personagens
    document.getElementById('btn-voltar-personagens').addEventListener('click', function() {
        mostrarTela('menu');
    });
    
    // Botão voltar na tela de configurações
    document.getElementById('btn-voltar-config').addEventListener('click', function() {
        mostrarTela('menu');
    });
    
    // Itens da lista de personagens
    document.getElementById('lista-personagens').addEventListener('click', function(e) {
        if (e.target.classList.contains('list-group-item')) {
            selecionarPersonagem(parseInt(e.target.dataset.index));
        }
    });
}

/**
 * Mostra uma tela específica e esconde as outras
 * @param {string} tela - Nome da tela a ser mostrada
 */
function mostrarTela(tela) {
    // Esconder todas as telas
    Object.values(telas).forEach(tela => {
        tela.style.display = 'none';
    });
    
    // Mostrar a tela solicitada
    if (telas[tela]) {
        telas[tela].style.display = 'flex';
    }
}

/**
 * Carrega a lista de personagens na tela de seleção
 */
function carregarPersonagens() {
    const listaPersonagens = document.getElementById('lista-personagens');
    listaPersonagens.innerHTML = '';
    
    personagens.forEach((personagem, index) => {
        const item = document.createElement('li');
        item.className = 'list-group-item';
        item.textContent = personagem.nome;
        item.dataset.index = index;
        
        if (index === personagemSelecionadoIndex) {
            item.classList.add('selecionado');
        }
        
        listaPersonagens.appendChild(item);
    });
    
    // Atualizar detalhes do personagem selecionado
    atualizarDetalhesPersonagem();
}

/**
 * Seleciona um personagem da lista
 * @param {number} index - Índice do personagem na lista
 */
function selecionarPersonagem(index) {
    personagemSelecionadoIndex = index;
    
    // Atualizar classe 'selecionado' nos itens da lista
    document.querySelectorAll('#lista-personagens .list-group-item').forEach((item, i) => {
        if (i === index) {
            item.classList.add('selecionado');
        } else {
            item.classList.remove('selecionado');
        }
    });
    
    // Atualizar detalhes do personagem
    atualizarDetalhesPersonagem();
}

/**
 * Atualiza a área de detalhes do personagem selecionado
 */
function atualizarDetalhesPersonagem() {
    const detalhes = document.getElementById('detalhes-personagem');
    const personagem = personagens[personagemSelecionadoIndex];
    
    detalhes.innerHTML = `
        <img src="${personagem.imagem}" alt="${personagem.nome}">
        <h3>${personagem.nome}</h3>
        <p>${personagem.descricao}</p>
        <button class="btn-selecionar">Selecionar</button>
    `;
    
    // Configurar evento do botão selecionar
    detalhes.querySelector('.btn-selecionar').addEventListener('click', function() {
        redirecionarParaJogo(personagem);
    });
}

/**
 * Redireciona para a tela do jogo com o personagem selecionado
 * @param {Object} personagem - Personagem selecionado
 */
function redirecionarParaJogo(personagem) {
    // Armazena o personagem selecionado no sessionStorage
    sessionStorage.setItem('personagemSelecionado', JSON.stringify(personagem));
    
    // Redireciona para a página do jogo (index.html na raiz)
    window.location.href = '../index.html';
}   

/**
 * Cria efeito de faísca ao passar o mouse
 * @param {MouseEvent} evento - Evento de mouse
 */
function criarFaisca(evento) {
    const faisca = document.createElement('div');
    faisca.className = 'faisca';
    document.body.appendChild(faisca);

    const x = Math.random() * 100 - 50;
    const y = Math.random() * -100 - 50;

    faisca.style.setProperty('--x', `${x}px`);
    faisca.style.setProperty('--y', `${y}px`);
    faisca.style.left = `${evento.clientX}px`;
    faisca.style.top = `${evento.clientY}px`;

    faisca.addEventListener('animationend', () => {
        faisca.remove();
    });
}

/**
 * Configura a música de fundo para tocar no primeiro clique
 */
function configurarMusica() {
    window.addEventListener('click', function iniciarMusica() {
        const musica = document.getElementById('musica-fundo');
        if (musica) {
            musica.play().catch(() => {});
        }
        // Remove o evento após o primeiro clique
        window.removeEventListener('click', iniciarMusica);
    }, { once: true });
}