import 'react';

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'sakuga-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};
