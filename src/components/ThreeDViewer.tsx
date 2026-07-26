import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, RotateCcw, Box, Loader2, AlertTriangle } from 'lucide-react';

interface ThreeDViewerProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ src, poster, alt, className }) => {
  const modelRef = useRef<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;

    const onProgress = (event: any) => {
      setLoadingProgress(event.detail.totalProgress * 100);
    };

    const onLoad = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    const onError = (event: any) => {
      const detail = event.detail;
      const msg = detail?.message || detail?.type || 'Unknown error loading 3D model';
      setErrorMessage(msg);
      setHasError(true);
      setIsLoaded(false);
    };

    model.addEventListener('progress', onProgress);
    model.addEventListener('load', onLoad);
    model.addEventListener('error', onError);

    return () => {
      model.removeEventListener('progress', onProgress);
      model.removeEventListener('load', onLoad);
      model.removeEventListener('error', onError);
    };
  }, []);

  const handleReset = () => {
    if (modelRef.current) {
      modelRef.current.cameraOrbit = '0deg 75deg 105%';
      modelRef.current.fieldOfView = 'auto';
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
    setIsLoaded(false);
    setLoadingProgress(0);
    // Force re-load by re-setting src
    if (modelRef.current) {
      modelRef.current.src = '';
      setTimeout(() => {
        if (modelRef.current) modelRef.current.src = src;
      }, 100);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full bg-stone-50 overflow-hidden"
      >
        <div className="w-full h-full">
          {/* @ts-ignore */}
          <model-viewer
            ref={modelRef}
            src={src}
            poster={poster}
            alt={alt || "3D model of a luxury gown"}
            auto-rotate
            camera-controls
            touch-action="none"
            interaction-prompt="auto"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1.2"
            ar
            ar-modes="webxr scene-viewer quick-look"
            loading="lazy"
            interpolation-decay="100"
            orbit-sensitivity="0.8"
            min-camera-orbit="auto auto 5%"
            max-camera-orbit="auto auto 200%"
            className="w-full h-full border border-gold/20"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          >
            {/* Custom Progress Bar */}
            <div slot="progress-bar" className="hidden" />
            
            <AnimatePresence>
              {!isLoaded && !hasError && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-50/80 backdrop-blur-[2px]"
                >
                  <div className="relative flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
                    <div className="w-48 h-[2px] bg-stone-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${loadingProgress}%` }}
                        className="h-full bg-gold"
                      />
                    </div>
                    <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">
                      Loading detail {Math.round(loadingProgress)}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {hasError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-50 p-8"
                >
                  <div className="relative flex flex-col items-center text-center max-w-xs">
                    <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-rose-400" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700 mb-2">3D viewer unavailable</p>
                    <p className="text-[11px] text-stone-400 leading-relaxed mb-4">
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="btn-luxury !py-2 !px-6 text-[10px]"
                    >
                      Retry
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-stone-100">
            {poster ? (
              <img src={poster} alt={alt || '3D model poster'} className="w-full h-full object-cover opacity-50" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Box className="w-8 h-8 text-gold/30 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">Initializing 3D Detail</span>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleReset}
              className="p-3 bg-ivory/80 backdrop-blur border border-stone-100 hover:bg-gold hover:text-white transition-all rounded-full"
              title="Reset View"
              aria-label="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              className="p-3 bg-ivory/80 backdrop-blur border border-stone-100 hover:bg-gold hover:text-white transition-all rounded-full"
              title="View in AR"
              aria-label="View in augmented reality"
              onClick={() => modelRef.current?.activateAR()}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 bg-gold/10 backdrop-blur-sm border border-gold/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">3D Perspective</span>
            </div>
          </div>
        </model-viewer>
        </div>
      </motion.div>
    </div>
  );
};

export default ThreeDViewer;
