import React, { useRef, useEffect } from 'react';

const NeuralNetworkBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        type Particle = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
        };
        
        const particles: Particle[] = [];
        let numParticles = Math.floor((window.innerWidth * window.innerHeight) / 25000);
        if (numParticles > 150) numParticles = 150;

        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 1.5 + 1,
            });
        }
        
        const themeColors = {
            primary: 'rgba(0, 255, 255, 1)',
            secondary: 'rgba(147, 51, 234, 1)',
            accent: 'rgba(59, 130, 246, 1)',
        };
        const colors = [themeColors.primary, themeColors.secondary, themeColors.accent];
        const maxDistance = 180;
        const pullRadius = 250;
        const pullStrength = 0.03;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                const dxMouse = p.x - mouse.x;
                const dyMouse = p.y - mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < pullRadius) {
                    p.vx -= (dxMouse / distMouse) * pullStrength;
                    p.vy -= (dyMouse / distMouse) * pullStrength;
                }

                p.x += p.vx;
                p.y += p.vy;

                if (p.x > canvas.width + 5) p.x = -5;
                else if (p.x < -5) p.x = canvas.width + 5;
                if (p.y > canvas.height + 5) p.y = -5;
                else if (p.y < -5) p.y = canvas.height + 5;

                ctx.beginPath();
                const particleColor = colors[i % colors.length];
                ctx.fillStyle = particleColor;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        ctx.beginPath();
                        const opacity = 1 - distance / maxDistance;
                        const lineColor = colors[(i + j) % colors.length];
                        ctx.strokeStyle = lineColor.replace('1)', `${opacity * 0.5})`);

                        ctx.moveTo(p.x, p.y);
                        
                        const midX = (p.x + p2.x) / 2;
                        const midY = (p.y + p2.y) / 2;
                        const cpx = (midX + p.x) / 2;
                        const cpy = (midY + p.y) / 2;

                        ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
                        ctx.lineWidth = 0.75;
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -10,
                backgroundColor: '#0a0c1c',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    opacity: 0.35,
                }}
            />
        </div>
    );
};

export default NeuralNetworkBackground;
