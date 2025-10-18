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
            primary: 'rgba(0, 255, 255, 1)', // Cyan
            secondary: 'rgba(255, 0, 255, 1)', // Magenta
            accent: 'rgba(207, 255, 4, 1)', // Lime
        };
        const colors = [themeColors.primary, themeColors.secondary, themeColors.accent];
        const maxDistance = 180;
        const repelRadius = 250;
        const repelStrength = 0.05;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                // Mouse repel effect
                const dxMouse = p.x - mouse.x;
                const dyMouse = p.y - mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < repelRadius) {
                    const forceDirectionX = dxMouse / distMouse;
                    const forceDirectionY = dyMouse / distMouse;
                    const force = (repelRadius - distMouse) / repelRadius;
                    p.vx += forceDirectionX * force * repelStrength;
                    p.vy += forceDirectionY * force * repelStrength;
                }

                // Apply velocity and friction
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Screen boundaries
                if (p.x > canvas.width + 5) p.x = -5;
                else if (p.x < -5) p.x = canvas.width + 5;
                if (p.y > canvas.height + 5) p.y = -5;
                else if (p.y < -5) p.y = canvas.height + 5;

                // Draw particle (optional, can be very small/subtle)
                ctx.beginPath();
                const particleColor = colors[i % colors.length];
                ctx.fillStyle = particleColor;
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                // Draw connections (threads)
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        ctx.beginPath();
                        const opacity = 1 - distance / maxDistance;
                        const lineColor = colors[(i + j) % colors.length];
                        
                        // Glow effect
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = lineColor;
                        
                        ctx.strokeStyle = lineColor.replace('1)', `${opacity * 0.5})`);
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                        
                        // Reset shadow for next elements
                        ctx.shadowBlur = 0;
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
                backgroundColor: '#000814',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    opacity: 0.5,
                }}
            />
        </div>
    );
};

export default NeuralNetworkBackground;