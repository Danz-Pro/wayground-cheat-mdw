import { QuizQuestion, QuizInfo } from "./types";

const getPiniaInstance = () => {
  const root = document.querySelector("#root");
  if (!root) throw new Error("Could not find #root element");
  const vueApp = (root as any).__vue_app__;
  if (!vueApp) throw new Error("Could not find Vue app instance");
  const pinia = vueApp.config.globalProperties.$pinia;
  if (!pinia) throw new Error("Could not find Pinia store");
  return pinia;
};

const getRoomHash = (): string => {
  const pinia = getPiniaInstance();
  const gameDataStore = pinia._s.get("gameData");
  if (!gameDataStore) throw new Error("Could not find gameData store");
  const roomHash = gameDataStore.$state.roomHash;
  if (!roomHash) throw new Error("Could not retrieve roomHash from gameData store");
  return roomHash;
};

const getCurrentQuestionId = (): string => {
  const pinia = getPiniaInstance();
  const gameQuestionsStore = pinia._s.get("gameQuestions");
  if (!gameQuestionsStore) throw new Error("Could not find gameQuestions store");
  const currentId = gameQuestionsStore.$state.currentId || gameQuestionsStore.$state.currentQuestionId;
  if (!currentId) throw new Error("Could not retrieve current question ID");
  return currentId;
};

const getOptionElements = (): HTMLElement[] => {
  const roleOptions = Array.from(document.querySelectorAll<HTMLElement>("[role='option']"));
  if (roleOptions.length >= 2) {
    const filtered = roleOptions.filter((el) => {
      const cl = el.className || "";
      const clStr = typeof cl === "object" ? Array.prototype.join.call(cl, " ") : cl;
      return clStr.indexOf("is-selectable") !== -1 || clStr.indexOf("is-mcq") !== -1 || clStr.indexOf("is-msq") !== -1;
    });
    if (filtered.length >= 2) return filtered;
    return roleOptions;
  }

  const selectors = [
    "[data-testid='options-grid'] > *",
    ".options-container > div",
    "[data-testid='option-container'] > div",
  ];

  for (const selector of selectors) {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (elements.length > 0) {
      const options = elements.filter((el) => {
        const text = el.textContent || "";
        return text.trim().length > 0 && text.trim().length < 500;
      });
      if (options.length >= 2) return options;
    }
  }

  throw new Error("Unable to find question option elements");
};

const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const changeElementOpacity = (elem: HTMLElement) => {
  elem.style.opacity = "20%";
  elem.style.transition = "opacity 0.3s ease";
};

const highlightAnswers = (question: QuizQuestion) => {
  if (question.type !== "MCQ" && question.type !== "MSQ") {
    console.log(`[Wayground Cheat] Skipping non-MCQ/MSQ question type: ${question.type}`);
    return;
  }

  let optionElements: HTMLElement[];
  try {
    optionElements = getOptionElements();
  } catch (e: any) {
    console.warn(`[Wayground Cheat] Could not find options: ${e.message}`);
    return;
  }

  const answer = question.structure.answer;

  if (Array.isArray(question.structure.options) && question.structure.options.length < 1 && question.structure.query) {
    const answers = question.structure.options.map((option) => option.text).join(" or ");
    alert(`Answer: ${answers}`);
    return;
  }

  if (question.structure.options && question.structure.options.length > 0) {
    const correctAnswerIndices: number[] = [];

    if (Array.isArray(answer) && answer.length > 0) {
      answer.forEach((idx) => correctAnswerIndices.push(idx));
    } else if (typeof answer === "number" && answer >= 0) {
      correctAnswerIndices.push(answer);
    }

    const correctAnswerTexts: Record<string, boolean> = {};
    correctAnswerIndices.forEach((idx) => {
      const opt = question.structure.options![idx];
      if (opt) {
        const txt = stripHtml(opt.text).trim().toLowerCase();
        if (txt.length > 0) {
          correctAnswerTexts[txt] = true;
        }
      }
    });

    let correctCount = 0;
    optionElements.forEach((elem, domIndex) => {
      let isCorrect = false;

      if (correctAnswerIndices.indexOf(domIndex) !== -1) {
        isCorrect = true;
      }

      if (!isCorrect && Object.keys(correctAnswerTexts).length > 0) {
        const elemText = stripHtml(elem.textContent || "").trim().toLowerCase();
        for (const correctText in correctAnswerTexts) {
          if (elemText.length > 0 && correctText.length > 0 &&
              (elemText === correctText || elemText.indexOf(correctText) !== -1 || correctText.indexOf(elemText) !== -1)) {
            isCorrect = true;
            break;
          }
        }
      }

      if (!isCorrect) {
        const cl = elem.className || "";
        const clStr = typeof cl === "object" ? Array.prototype.join.call(cl, " ") : cl;
        const match = clStr.match(/\boption-(\d+)\b/);
        if (match) {
          const classIndex = parseInt(match[1], 10) - 1;
          if (correctAnswerIndices.indexOf(classIndex) !== -1) {
            isCorrect = true;
          }
        }
      }

      if (!isCorrect) {
        changeElementOpacity(elem);
      } else {
        elem.style.outline = "3px solid #4CAF50";
        elem.style.outlineOffset = "2px";
        elem.style.transition = "outline 0.3s ease";
        correctCount++;
      }
    });

    console.log(`[Wayground Cheat] Highlighted ${correctCount} correct answer(s) out of ${optionElements.length} options`);
  }
};

const msg = `%c
    Wayground Cheat MDW
    https://github.com/Danz-Pro/wayground-cheat-mdw
  `;

(async () => {
  console.log(msg, "color: #1B3A5C; font-weight: bold;");

  const roomHash = getRoomHash();
  console.log(`[Wayground Cheat] Room hash: ${roomHash}`);

  const quiz: QuizInfo = await (await fetch(`https://wayground.com/_api/main/game/${roomHash}`)).json();
  console.log(`[Wayground Cheat] Loaded ${quiz.data.questions.length} questions`);

  let lastQuestionID: string | undefined = undefined;

  setInterval(() => {
    try {
      const questionInfo = getCurrentQuestionId();

      if (questionInfo !== lastQuestionID) {
        for (const q of quiz.data.questions) {
          if (questionInfo === q._id) {
            const queryText = q.structure.query ? stripHtml(q.structure.query.text || "") : "";
            console.log(`[Wayground Cheat] Question: "${queryText}" [${q.type}]`);
            highlightAnswers(q);
            lastQuestionID = questionInfo;
            break;
          }
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes("Could not retrieve")) {
        console.warn("[Wayground Cheat] Error:", err.message);
      }
    }
  }, 500);

  console.log("[Wayground Cheat] Script loaded! Correct answers will be highlighted automatically.");
})();
