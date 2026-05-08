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
  const roomHash = (gameDataStore as any).$state ? (gameDataStore as any).$state.roomHash : (gameDataStore as any).roomHash;
  if (!roomHash) throw new Error("Could not retrieve roomHash from gameData store");
  return roomHash;
};

const getCurrentQuestionId = (): string => {
  const pinia = getPiniaInstance();
  const gameQuestionsStore = pinia._s.get("gameQuestions");
  if (!gameQuestionsStore) throw new Error("Could not find gameQuestions store");
  const qs: any = gameQuestionsStore;
  const currentId = (qs.$state ? qs.$state.currentId : qs.currentId) || (qs.$state ? qs.$state.currentQuestionId : qs.currentQuestionId);
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
    "[class*='option-card']",
    "[class*='OptionCard']",
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

const normalizeText = (text: string): string => {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
};

const wordsMatch = (domText: string, correctText: string): boolean => {
  const domWords = new Set(domText.split(/\s+/).filter(w => w.length > 1));
  const correctWords = new Set(correctText.split(/\s+/).filter(w => w.length > 1));

  if (correctWords.size === 0) return false;
  if (domWords.size === 0) return false;

  const correctWordsArr = Array.from(correctWords);
  for (let w = 0; w < correctWordsArr.length; w++) {
    if (!domWords.has(correctWordsArr[w])) return false;
  }

  return true;
};

const clearAllOptionStyles = () => {
  const allOptions = Array.from(document.querySelectorAll<HTMLElement>("[role='option']"));
  for (let i = 0; i < allOptions.length; i++) {
    const el = allOptions[i];
    el.style.opacity = "";
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.transition = "";
  }
};

const highlightAnswers = (question: QuizQuestion): boolean => {
  if (question.type !== "MCQ" && question.type !== "MSQ") {
    return false;
  }

  let optionElements: HTMLElement[];
  try {
    optionElements = getOptionElements();
  } catch (e: any) {
    console.warn("[Wayground Cheat MDW] Opsi belum muncul: " + e.message);
    return false;
  }

  const options = question.structure.options;
  if (!options || !Array.isArray(options) || options.length === 0) return false;

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

  if (correctAnswerIndices.length === 0) return false;

  const correctTexts: string[] = [];
  for (const idx of correctAnswerIndices) {
    const opt = options[idx];
    if (opt) {
      const txt = normalizeText(stripHtml(opt.text));
      if (txt.length > 0) {
        correctTexts.push(txt);
      }
    }
  }

  if (correctTexts.length === 0) return false;

  clearAllOptionStyles();

  const matchedDomIndices = new Set<number>();
  const usedCorrectTexts = new Set<number>();

  for (let i = 0; i < optionElements.length; i++) {
    const elem = optionElements[i];
    const elemText = normalizeText(stripHtml(elem.textContent || ""));

    for (let c = 0; c < correctTexts.length; c++) {
      if (usedCorrectTexts.has(c)) continue;
      if (elemText === correctTexts[c]) {
        matchedDomIndices.add(i);
        usedCorrectTexts.add(c);
        break;
      }
    }
  }

  if (matchedDomIndices.size === 0) {
    for (let i = 0; i < optionElements.length; i++) {
      if (matchedDomIndices.has(i)) continue;
      const elem = optionElements[i];
      const elemText = normalizeText(stripHtml(elem.textContent || ""));

      for (let c = 0; c < correctTexts.length; c++) {
        if (usedCorrectTexts.has(c)) continue;
        if (wordsMatch(elemText, correctTexts[c])) {
          matchedDomIndices.add(i);
          usedCorrectTexts.add(c);
          break;
        }
      }
    }
  }

  let correctCount = 0;
  for (let i = 0; i < optionElements.length; i++) {
    const elem = optionElements[i];
    if (matchedDomIndices.has(i)) {
      elem.style.outline = "3px solid #4CAF50";
      elem.style.outlineOffset = "2px";
      elem.style.transition = "outline 0.3s ease";
      correctCount++;
    } else {
      elem.style.opacity = "0.2";
      elem.style.transition = "opacity 0.3s ease";
    }
  }

  if (correctCount > 0) {
    console.log("[Wayground Cheat MDW] " + correctCount + " jawaban benar disorot dari " + optionElements.length + " opsi");
    return true;
  }

  return false;
};

async function main() {
  console.log("%c Wayground Cheat MDW ", "background:#1B3A5C;color:#fff;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:4px;");
  console.log("[Wayground Cheat MDW] Menunggu game dimulai...");

  let roomHash = "";
  for (let i = 0; i < 120; i++) {
    try {
      roomHash = getRoomHash();
      if (roomHash && roomHash.length > 0) break;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
    if (i > 0 && i % 10 === 0) {
      console.log("[Wayground Cheat MDW] Masih menunggu join game... (" + i + " detik)");
    }
  }

  if (!roomHash) {
    console.error("[Wayground Cheat MDW] Timeout 120 detik. Pastikan sudah join game.");
    return;
  }

  console.log("[Wayground Cheat MDW] Room hash: " + roomHash);

  let quiz: QuizInfo;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch("https://wayground.com/_api/main/game/" + roomHash);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data: any = await response.json();
      if (!data || !data.data || !Array.isArray(data.data.questions) || data.data.questions.length === 0) {
        throw new Error("Data kosong");
      }
      quiz = data;
      break;
    } catch (err: any) {
      console.warn("[Wayground Cheat MDW] Percobaan " + attempt + "/3 gagal: " + (err.message || err));
      if (attempt === 3) {
        console.error("[Wayground Cheat MDW] Gagal fetch data.");
        return;
      }
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log("[Wayground Cheat MDW] " + quiz!.data.questions.length + " pertanyaan dimuat");

  const questionMap = new Map<string, QuizQuestion>();
  for (const q of quiz!.data.questions) {
    questionMap.set(q._id, q);
  }

  let lastQuestionID: string | undefined = undefined;
  let retryCount = 0;
  const MAX_RETRY = 6;

  setInterval(() => {
    try {
      const questionInfo = getCurrentQuestionId();
      if (questionInfo && questionInfo !== lastQuestionID) {
        const question = questionMap.get(questionInfo);
        if (question) {
          const success = highlightAnswers(question);
          if (success) {
            lastQuestionID = questionInfo;
            retryCount = 0;
          } else {
            retryCount++;
            if (retryCount <= MAX_RETRY) {
              console.log("[Wayground Cheat MDW] Opsi belum siap, retry " + retryCount + "/" + MAX_RETRY + "...");
            } else {
              console.warn("[Wayground Cheat MDW] Gagal menyorot soal setelah " + MAX_RETRY + " percobaan, lanjut ke soal berikutnya.");
              lastQuestionID = questionInfo;
              retryCount = 0;
            }
          }
        } else {
          lastQuestionID = questionInfo;
        }
      }
    } catch {}
  }, 500);

  console.log("[Wayground Cheat MDW] Aktif! Jawaban benar otomatis disorot.");
}

main();
