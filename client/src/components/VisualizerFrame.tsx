import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Code2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface VisualizerFrameProps {
  src: string;
  title: string;
  status?: 'available' | 'unavailable';
  aspectRatio?: 'video' | 'square' | 'tall';
  className?: string;
  showOpenNewTab?: boolean;
}

export const VisualizerFrame: React.FC<VisualizerFrameProps> = ({
  src,
  title,
  status = 'available',
  aspectRatio = 'video',
  className = '',
  showOpenNewTab = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleReload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      // Force iframe refresh
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 50);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  const aspectClass = {
    video: 'aspect-[16/9] min-h-[460px]',
    square: 'aspect-square min-h-[400px]',
    tall: 'min-h-[620px] h-[75vh]',
  }[aspectRatio];

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col rounded-2xl border border-[var(--border-strong)] bg-[#0d0d0f] shadow-2xl overflow-hidden transition-all ${
        isFullscreen ? 'h-screen w-screen rounded-none border-none p-0' : ''
      } ${className}`}
    >
      {/* Frame Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[#121214] px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Simulated Browser Dot Indicators */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="h-4 w-px bg-[var(--border-subtle)]" />

          {/* Title & Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-[var(--text-primary)]">
              {title}
            </span>
            {status === 'available' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={11} />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                <AlertCircle size={11} />
                Awaiting Code
              </span>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Reload / Restart */}
          <button
            onClick={handleReload}
            title="Reload Animation"
            aria-label="Reload Animation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[#1f1f23] hover:text-[var(--text-primary)] active:scale-95"
          >
            <RotateCcw size={15} />
          </button>

          {/* Open in new tab (hidden by default to protect code) */}
          {showOpenNewTab && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              title="Open HTML in new tab"
              aria-label="Open HTML in new tab"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[#1f1f23] hover:text-[var(--text-primary)] active:scale-95"
            >
              <ExternalLink size={15} />
            </a>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[#1f1f23] hover:text-[var(--text-primary)] active:scale-95"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Frame Body / Iframe Area */}
      <div className={`relative w-full flex-1 bg-[#09090b] ${isFullscreen ? 'h-[calc(100vh-48px)]' : aspectClass}`}>
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#09090b]/90 backdrop-blur-sm transition-opacity">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
            <span className="mt-3 text-xs font-medium text-[var(--text-muted)]">
              Loading visualizer runtime...
            </span>
          </div>
        )}

        {/* Sandboxed Iframe (strict origin isolation - no allow-same-origin) */}
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-forms allow-modals"
          loading="lazy"
          className="h-full w-full border-0 bg-transparent"
        />

        {/* Developer Guidance Banner when marked as unavailable */}
        {status === 'unavailable' && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-[#16120b]/90 p-3.5 backdrop-blur-md shadow-lg">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Code2 size={13} />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-amber-300">
                  Animation draft awaiting code
                </p>
                <p className="text-amber-200/70 mt-0.5">
                  Upload HTML animation file to Cloudflare R2 via Admin Panel or paste into code editor.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-[11px]">
              <span className="text-[var(--text-muted)]">
                Then set <code className="text-emerald-400 font-mono">status: 'Live'</code> to publish
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VisualizerFrame;
