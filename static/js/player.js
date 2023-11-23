class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 50;
        this.speed = 5;
        this.bullets = [];
        this.lastShot = 0;
        this.shotCooldown = 200;
        this.specialPower = 0;
        this.maxSpecialPower = 100;
        this.isInvulnerable = false;
        this.invulnerableTime = 0;
        
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false,
            shift: false
        };
        
        this.setupControls();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        switch(e.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                this.keys.left = true;
                break;
            case 'arrowright':
            case 'd':
                this.keys.right = true;
                break;
            case 'arrowup':
            case 'w':
                this.keys.up = true;
                break;
            case 'arrowdown':
            case 's':
                this.keys.down = true;
                break;
            case ' ':
                e.preventDefault();
                this.keys.space = true;
                break;
            case 'shift':
                e.preventDefault();
                this.keys.shift = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                this.keys.left = false;
                break;
            case 'arrowright':
            case 'd':
                this.keys.right = false;
                break;
            case 'arrowup':
            case 'w':
                this.keys.up = false;
                break;
            case 'arrowdown':
            case 's':
                this.keys.down = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
            case 'shift':
                this.keys.shift = false;
                break;
        }
    }
    
    update(deltaTime) {
        // Movement
        let actualSpeed = this.speed;
        if (this.keys.shift && this.specialPower > 0) {
            actualSpeed *= 1.5;
            this.specialPower -= 0.5;
        }
        
        if (this.keys.left && this.x > 0) {
            this.x -= actualSpeed;
        }
        if (this.keys.right && this.x < this.canvas.width - this.width) {
            this.x += actualSpeed;
        }
        if (this.keys.up && this.y > this.canvas.height * 0.5) {
            this.y -= actualSpeed;
        }
        if (this.keys.down && this.y < this.canvas.height - this.height - 20) {
            this.y += actualSpeed;
        }
        
        // Shooting
        const now = Date.now();
        if (this.keys.space && now - this.lastShot > this.shotCooldown) {
            this.shoot();
            this.lastShot = now;
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -10;
        });
        
        // Recharge special power
        if (this.specialPower < this.maxSpecialPower) {
            this.specialPower += 0.1;
        }
        
        // Update invulnerability
        if (this.isInvulnerable) {
            this.invulnerableTime--;
            if (this.invulnerableTime <= 0) {
                this.isInvulnerable = false;
            }
        }
        
        updatePowerBar(this.specialPower);
    }
    
    shoot() {
        this.bullets.push({
            x: this.x + this.width / 2 - 2,
            y: this.y,
            width: 4,
            height: 15,
            speed: 12,
            damage: 1
        });
        
        if (this.specialPower >= 20) {
            // Triple shot when power is sufficient
            this.bullets.push({
                x: this.x + 10,
                y: this.y + 10,
                width: 4,
                height: 15,
                speed: 12,
                damage: 1
            });
            this.bullets.push({
                x: this.x + this.width - 14,
                y: this.y + 10,
                width: 4,
                height: 15,
                speed: 12,
                damage: 1
            });
            this.specialPower -= 10;
        }
    }
    
    specialAttack() {
        if (this.specialPower >= 50) {
            // Create wave attack
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                this.bullets.push({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    width: 6,
                    height: 6,
                    speedX: Math.cos(angle) * 8,
                    speedY: Math.sin(angle) * 8,
                    speed: 0,
                    damage: 2,
                    special: true
                });
            }
            this.specialPower = 0;
        }
    }
    
    draw(ctx) {
        // Draw spaceship
        ctx.save();
        
        if (this.isInvulnerable && Math.floor(this.invulnerableTime / 4) % 2) {
            ctx.globalAlpha = 0.3;
        }
        
        // Ship body
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 15);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#0080ff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Engine flames
        if (this.keys.up || this.keys.down || this.keys.left || this.keys.right) {
            ctx.fillStyle = '#ff8800';
            const flameSize = Math.random() * 10 + 5;
            ctx.beginPath();
            ctx.moveTo(this.x + 15, this.y + this.height);
            ctx.lineTo(this.x + 20, this.y + this.height + flameSize);
            ctx.lineTo(this.x + 25, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(this.x + 35, this.y + this.height);
            ctx.lineTo(this.x + 40, this.y + this.height + flameSize);
            ctx.lineTo(this.x + 45, this.y + this.height);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        
        // Draw bullets
        ctx.fillStyle = '#00ff00';
        this.bullets.forEach(bullet => {
            if (bullet.special) {
                ctx.fillStyle = '#ff00ff';
                bullet.x += bullet.speedX || 0;
                bullet.y += bullet.speedY || 0;
            }
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Bullet glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = bullet.special ? '#ff00ff' : '#00ff00';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            ctx.shadowBlur = 0;
        });
    }
    
    takeDamage() {
        if (!this.isInvulnerable) {
            this.isInvulnerable = true;
            this.invulnerableTime = 120; // 2 seconds at 60fps
            return true;
        }
        return false;
    }
    
    reset() {
        this.x = this.canvas.width / 2 - this.width / 2;
        this.y = this.canvas.height - this.height - 50;
        this.bullets = [];
        this.specialPower = 50;
        this.isInvulnerable = false;
    }
}