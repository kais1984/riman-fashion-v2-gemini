import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
        src?: string;
        poster?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        'interaction-prompt'?: string;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'exposure'?: string;
        'ar'?: boolean;
        'ar-modes'?: string;
        'loading'?: string;
        'interpolation-decay'?: string;
        'orbit-sensitivity'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
      };
    }
  }
}
