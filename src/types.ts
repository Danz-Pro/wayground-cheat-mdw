export interface Vue3Element extends HTMLElement {
  __vue_app__: any;
  __vueParentComponent?: any;
}

export interface Vue2Element extends HTMLElement {
  __vue__: any;
}

interface QuizQuestionOption {
  text: string;
  answer?: number;
  type?: string;
}

export interface QuizQuestion {
  _id: string;
  type: string;
  structure: {
    answer: number | number[];
    options?: QuizQuestionOption[];
    query?: {
      text: string;
      answer: number;
      media?: any[];
      hasMath?: boolean;
    };
  };
}

export interface QuizInfo {
  data: {
    questions: QuizQuestion[];
  }
}
