class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.setTypeProperties();
        this.bullets = [];
        this.lastShot = Date.now();
        this.animationFrame = 0;
        this.destroyed = false;
    }
    
    setTypeProperties() {
        switch(this.type) {
            case 'basic':
                this.width = 40;
                this.height = 40;
                this.speed = 2;
                this.health = 1;
                this.maxHealth = 1;
                this.points = 100;
                this.color = '#ff0000';
                this.shootCooldown = 2000;
                break;
            case 'fast':
                this.width = 30;
                this.height = 30;
                this.speed = 4;
                this.health = 1;
                this.maxHealth = 1;
                this.points = 150;
                this.color = '#ff8800';
                this.shootCooldown = 3000;
                break;
            case 'tank':
                this.width = 60;
                this.height = 60;
                this.speed = 1;
                this.health = 5;
                this.maxHealth = 5;
                this.points = 300;
                this.color = '#8800ff';
                this.shootCooldown = 1500;
                break;
            case 'boss':
                this.width = 120;
                this.height = 80;
                this.speed = 0.5;
                this.health = 20;
                this.maxHealth = 20;
                this.points = 1000;
                this.color = '#ff00ff';
                this.shootCooldown = 800;
                this.movementPattern = 'sine';
                this.movementTime = 0;
                break;
        }
    }
    
    update(canvas, playerX, playerY) {
        // Movement patterns
        if (this.type === 'boss' && this.movementPattern === 'sine') {
            this.movementTime += 0.02;
            this.x += Math.sin(this.movementTime) * 3;
            this.y += this.speed;
        } else if (this.type === 'fast') {
            // Zigzag movement
            this.x += Math.sin(this.y * 0.05) * 2;
            this.y += this.speed;
        } else {
            // Basic downward movement
            this.y += this.speed;
        }
        
        // Shooting
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown) {
            this.shoot(playerX, playerY);
            this.lastShot = now;
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < canvas.height + 10;
        });
        
        // Update animation
        this.animationFrame++;
    }
    
    shoot(playerX, playerY) {
        if (this.type === 'boss') {
            // Triple shot
            for (let i = -1; i <= 1; i++) {
                this.bullets.push({
                    x: this.x + this.width / 2 - 2,
                    y: this.y + this.height,
                    width: 4,
                    height: 10,
                    speed: 4,
                    angle: i * 0.3
                });
            }
        } else if (this.type === 'tank') {
            // Aimed shot
            const dx = playerX - (this.x + this.width / 2);
            const dy = playerY - (this.y + this.height / 2);
            const angle = Math.atan2(dy, dx);
            
            this.bullets.push({
                x: this.x + this.width / 2 - 3,
                y: this.y + this.height,
                width: 6,
                height: 12,
                speed: 3,
                speedX: Math.cos(angle) * 3,
                speedY: Math.sin(angle) * 3
            });
        } else {
            // Basic shot
            this.bullets.push({
                x: this.x + this.width / 2 - 2,
                y: this.y + this.height,
                width: 4,
                height: 8,
                speed: 5
            });
        }
    }
    
    draw(ctx) {
        // Draw enemy ship
        ctx.save();
        
        if (this.health < this.maxHealth) {
            // Flash when damaged
            if (Math.floor(this.animationFrame / 4) % 2) {
                ctx.globalAlpha = 0.7;
            }
        }
        
        ctx.fillStyle = this.color;
        
        if (this.type === 'boss') {
            // Boss design
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x, this.y + 20);
            ctx.lineTo(this.x + 20, this.y);
            ctx.lineTo(this.x + this.width - 20, this.y);
            ctx.lineTo(this.x + this.width, this.y + 20);
            ctx.closePath();
            ctx.fill();
            
            // Boss details
            ctx.fillStyle = '#ff0088';
            ctx.fillRect(this.x + 30, this.y + 20, 10, 20);
            ctx.fillRect(this.x + this.width - 40, this.y + 20, 10, 20);
            ctx.fillRect(this.x + this.width / 2 - 5, this.y + 25, 10, 15);
        } else {
            // Regular enemy design
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = this.type === 'tank' ? '#4400ff' : '#880000';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Health bar for tanks and bosses
        if (this.type === 'tank' || this.type === 'boss') {
            const barWidth = this.width * 0.8;
            const barHeight = 4;
            const barX = this.x + (this.width - barWidth) / 2;
            const barY = this.y - 10;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#00ff00';
            const healthPercent = this.health / this.maxHealth;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
        
        ctx.restore();
        
        // Draw bullets
        ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            if (bullet.speedX !== undefined) {
                bullet.x += bullet.speedX;
                bullet.y += bullet.speedY;
            } else if (bullet.angle !== undefined) {
                bullet.x += Math.sin(bullet.angle) * 2;
            }
            
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Bullet glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffff00';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            ctx.shadowBlur = 0;
        });
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroyed = true;
            return true;
        }
        return false;
    }
    
    isOffScreen(canvas) {
        return this.y > canvas.height + 100;
    }
}

class EnemyManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.enemies = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.lastSpawn = Date.now();
        this.waveNumber = 1;
        this.enemiesInWave = 5;
        this.enemiesSpawned = 0;
        this.bossSpawned = false;
    }
    
    update(player, difficulty, level) {
        const now = Date.now();
        
        // Adjust spawn rate based on difficulty
        let spawnMultiplier = 1;
        switch(difficulty) {
            case 'easy':
                spawnMultiplier = 1.5;
                break;
            case 'hard':
                spawnMultiplier = 0.7;
                break;
            case 'insane':
                spawnMultiplier = 0.5;
                break;
        }
        
        // Spawn enemies
        if (now - this.lastSpawn > this.spawnInterval * spawnMultiplier) {
            this.spawnEnemy(level);
            this.lastSpawn = now;
            this.enemiesSpawned++;
            
            // Check for wave completion
            if (this.enemiesSpawned >= this.enemiesInWave) {
                this.nextWave();
            }
        }
        
        // Spawn boss every 5 waves
        if (this.waveNumber % 5 === 0 && !this.bossSpawned && this.enemies.length === 0) {
            this.spawnBoss();
            this.bossSpawned = true;
        }
        
        // Update all enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(this.canvas, player.x + player.width / 2, player.y + player.height / 2);
            return !enemy.destroyed && !enemy.isOffScreen(this.canvas);
        });
    }
    
    spawnEnemy(level) {
        const types = ['basic'];
        if (level >= 2) types.push('fast');
        if (level >= 4) types.push('tank');
        
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const y = -60;
        
        this.enemies.push(new Enemy(x, y, type));
    }
    
    spawnBoss() {
        const x = this.canvas.width / 2 - 60;
        const y = -100;
        this.enemies.push(new Enemy(x, y, 'boss'));
    }
    
    nextWave() {
        this.waveNumber++;
        this.enemiesSpawned = 0;
        this.enemiesInWave = Math.min(5 + this.waveNumber, 15);
        this.spawnInterval = Math.max(2000 - this.waveNumber * 100, 800);
        
        if (this.waveNumber % 5 === 1) {
            this.bossSpawned = false;
        }
    }
    
    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
    
    reset() {
        this.enemies = [];
        this.waveNumber = 1;
        this.enemiesInWave = 5;
        this.enemiesSpawned = 0;
        this.bossSpawned = false;
        this.lastSpawn = Date.now();
    }
}