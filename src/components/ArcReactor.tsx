import React, { useEffect, useRef } from 'react';

interface ArcReactorProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  onClick?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({ status, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Color scheme based on status
      let primaryColor = '#00f0ff'; // cyan
      let glowColor = 'rgba(0, 240, 255, 0.4)';
      let speed = 0.015;

      if (status === 'listening') {
        primaryColor = '#ec4899'; // magenta / neon pink
        glowColor = 'rgba(236, 72, 153, 0.5)';
        speed = 0.04;
      } else if (status === 'speaking') {
        primaryColor = '#10b981'; // emerald green
        glowColor = 'rgba(16, 185, 129, 0.5)';
        speed = 0.035;
      } else if (status === 'processing') {
        primaryColor = '#f59e0b'; // amber
        glowColor = 'rgba(245, 158, 11, 0.5)';
        speed = 0.06;
      } else if (status === 'error') {
        primaryColor = '#ef4444'; // red
        glowColor = 'rgba(239, 68, 68, 0.5)';
        speed = 0.01;
      }

      angle += speed;
      waveOffset += 0.05;

      // Outer segmented rotating ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = glowColor;

      const segments = 12;
      const radiusOuter = 52;
      for (let i = 0; i < segments; i++) {
        const segAngle = (Math.PI * 2 / segments) * i;
        ctx.beginPath();
        ctx.arc(0, 0, radiusOuter, segAngle, segAngle + (Math.PI / segments) * 0.7);
        ctx.stroke();
      }
      ctx.restore();

      // Middle counter-rotating dashed ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-angle * 1.5);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Waveform circle inside
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.beginPath();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      const wavePoints = 40;
      const baseR = 26;
      const amp = (status === 'speaking' || status === 'listening') ? 7 : status === 'processing' ? 4 : 2;

      for (let i = 0; i <= wavePoints; i++) {
        const theta = (Math.PI * 2 / wavePoints) * i;
        const wave = Math.sin(theta * 6 + waveOffset) * amp;
        const r = baseR + wave;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Glowing Core
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, primaryColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]);

  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return <span className="text-pink-400 animate-pulse font-mono font-bold tracking-wider">● LISTENING</span>;
      case 'speaking':
        return <span className="text-emerald-400 animate-pulse font-mono font-bold tracking-wider">▲ SPEAKING</span>;
      case 'processing':
        return <span className="text-amber-400 animate-pulse font-mono font-bold tracking-wider">◆ THINKING</span>;
      case 'error':
        return <span className="text-rose-500 font-mono font-bold tracking-wider">✕ ALERT</span>;
      default:
        return <span className="text-cyan-400 font-mono tracking-wider">◈ REZA READY</span>;
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center cursor-pointer select-none group"
      onClick={onClick}
      title="Click to toggle voice listening"
    >
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Holographic background pulse ring */}
        <div className={`absolute inset-0 rounded-full border border-cyan-500/20 group-hover:border-cyan-400/50 transition-all duration-500 ${
          status === 'listening' ? 'animate-ping border-pink-500/30' : ''
        }`} />
        <canvas 
          ref={canvasRef} 
          width={128} 
          height={128} 
          className="relative z-10 drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]"
        />
      </div>
      <div className="mt-1 px-3 py-0.5 rounded-full bg-[#08121f] border border-cyan-900/60 text-xs">
        {getStatusBadge()}
      </div>
    </div>
  );
};
