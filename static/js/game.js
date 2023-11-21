let canvas, ctx;
let gameState = 'menu';
let score = 0;
let lives = 3;
let level = 1;
let difficulty = 'normal';
let animationId;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startGame() {
    difficulty = document.getElementById('difficulty').value;
    gameState = 'playing';
    score = 0;
    lives = 3;
    level = 1;
    
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    updateUI();
    gameLoop();
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    clearCanvas();
    
    // Game logic will be implemented in subsequent features
    
    animationId = requestAnimationFrame(gameLoop);
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars background
    drawStars();
}

function drawStars() {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pause-screen').classList.add('active');
        cancelAnimationFrame(animationId);
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pause-screen').classList.remove('active');
        gameLoop();
    }
}

function restartGame() {
    document.querySelectorAll('.screen.overlay').forEach(screen => {
        screen.classList.remove('active');
    });
    startGame();
}

function quitGame() {
    gameState = 'menu';
    cancelAnimationFrame(animationId);
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById('start-screen').classList.add('active');
}

function showHighScores() {
    document.getElementById('highscores-screen').classList.add('active');
    loadHighScores();
}

function closeHighScores() {
    document.getElementById('highscores-screen').classList.remove('active');
}

function showControls() {
    document.getElementById('controls-screen').classList.add('active');
}

function closeControls() {
    document.getElementById('controls-screen').classList.remove('active');
}

function loadHighScores() {
    fetch('/api/highscores')
        .then(response => response.json())
        .then(scores => {
            const listEl = document.getElementById('highscores-list');
            listEl.innerHTML = '';
            scores.forEach((score, index) => {
                const entry = document.createElement('div');
                entry.className = 'highscore-entry';
                entry.innerHTML = `
                    <span>${index + 1}. ${score.name}</span>
                    <span>${score.score.toLocaleString()}</span>
                `;
                listEl.appendChild(entry);
            });
        });
}

function submitScore() {
    const name = document.getElementById('player-name').value.toUpperCase() || 'AAA';
    // TODO: Submit score to backend
    console.log('Submitting score:', name, score);
    quitGame();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
});

// Initialize on load
window.addEventListener('load', init);