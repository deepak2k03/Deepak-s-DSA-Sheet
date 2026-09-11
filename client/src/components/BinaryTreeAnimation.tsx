import React, { useState, useEffect } from 'react';
import { GitCommit } from 'lucide-react';

const BinaryTreeAnimation: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 7); // 0, 1, 2, 3, 4, 5, 6(hold)
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const getParticlePos = (s: number) => {
    if (s === 0) return { x: 200, y: 80 };
    if (s === 1) return { x: 100, y: 160 };
    if (s === 2) return { x: 150, y: 240 };
    if (s >= 3) return { x: 190, y: 320 };
    return { x: 200, y: 80 };
  };

  const { x: pX, y: pY } = getParticlePos(step);

  const getOverlayText = (s: number) => {
    if (s === 0) return <><span className="text-white">insert(18)</span>: 18 &lt; 20, <span className="text-emerald-400">go left</span></>;
    if (s === 1) return <>18 &gt; 10, <span className="text-emerald-400">go right</span></>;
    if (s === 2) return <>18 &gt; 15, <span className="text-emerald-400">go right</span></>;
    if (s === 3) return <><span className="text-emerald-400">Found empty spot</span></>;
    if (s >= 4) return <><span className="text-emerald-400 font-bold">Node(18) inserted</span></>;
    return "";
  };

  const nodes = [
    { val: 20, x: 200, y: 80 },
    { val: 10, x: 100, y: 160 },
    { val: 30, x: 300, y: 160 },
    { val: 5, x: 50, y: 240 },
    { val: 15, x: 150, y: 240 },
    { val: 25, x: 250, y: 240 },
  ];

  const edges = [
    { x1: 200, y1: 80, x2: 100, y2: 160 },
    { x1: 200, y1: 80, x2: 300, y2: 160 },
    { x1: 100, y1: 160, x2: 50, y2: 240 },
    { x1: 100, y1: 160, x2: 150, y2: 240 },
    { x1: 300, y1: 160, x2: 250, y2: 240 },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#050505]">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Header Tag */}
      <div className="absolute top-4 left-5 text-xs font-mono font-medium text-[var(--text-muted)] flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md z-30">
        <GitCommit size={14} className="text-emerald-500" />
        <span className="text-emerald-400/80">Binary Search Tree</span>
      </div>

      <div className="relative w-full max-w-[400px] h-full mt-4">
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full z-10 overflow-visible">
          {edges.map((e, i) => (
            <line 
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} 
              stroke="#334155" strokeWidth="2" 
            />
          ))}
          
          {/* New Edge (15 to 18) */}
          <line 
            x1="150" y1="240" x2="190" y2="320" 
            stroke="#34d399" strokeWidth="2.5" 
            strokeDasharray="100"
            strokeDashoffset={step >= 4 ? 0 : 100}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* DOM Nodes Layer */}
        {nodes.map(n => {
           // Highlight nodes that have been visited
           const isVisited = 
              (n.val === 20 && step >= 0) || 
              (n.val === 10 && step >= 1) || 
              (n.val === 15 && step >= 2);
              
           return (
             <div 
               key={n.val}
               className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono font-bold border-2 transition-colors duration-500 z-20 ${
                 isVisited 
                   ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)]' 
                   : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
               }`}
               style={{ left: n.x, top: n.y }}
             >
               {n.val}
             </div>
           );
        })}

        {/* New Node (18) */}
        <div 
          className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono font-bold border-2 border-emerald-400 bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all duration-500 z-20 ${
            step >= 4 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`} 
          style={{ left: 190, top: 320 }}
        >
          18
        </div>

        {/* Moving Particle Ring */}
        <div 
          className={`absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)] z-30 transition-all duration-700 ease-in-out ${
            step === 6 ? 'opacity-0 scale-150 duration-500' : 'opacity-100 scale-100'
          }`}
          style={{ left: pX, top: pY }}
        ></div>

      </div>

      {/* Code description overlay */}
      <div className="absolute right-6 bottom-6 z-30 flex items-center justify-end">
        <div className="rounded-lg border border-white/10 bg-black/60 px-4 py-2 font-mono text-sm text-[var(--text-secondary)] backdrop-blur-md">
          {getOverlayText(step)}
        </div>
      </div>

      {/* Progress Steps (Bottom) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-6 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'w-2 bg-white/10'}`}></div>
        ))}
      </div>
      
    </div>
  );
};

export default BinaryTreeAnimation;
