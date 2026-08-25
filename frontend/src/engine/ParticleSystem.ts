// Lightweight particle emitter for hit/dodge/block effects

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity: number;
  decay: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number;

  constructor(maxParticles: number = 200) {
    this.maxParticles = maxParticles;
  }

  /**
   * Emit a burst of hit particles (colored pixels scattering outward)
   */
  emitHitBurst(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 4,
        color,
        life: 1,
        maxLife: 1,
        gravity: 0.15,
        decay: 0.02 + Math.random() * 0.02,
      });
    }
  }

  /**
   * Emit dodge dust puff
   */
  emitDodgePuff(x: number, y: number, direction: number): void {
    const color = 'rgba(200, 200, 255, 0.6)';
    for (let i = 0; i < 12; i++) {
      const angle = (direction > 0 ? Math.PI * 0.8 : Math.PI * 0.2) + (Math.random() - 0.5) * 1.2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed * -direction,
        vy: Math.sin(angle) * speed - 1,
        size: 3 + Math.random() * 5,
        color,
        life: 1,
        maxLife: 1,
        gravity: -0.02,
        decay: 0.03,
      });
    }
  }

  /**
   * Emit block sparks
   */
  emitBlockSparks(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2,
        color: `hsl(${40 + Math.random() * 20}, 100%, ${60 + Math.random() * 30}%)`,
        life: 1,
        maxLife: 1,
        gravity: 0.1,
        decay: 0.04,
      });
    }
  }

  /**
   * Emit KO explosion
   */
  emitKOExplosion(x: number, y: number, color: string): void {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 2 + Math.random() * 6,
        color: i % 3 === 0 ? '#ffffff' : color,
        life: 1,
        maxLife: 1,
        gravity: 0.08,
        decay: 0.012 + Math.random() * 0.01,
      });
    }
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    const dt = deltaTime * 60; // normalize to ~60fps
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= p.decay * dt;
      p.size *= 0.98;

      if (p.life <= 0 || p.size < 0.5) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Draw all particles on canvas
   */
  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(
        Math.floor(p.x - p.size / 2),
        Math.floor(p.y - p.size / 2),
        Math.ceil(p.size),
        Math.ceil(p.size)
      );
      ctx.restore();
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
  }

  get count(): number {
    return this.particles.length;
  }
}
