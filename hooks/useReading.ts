import { useState, useCallback } from 'react';
import type { ReadingText, ReadingQuestion, OptionLetter, AnswerState } from '@/types';

export const MOCK_READING_TEXTS: ReadingText[] = [
  {
    id: 'rt1',
    topic_id: 't9',
    title_kz: 'Ана тілі — жан азығы',
    author_kz: 'Абай Құнанбаев',
    body_kz:
      'Тіл — халықтың жаны. Қазақ тілі — бай, икемді, сарқылмас мұхит. ' +
      'Ол жүздеген жылдар бойы ата-бабаларымыздың даналығын, жасампаздығын ' +
      'жеткізіп келеді. Тілімізді білу — өз халқыңды, тарихыңды, ' +
      'мәдениетіңді білу деген сөз.\n\n' +
      'Қазақ тілінің дыбыстық жүйесі ерекше. Жуан және жіңішке дауысты ' +
      'дыбыстар сингармонизм заңына бағынады — сөздің барлық буындарында ' +
      'бір топтың дауыстылары қолданылады. Бұл — тілімізге тән табиғи ' +
      'үйлесімділік.\n\n' +
      'Ана тіліңді сыйла, өйткені ол — сенің жаныңның айнасы.',
  },
  {
    id: 'rt2',
    topic_id: 't10',
    title_kz: 'Сөз — ойдың киімі',
    body_kz:
      'Қазақ тілінде сөз таптары тілдің грамматикалық негізін құрайды. ' +
      'Зат есім, сын есім, етістік, үстеу — осы таптардың әрқайсысы ' +
      'тілде өз орнын алып, мағынаны дәл жеткізуге қызмет етеді.\n\n' +
      'Зат есім — заттың атын білдіреді. «Дала», «бала», «ана» — ' +
      'бұлардың барлығы зат есім. Сын есім заттың сапасын сипаттайды: ' +
      '«биік тау», «кең дала». Етістік іс-қимылды білдіреді: ' +
      '«оқыды», «жазды», «ойланды».\n\n' +
      'Тілдің байлығы — сөз таптарының молдығында.',
  },
  {
    id: 'rt3',
    topic_id: 't11',
    title_kz: 'Сөйлем — ойдың аяқталған бөлшегі',
    body_kz:
      'Сөйлем — бір немесе бірнеше сөзден тұратын, аяқталған ой ' +
      'білдіретін тілдік бірлік. Сөйлемде бастауыш пен баяндауыш ' +
      'негізгі мүшелер болып саналады.\n\n' +
      'Жай сөйлем бір ғана ойды жеткізеді. Мысалы: «Күн жарық.» ' +
      'Құрмалас сөйлем екі немесе одан да көп жай сөйлемнен тұрады. ' +
      'Салалас құрмалас сөйлемде жай сөйлемдер тең дәрежеде байланысады, ' +
      'ал сабақтас құрмаласта бір сөйлем екіншісіне бағынышты болады.\n\n' +
      'Сөйлемнің мазмұны мен мақсатын дұрыс ажырату — тілді ' +
      'жетік меңгерудің белгісі.',
  },
];

export const MOCK_READING_QUESTIONS: Record<string, ReadingQuestion[]> = {
  rt1: [
    {
      id: 'rq1',
      text_id: 'rt1',
      question_kz: 'Мәтінде тіл нені білдіреді деп айтылған?',
      option_a: 'Халықтың жаны',
      option_b: 'Тарихтың айнасы',
      option_c: 'Жердің байлығы',
      option_d: 'Болашақтың кілті',
      correct_option: 'A',
    },
    {
      id: 'rq2',
      text_id: 'rt1',
      question_kz: 'Сингармонизм заңы нені білдіреді?',
      option_a: 'Сөздер ырғаққа сай жазылады',
      option_b: 'Барлық буындарда бір топтың дауыстылары қолданылады',
      option_c: 'Дауыссыздар ерін үндестігіне бағынады',
      option_d: 'Жіңішке дыбыстар жуан дыбыстарды алмастырады',
      correct_option: 'B',
    },
    {
      id: 'rq3',
      text_id: 'rt1',
      question_kz: 'Мәтіннің негізгі идеясы қандай?',
      option_a: 'Қазақ тілін үйрену қиын',
      option_b: 'Ана тілі — жан мен мәдениеттің айнасы',
      option_c: 'Тіл тек байланыс құралы',
      option_d: 'Дыбыс жүйесі ең маңызды',
      correct_option: 'B',
    },
    {
      id: 'rq4',
      text_id: 'rt1',
      question_kz: 'Автор бойынша ана тілін білу нені білдіреді?',
      option_a: 'Тек сөйлей алуды',
      option_b: 'Өз халқың, тарихың, мәдениетіңді білуді',
      option_c: 'Грамматиканы меңгеруді',
      option_d: 'Жазу дағдысын дамытуды',
      correct_option: 'B',
    },
  ],
  rt2: [
    {
      id: 'rq5',
      text_id: 'rt2',
      question_kz: '«Дала», «бала», «ана» сөздері қандай сөз табына жатады?',
      option_a: 'Сын есім',
      option_b: 'Үстеу',
      option_c: 'Зат есім',
      option_d: 'Етістік',
      correct_option: 'C',
    },
    {
      id: 'rq6',
      text_id: 'rt2',
      question_kz: 'Сын есім нені білдіреді?',
      option_a: 'Іс-қимылды',
      option_b: 'Заттың атын',
      option_c: 'Заттың санын',
      option_d: 'Заттың сапасын',
      correct_option: 'D',
    },
    {
      id: 'rq7',
      text_id: 'rt2',
      question_kz: '«Оқыды», «жазды», «ойланды» — бұл сөздер қандай сөз табы?',
      option_a: 'Зат есім',
      option_b: 'Етістік',
      option_c: 'Сан есім',
      option_d: 'Есімдік',
      correct_option: 'B',
    },
    {
      id: 'rq8',
      text_id: 'rt2',
      question_kz: '«Биік тау», «кең дала» тіркестерінде «биік» пен «кең» қандай сөз табы?',
      option_a: 'Зат есім',
      option_b: 'Үстеу',
      option_c: 'Сын есім',
      option_d: 'Есімдік',
      correct_option: 'C',
    },
  ],
  rt3: [
    {
      id: 'rq9',
      text_id: 'rt3',
      question_kz: 'Сөйлемнің негізгі мүшелері қандай?',
      option_a: 'Анықтауыш және толықтауыш',
      option_b: 'Бастауыш және баяндауыш',
      option_c: 'Пысықтауыш және анықтауыш',
      option_d: 'Толықтауыш және баяндауыш',
      correct_option: 'B',
    },
    {
      id: 'rq10',
      text_id: 'rt3',
      question_kz: 'Салалас құрмалас сөйлемде жай сөйлемдер қалай байланысады?',
      option_a: 'Бір сөйлем екіншісіне бағынышты',
      option_b: 'Тең дәрежеде',
      option_c: 'Кезектесіп',
      option_d: 'Қарама-қарсы мағынада',
      correct_option: 'B',
    },
    {
      id: 'rq11',
      text_id: 'rt3',
      question_kz: '«Күн жарық.» — бұл қандай сөйлем?',
      option_a: 'Сабақтас құрмалас',
      option_b: 'Салалас құрмалас',
      option_c: 'Жай сөйлем',
      option_d: 'Леп сөйлем',
      correct_option: 'C',
    },
    {
      id: 'rq12',
      text_id: 'rt3',
      question_kz: 'Сабақтас құрмалас сөйлемде қандай байланыс бар?',
      option_a: 'Жай сөйлемдер тең дәрежеде',
      option_b: 'Бір сөйлем екіншісіне бағынышты',
      option_c: 'Сөйлемдер тізбекпен',
      option_d: 'Мағыналары қарама-қарсы',
      correct_option: 'B',
    },
  ],
};

export interface ReadingState {
  text: ReadingText | null;
  questions: ReadingQuestion[];
  currentIndex: number;
  selectedOption: OptionLetter | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  isFinished: boolean;
}

export function useReading(textId: string) {
  const text = MOCK_READING_TEXTS.find((t) => t.id === textId) ?? null;
  const questions = MOCK_READING_QUESTIONS[textId] ?? [];

  const [state, setState] = useState<ReadingState>({
    text,
    questions,
    currentIndex: 0,
    selectedOption: null,
    isAnswered: false,
    isCorrect: null,
    score: 0,
    isFinished: false,
  });

  const selectAnswer = useCallback((option: OptionLetter) => {
    setState((prev) => {
      if (prev.isAnswered) return prev;
      const current = prev.questions[prev.currentIndex];
      const correct = option === current.correct_option;
      return {
        ...prev,
        selectedOption: option,
        isAnswered: true,
        isCorrect: correct,
        score: correct ? prev.score + 1 : prev.score,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const next = prev.currentIndex + 1;
      if (next >= prev.questions.length) {
        return { ...prev, isFinished: true };
      }
      return {
        ...prev,
        currentIndex: next,
        selectedOption: null,
        isAnswered: false,
        isCorrect: null,
      };
    });
  }, []);

  const getOptionState = useCallback(
    (letter: OptionLetter): AnswerState => {
      if (!state.isAnswered) {
        return state.selectedOption === letter ? 'selected' : 'default';
      }
      const current = state.questions[state.currentIndex];
      if (letter === current.correct_option) return 'correct';
      if (letter === state.selectedOption) return 'wrong';
      return 'default';
    },
    [state]
  );

  return {
    ...state,
    currentQuestion: questions[state.currentIndex] ?? null,
    isLastQuestion: state.currentIndex === questions.length - 1,
    selectAnswer,
    nextQuestion,
    getOptionState,
  };
}

export function getReadingTextsForTopic(topicId: string): ReadingText[] {
  return MOCK_READING_TEXTS.filter((t) => t.topic_id === topicId);
}
