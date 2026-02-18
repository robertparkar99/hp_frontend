declare module 'shepherd.js' {
  export class Tour {
    constructor(options?: TourOptions);
    addStep(step: Step): this;
    start(): void;
    next(): void;
    back(): void;
    cancel(): void;
    complete(): void;
    show(stepId?: string): void;
    hide(): void;
    getCurrentStep(): Step | null;
    on(event: string, callback: (e: any) => void): void;
    steps: Step[];
  }

  interface Step {
    id: string;
    title?: string;
    text: string;
    attachTo?: {
      element: string;
      on: string;
    };
    buttons?: StepButton[];
    beforeShowPromise?: () => Promise<void>;
    when?: {
      show?: () => void;
      hide?: () => void;
    };
    pageUrl?: string;
    advanceOn?: {
      selector: string;
      event: string;
    };
  }

  interface StepButton {
    text: string;
    action: () => void;
    classes?: string;
  }

  interface TourOptions {
    defaultStepOptions?: {
      cancelIcon?: {
        enabled: boolean;
      };
      classes?: string;
      scrollTo?: {
        behavior: string;
        block: string;
      };
      modalOverlayOpeningPadding?: number;
      modalOverlayOpeningRadius?: number;
    };
    useModalOverlay?: boolean;
    exitOnEsc?: boolean;
    keyboardNavigation?: boolean;
  }

  const Shepherd: {
    Tour: typeof Tour;
  };
  export default Shepherd;
}

declare namespace Shepherd {
  class Tour {
    constructor(options?: TourOptions);
    addStep(step: Step): this;
    start(): void;
    next(): void;
    back(): void;
    cancel(): void;
    complete(): void;
    show(stepId?: string): void;
    hide(): void;
    getCurrentStep(): Step | null;
    on(event: string, callback: (e: any) => void): void;
    steps: Step[];
  }

  interface Step {
    id: string;
    title?: string;
    text: string;
    attachTo?: {
      element: string;
      on: string;
    };
    buttons?: StepButton[];
    beforeShowPromise?: () => Promise<void>;
    when?: {
      show?: () => void;
      hide?: () => void;
    };
    pageUrl?: string;
    advanceOn?: {
      selector: string;
      event: string;
    };
  }

  interface StepButton {
    text: string;
    action: () => void;
    classes?: string;
  }

  interface TourOptions {
    defaultStepOptions?: {
      cancelIcon?: {
        enabled: boolean;
      };
      classes?: string;
      scrollTo?: {
        behavior: string;
        block: string;
      };
      modalOverlayOpeningPadding?: number;
      modalOverlayOpeningRadius?: number;
    };
    useModalOverlay?: boolean;
    exitOnEsc?: boolean;
    keyboardNavigation?: boolean;
  }
}
