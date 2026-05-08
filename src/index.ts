import { QuizQuestion, QuizInfo } from "./types";

const waitFor = (fn: () => boolean, timeoutMs: number = 15000, intervalMs: number = 500): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (fn()) { resolve(); return; }
    const timer = setTimeout(() => {
      clearInterval(iv);
      reject(new Error("Timeout menunggu: " + fn.toString().substring(0, 60)));
    }, timeoutMs);
    const iv = setInterval(() => {
      if (fn()) { clearTimeout(timer); clearInterval(iv); resolve(); }
    }, intervalMs);
  });
};

const getPiniaInstance = () => {
  const root = document.querySelector("#root");
  if (!root) throw new Error("Tidak ada #root");
  const vueApp = (root as any).__vue_app__;
  if (!vueApp) throw new Error("Tidak ada Vue app");
  const pinia = vueApp.config.globalProperties.$pinia;
  if (!pinia) throw new Error("Tidak ada Pinia");
  return pinia;
};

const getRoomHash = (): string => {
  const pinia = getPiniaInstance();
  const store = pinia._s.get("gameData");
  if (!store) throw new Error("Tidak ada store gameData");
  const rh = store.$state.roomHash;
  if (!rh) throw new Error("Tidak ada roomHash");
  return rh;
};

const getCurrentQuestionId = (): string => {
  const pinia = getPiniaInstance();
  const store = pinia._s.get("gameQuestions");
  if (!store) throw new Error("Tidak ada store gameQuestions");
  const id = store.$state.currentId || store.$state.currentQuestionId;
  if (!id) throw new Error("Tidak ada currentId");
  return id;
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
    "[class*='option-card']",
    "[class*='OptionCard']",
  ];

  for (const sel of selectors) {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(sel));
    if (elements.length > 0) {
      const valid = elements.filter((el) => {
        const text = el.textContent || "";
        return text.trim().length > 0 && text.trim().length < 500;
      });
      if (valid.length >= 2) return valid;
    }
  }

  throw new Error("Tidak ada elemen opsi ditemukan");
};

const stripHtml = (html: string): string => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const highlightAnswers = (question: QuizQuestion) => {
  if (question.type !== "MCQ" && question.type !== "MSQ") {
    return;
  }

  let optionElements: HTMLElement[];
  try {
    optionElements = getOptionElements();
  } catch {
    return;
  }

  const options = question.structure.options;
  if (!options || !Array.isArray(options) || options.length === 0) return;

  const answer = question.structure.answer;
  const correctAnswerIndices: number[] = [];

  if (Array.isArray(answer) && answer.length > 0) {
    answer.forEach((idx) => {
      if (typeof idx === "number" && idx >= 0 && idx < options.length) {
        correctAnswerIndices.push(idx);
      }
    });
  } else if (typeof answer === "number" && answer >= 0 && answer < options.length) {
    correctAnswerIndices.push(answer);
  }

  if (correctAnswerIndices.length === 0) return;

  const correctAnswerTexts: Record<string, boolean> = {};
  correctAnswerIndices.forEach((idx) => {
    const opt = options[idx];
    if (opt) {
      const txt = stripHtml(opt.text).trim().toLowerCase();
      if (txt.length > 0) correctAnswerTexts[txt] = true;
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
        if (correctAnswerIndices.indexOf(classIndex) !== -1) isCorrect = true;
      }
    }

    if (!isCorrect) {
      elem.style.opacity = "0.2";
      elem.style.transition = "opacity 0.3s ease";
    } else {
      elem.style.outline = "3px solid #4CAF50";
      elem.style.outlineOffset = "2px";
      elem.style.transition = "outline 0.3s ease";
      correctCount++;
    }
  });

  if (correctCount > 0) {
    console.log("[Wayground Cheat] " + correctCount + " jawaban benar disorot dari " + optionElements.length + " opsi");
  }
};

async function fetchQuizData(): Promise<QuizInfo> {
  const roomHash = getRoomHash();
  console.log("[Wayground Cheat] Room hash: " + roomHash);

  const response = await fetch("https://wayground.com/_api/main/game/" + roomHash);
  if (!response.ok) throw new Error("API error: " + response.status);

  const quiz: any = await response.json();
  if (!quiz || !quiz.data || !Array.isArray(quiz.data.questions) || quiz.data.questions.length === 0) {
    throw new Error("Data tidak valid dari API");
  }

  console.log("[Wayground Cheat] " + quiz.data.questions.length + " pertanyaan dimuat");
  return quiz;
}

async function main() {
  console.log("%c Wayground Cheat MDW ", "background:#1B3A5C;color:#fff;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:4px;");

  try {
    await waitFor(() => {
      try { getPiniaInstance(); return true; } catch { return false; }
    }, 20000, 500);
  } catch {
    console.error("[Wayground Cheat] Gagal menemukan Vue/Pinia. Pastikan sudah join game.");
    return;
  }

  try {
    await waitFor(() => {
      try { getRoomHash(); return true; } catch { return false; }
    }, 30000, 1000);
  } catch {
    console.error("[Wayground Cheat] Gagal mendapatkan roomHash. Pastikan sudah join game.");
    return;
  }

  let quiz: QuizInfo;
  try {
    quiz = await fetchQuizData();
  } catch (err: any) {
    console.error("[Wayground Cheat] Gagal fetch data: " + (err.message || err));
    console.log("[Wayground Cheat] Retry dalam 3 detik...");
    await new Promise(r => setTimeout(r, 3000));
    try {
      quiz = await fetchQuizData();
    } catch (err2: any) {
      console.error("[Wayground Cheat] Gagal lagi: " + (err2.message || err2));
      return;
    }
  }

  let lastQuestionID: string | undefined = undefined;

  const loop = () => {
    try {
      const questionInfo = getCurrentQuestionId();
      if (questionInfo !== lastQuestionID) {
        for (const q of quiz.data.questions) {
          if (questionInfo === q._id) {
            highlightAnswers(q);
            lastQuestionID = questionInfo;
            break;
          }
        }
      }
    } catch {}
  };

  setInterval(loop, 500);
  loop();
  console.log("[Wayground Cheat] Aktif! Jawaban benar akan otomatis disorot.");
}

main();
