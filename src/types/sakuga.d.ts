import 'react';

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLElement> & { label?: string }, HTMLElement>;
      'sakuga-checkbox': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLElement> & { label?: string }, HTMLElement>;
      'sakuga-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { text?: string }, HTMLElement>;
      'sakuga-input': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLElement> & { label?: string }, HTMLElement>;
      'sakuga-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { label?: string; value?: number; doneLabel?: string }, HTMLElement>;
    }
  }
}

export {};

