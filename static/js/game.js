let canvas, ctx;
let gameState = 'menu';
let score = 0;
let lives = 3;
let level = 1;
let difficulty = 'normal';
let animationId;
let player;
let enemyManager;
let powerUpManager;
let stars = [];
let lastTime = 0;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize stars
    initStars();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startGame() {
    // Resume audio context on user interaction
    audioManager.resume();
    
    difficulty = document.getElementById('difficulty').value;
    gameState = 'playing';
    score = 0;
    lives = 3;
    level = 1;
    
    // Initialize game managers
    player = new Player(canvas);
    enemyManager = new EnemyManager(canvas);
    powerUpManager = new PowerUpManager(canvas);
    
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    updateUI();
    lastTime = performance.now();
    gameLoop();
}

function gameLoop(currentTime) {
    if (gameState !== 'playing') return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    clearCanvas();
    
    // Update game objects
    updateStars(deltaTime);
    player.update(deltaTime);
    enemyManager.update(player, difficulty, level);
    powerUpManager.update(player, enemyManager);
    particleManager.update();
    
    // Check collisions
    checkCollisions();
    
    // Draw everything
    drawStars();
    particleManager.draw(ctx);
    powerUpManager.draw(ctx);
    enemyManager.draw(ctx);
    player.draw(ctx);
    
    animationId = requestAnimationFrame(gameLoop);
}

function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.8 + 0.2
        });
    }
}

function updateStars(deltaTime) {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = -10;
            star.x = Math.random() * canvas.width;
        }
    });
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function checkCollisions() {
    // Player bullets vs enemies
    player.bullets.forEach((bullet, bulletIndex) => {
        enemyManager.enemies.forEach((enemy, enemyIndex) => {
            if (collision(bullet, enemy)) {
                if (enemy.takeDamage(bullet.damage)) {
                    score += enemy.points;
                    particleManager.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    audioManager.play('explosion');
                    updateUI();
                    
                    // Level up check
                    if (score >= level * 1000) {
                        level++;
                        updateUI();
                    }
                } else {
                    particleManager.createHit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    audioManager.play('enemyHit');
                }
                player.bullets.splice(bulletIndex, 1);
            }
        });
    });
    
    // Enemy bullets vs player
    enemyManager.enemies.forEach(enemy => {
        enemy.bullets.forEach((bullet, bulletIndex) => {
            if (collision(bullet, player)) {
                if (player.takeDamage()) {
                    lives--;
                    audioManager.play('playerHit');
                    updateUI();
                    if (lives <= 0) {
                        gameOver();
                    }
                }
                enemy.bullets.splice(bulletIndex, 1);
            }
        });
        
        // Enemy collision with player
        if (collision(enemy, player)) {
            if (player.takeDamage()) {
                lives--;
                enemy.takeDamage(enemy.maxHealth);
                updateUI();
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    });
}

function collision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function gameOver() {
    gameState = 'gameover';
    cancelAnimationFrame(animationId);
    document.getElementById('final-score').textContent = score;
    document.getElementById('gameover-screen').classList.add('active');
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
    if (player) player.reset();
    if (enemyManager) enemyManager.reset();
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
                    <span class="score-details">
                        ${score.score.toLocaleString()} 
                        <small>(Lv.${score.level || 1} ${score.difficulty || 'normal'})</small>
                    </span>
                `;
                listEl.appendChild(entry);
            });
        });
}

function submitScore() {
    const name = document.getElementById('player-name').value.toUpperCase() || 'AAA';
    
    fetch('/api/highscores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            score: score,
            level: level,
            difficulty: difficulty
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`Score submitted! Rank: ${data.rank}`);
        }
    })
    .catch(error => {
        console.error('Error submitting score:', error);
    });
    
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

// Event listeners for powerups
window.addEventListener('healthRestore', (e) => {
    lives = Math.min(lives + e.detail, 5);
    audioManager.play('powerup');
    updateUI();
});

window.addEventListener('bombUsed', (e) => {
    score += e.detail * 50;
    audioManager.play('explosion');
    updateUI();
});

// Initialize on load
window.addEventListener('load', init);