import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. THE GRID LAYER 
         This creates a refined 'graph paper' look using CSS gradients.
         It's much more performant than rendering 100s of divs.
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* 2. THE FOCUS VIGNETTE 
         This masks the grid so it fades out towards the bottom/edges, 
         drawing the eye to the center content.
      */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-indigo-500"></div>

      {/* 3. AMBIENT BACKGROUND GLOW (The "Aurora")
         A subtle, slow-moving gradient blob to add depth.
      */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
        <div 
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob bg-purple-300 dark:bg-purple-900/30"
        ></div>
        <div 
            className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 bg-cyan-300 dark:bg-cyan-900/30"
        ></div>
        <div 
            className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bg-pink-300 dark:bg-pink-900/30"
        ></div>
      </div>

      {/* 4. NOISE TEXTURE (Optional)
         Adds a tiny bit of film grain to prevent color banding on high-res screens.
      */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
};

export default AnimatedBackground;