class Particle {
    constructor(x, y, type = 'explosion') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.setTypeProperties();
        this.life = this.maxLife;
    }
    
    setTypeProperties() {
        switch(this.type) {
            case 'explosion':
                this.velocityX = (Math.random() - 0.5) * 8;
                this.velocityY = (Math.random() - 0.5) * 8;
                this.size = Math.random() * 3 + 1;
                this.color = `hsl(${Math.random() * 60}, 100%, 50%)`;
                this.maxLife = 30;
                this.decay = 1;
                break;
            case 'star':
                this.velocityX = (Math.random() - 0.5) * 2;
                this.velocityY = Math.random() * 2 + 1;
                this.size = Math.random() * 2 + 1;
                this.color = '#ffffff';
                this.maxLife = 60;
                this.decay = 1;
                break;
            case 'smoke':
                this.velocityX = (Math.random() - 0.5) * 1;
                this.velocityY = -Math.random() * 2;
                this.size = Math.random() * 15 + 5;
                this.color = '#888888';
                this.maxLife = 40;
                this.decay = 1;
                break;
            case 'spark':
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                this.velocityX = Math.cos(angle) * speed;
                this.velocityY = Math.sin(angle) * speed;
                this.size = 2;
                this.color = '#ffff00';
                this.maxLife = 20;
                this.decay = 2;
                this.trail = [];
                break;
        }
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life -= this.decay;
        
        // Apply gravity to some particles
        if (this.type === 'explosion' || this.type === 'spark') {
            this.velocityY += 0.2;
        }
        
        // Slow down over time
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        
        // Store trail for sparks
        if (this.type === 'spark' && this.trail) {
            this.trail.push({x: this.x, y: this.y});
            if (this.trail.length > 5) {
                this.trail.shift();
            }
        }
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        
        if (this.type === 'spark' && this.trail) {
            // Draw trail
            ctx.strokeStyle = this.color;
            this.trail.forEach((point, index) => {
                ctx.globalAlpha = alpha * (index / this.trail.length) * 0.5;
                ctx.beginPath();
                if (index > 0) {
                    ctx.moveTo(this.trail[index - 1].x, this.trail[index - 1].y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                }
            });
        }
        
        ctx.globalAlpha = alpha;
        
        if (this.type === 'smoke') {
            // Draw smoke with gradient
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, `rgba(136, 136, 136, ${alpha})`);
            gradient.addColorStop(1, `rgba(136, 136, 136, 0)`);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

class ParticleManager {
    constructor() {
        this.particles = [];
    }
    
    createExplosion(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, 'explosion'));
            if (Math.random() > 0.5) {
                this.particles.push(new Particle(x, y, 'spark'));
            }
        }
        
        // Add smoke particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.particles.push(new Particle(x, y, 'smoke'));
            }, i * 50);
        }
    }
    
    createStarfield(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x + (Math.random() - 0.5) * 50, y, 'star'));
        }
    }
    
    createHit(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, 'spark'));
        }
    }
    
    update() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return !particle.isDead();
        });
    }
    
    draw(ctx) {
        // Draw particles with additive blending for glow effect
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach(particle => particle.draw(ctx));
        ctx.restore();
    }
    
    reset() {
        this.particles = [];
    }
}

// Global particle manager
const particleManager = new ParticleManager();