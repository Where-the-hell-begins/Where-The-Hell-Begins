const { createApp } = Vue;

createApp({
    data() {
        return {
            screen: 'title',
            selectedIndex: 0,
            characters: [
                {
                    name: 'Reaper Bill',
                    description: 'Pistoleiro morto-vivo, ressuscitado para caçar as forças do inferno.',
                    image: 'https://i.pinimg.com/736x/9b/e9/50/9be95049887c336a5bea6e25feed3c2d.jpg'
                },
                {
                    name: 'Lilith Flame',
                    description: 'Bruxa do deserto com pacto demoníaco reverso.',
                    image: 'https://i.pinimg.com/736x/08/46/55/08465588aa672e99967c1636728afbd9.jpg'
                },
                {
                    name: 'Father Graves',
                    description: 'Exorcista com espingarda sagrada e passado sombrio.',
                    image: 'https://i.pinimg.com/736x/d2/0d/04/d20d043b427f8263d0c6621bb9338c5a.jpg'
                }
            ]
        };
    },
    methods: {
        createSpark(event) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            document.body.appendChild(spark);

            const x = Math.random() * 100 - 50;
            const y = Math.random() * -100 - 50;

            spark.style.setProperty('--x', `${x}px`);
            spark.style.setProperty('--y', `${y}px`);
            spark.style.left = `${event.clientX}px`;
            spark.style.top = `${event.clientY}px`;

            spark.addEventListener('animationend', () => {
                spark.remove();
            });
        }
    }
}).mount('#app');

// ▶️ Música começa no primeiro clique
window.addEventListener('click', () => {
    const music = document.getElementById('bg-music');
    if (music) {
        music.play().catch(() => { });
    }
}, { once: true });
