import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full bg-[var(--bg-base)]">
      <div 
        className="absolute inset-0 bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15]"
      />
    </div>
  );
};

export default AnimatedBackground;
