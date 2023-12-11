class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type;
        this.speed = 2;
        this.collected = false;
        this.animationFrame = 0;
        this.setTypeProperties();
    }
    
    setTypeProperties() {
        switch(this.type) {
            case 'health':
                this.color = '#00ff00';
                this.icon = '+';
                this.effect = 'restore_health';
                break;
            case 'rapid_fire':
                this.color = '#ffff00';
                this.icon = '⚡';
                this.effect = 'rapid_fire';
                this.duration = 5000;
                break;
            case 'shield':
                this.color = '#00ffff';
                this.icon = '🛡';
                this.effect = 'shield';
                this.duration = 10000;
                break;
            case 'triple_shot':
                this.color = '#ff00ff';
                this.icon = '▲';
                this.effect = 'triple_shot';
                this.duration = 7000;
                break;
            case 'bomb':
                this.color = '#ff8800';
                this.icon = '💣';
                this.effect = 'clear_screen';
                break;
            case 'speed_boost':
                this.color = '#8888ff';
                this.icon = '»';
                this.effect = 'speed_boost';
                this.duration = 8000;
                break;
        }
    }
    
    update(canvas) {
        this.y += this.speed;
        this.animationFrame++;
        
        // Check if off screen
        if (this.y > canvas.height + 50) {
            this.collected = true;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Pulsing effect
        const scale = 1 + Math.sin(this.animationFrame * 0.1) * 0.2;
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(scale, scale);
        
        // Draw outer glow
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main body
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner circle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        ctx.restore();
    }
    
    applyEffect(player, enemyManager) {
        switch(this.effect) {
            case 'restore_health':
                return { type: 'health', value: 1 };
            case 'rapid_fire':
                player.shotCooldown = 50;
                setTimeout(() => {
                    player.shotCooldown = 200;
                }, this.duration);
                return { type: 'powerup', name: 'Rapid Fire', duration: this.duration };
            case 'shield':
                player.shield = true;
                setTimeout(() => {
                    player.shield = false;
                }, this.duration);
                return { type: 'powerup', name: 'Shield', duration: this.duration };
            case 'triple_shot':
                player.tripleShot = true;
                setTimeout(() => {
                    player.tripleShot = false;
                }, this.duration);
                return { type: 'powerup', name: 'Triple Shot', duration: this.duration };
            case 'clear_screen':
                // Destroy all enemies on screen
                enemyManager.enemies.forEach(enemy => {
                    enemy.destroyed = true;
                });
                return { type: 'bomb', value: enemyManager.enemies.length };
            case 'speed_boost':
                const originalSpeed = player.speed;
                player.speed = originalSpeed * 2;
                setTimeout(() => {
                    player.speed = originalSpeed;
                }, this.duration);
                return { type: 'powerup', name: 'Speed Boost', duration: this.duration };
        }
    }
}

class PowerUpManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.powerups = [];
        this.spawnTimer = 0;
        this.spawnInterval = 15000; // Spawn every 15 seconds
        this.lastSpawn = Date.now();
        this.activePowerups = [];
    }
    
    update(player, enemyManager) {
        const now = Date.now();
        
        // Spawn new powerup
        if (now - this.lastSpawn > this.spawnInterval) {
            this.spawnPowerUp();
            this.lastSpawn = now;
        }
        
        // Update existing powerups
        this.powerups = this.powerups.filter(powerup => {
            powerup.update(this.canvas);
            
            // Check collection
            if (this.checkCollision(powerup, player)) {
                const effect = powerup.applyEffect(player, enemyManager);
                this.handleEffect(effect);
                return false;
            }
            
            return !powerup.collected;
        });
        
        // Update active powerups display
        this.activePowerups = this.activePowerups.filter(p => p.endTime > now);
    }
    
    spawnPowerUp() {
        const types = ['health', 'rapid_fire', 'shield', 'triple_shot', 'bomb', 'speed_boost'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const y = -50;
        
        this.powerups.push(new PowerUp(x, y, type));
    }
    
    checkCollision(powerup, player) {
        return powerup.x < player.x + player.width &&
               powerup.x + powerup.width > player.x &&
               powerup.y < player.y + player.height &&
               powerup.y + powerup.height > player.y;
    }
    
    handleEffect(effect) {
        if (!effect) return;
        
        switch(effect.type) {
            case 'health':
                // Handle in game.js to update lives
                window.dispatchEvent(new CustomEvent('healthRestore', { detail: effect.value }));
                break;
            case 'powerup':
                this.activePowerups.push({
                    name: effect.name,
                    endTime: Date.now() + effect.duration
                });
                break;
            case 'bomb':
                window.dispatchEvent(new CustomEvent('bombUsed', { detail: effect.value }));
                break;
        }
    }
    
    draw(ctx) {
        // Draw powerups
        this.powerups.forEach(powerup => powerup.draw(ctx));
        
        // Draw active powerups indicator
        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Orbitron';
        ctx.textAlign = 'left';
        
        this.activePowerups.forEach((powerup, index) => {
            const timeLeft = Math.ceil((powerup.endTime - Date.now()) / 1000);
            ctx.fillText(`${powerup.name}: ${timeLeft}s`, 20, 100 + index * 20);
        });
        
        ctx.restore();
    }
    
    reset() {
        this.powerups = [];
        this.activePowerups = [];
        this.lastSpawn = Date.now();
    }
}