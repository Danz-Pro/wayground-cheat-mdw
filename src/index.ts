import { QuizQuestion, QuizInfo } from "./types";

function waitForPinia(): Promise<any> {
  return new Promise((resolve) => {
    const check = () => {
      try {
        const root = document.querySelector("#root");
        if (!root) return false;
        const app = (root as any).__vue_app__;
        if (!app) return false;
        const pinia = app.config.globalProperties.$pinia;
        if (!pinia) return false;
        resolve(pinia);
        return true;
      } catch { return false; }
    };
    if (check()) return;
    console.log("[Wayground Cheat MDW] Menunggu Vue app & Pinia...");
    const iv = setInterval(() => {
      if (check()) clearInterval(iv);
    }, 500);
  });
}

function waitForRoomHash(pinia: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let dots = 0;
    const maxWait = 300000;
    const startTime = Date.now();

    const check = () => {
      try {
        const store = pinia._s.get("gameData");
        if (!store) return false;
        const rh = store.$state.roomHash;
        if (rh && typeof rh === "string" && rh.length > 0) {
          resolve(rh);
          return true;
        }
        return false;
      } catch { return false; }
    };

    if (check()) return;

    console.log("[Wayground Cheat MDW] Menunggu kamu join game... (script tetap aktif)");

    const iv = setInterval(() => {
      if (check()) {
        clearInterval(iv);
        return;
      }
      const elapsed = Date.now() - startTime;
      if (elapsed > maxWait) {
        clearInterval(iv);
        reject(new Error("Timeout 5 menit. Join game lalu paste ulang scriptnya."));
        return;
      }
      dots++;
      if (dots % 20 === 0) {
        const sec = Math.floor(elapsed / 1000);
        console.log("[Wayground Cheat MDW] Masih menunggu... (" + sec + " detik)");
      }
    }, 500);
  });
}

function getPiniaInstance(): any {
  const root = document.querySelector("#root");
  if (!root) throw new Error("No #root");
  const app = (root as any).__vue_app__;
  if (!app) throw new Error("No Vue app");
  return app.config.globalProperties.$pinia;
}

function getCurrentQuestionId(): string {
  const pinia = getPiniaInstance();
  const store = pinia._s.get("gameQuestions");
  if (!store) throw new Error("No gameQuestions");
  return store.$state.currentId || store.$state.currentQuestionId;
}

function getOptionElements(): HTMLElement[] {
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

  throw new Error("Tidak ada opsi ditemukan");
}

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function highlightAnswers(question: QuizQuestion) {
  if (question.type !== "MCQ" && question.type !== "MSQ") return;

  let optionElements: HTMLElement[];
  try {
    optionElements = getOptionElements();
  } catch { return; }

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
    console.log("[Wayground Cheat MDW] " + correctCount + " jawaban benar disorot dari " + optionElements.length + " opsi");
  }
}

async function fetchQuizData(roomHash: string): Promise<QuizInfo> {
  const url = "https://wayground.com/_api/main/game/" + roomHash;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const quiz: any = await response.json();
      if (!quiz || !quiz.data || !Array.isArray(quiz.data.questions) || quiz.data.questions.length === 0) {
        throw new Error("Data kosong dari API");
      }
      return quiz;
    } catch (err: any) {
      console.warn("[Wayground Cheat MDW] Percobaan " + attempt + "/3 gagal: " + (err.message || err));
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  throw new Error("Gagal fetch data setelah 3 percobaan");
}

async function main() {
  console.log("%c Wayground Cheat MDW ", "background:#1B3A5C;color:#fff;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:4px;");

  let pinia: any;
  try {
    pinia = await waitForPinia();
    console.log("[Wayground Cheat MDW] Vue app & Pinia ditemukan");
  } catch (err: any) {
    console.error("[Wayground Cheat MDW] Gagal: " + (err.message || err));
    return;
  }

  let roomHash: string;
  try {
    roomHash = await waitForRoomHash(pinia);
    console.log("[Wayground Cheat MDW] Game terdeteksi! Room: " + roomHash);
  } catch (err: any) {
    console.error("[Wayground Cheat MDW] " + (err.message || err));
    return;
  }

  let quiz: QuizInfo;
  try {
    quiz = await fetchQuizData(roomHash);
    console.log("[Wayground Cheat MDW] " + quiz.data.questions.length + " pertanyaan berhasil dimuat");
  } catch (err: any) {
    console.error("[Wayground Cheat MDW] " + (err.message || err));
    return;
  }

  let lastQuestionID: string | undefined = undefined;

  const loop = () => {
    try {
      const questionInfo = getCurrentQuestionId();
      if (questionInfo && questionInfo !== lastQuestionID) {
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
  console.log("[Wayground Cheat MDW] AKTIF! Jawaban benar otomatis disorot.");
}

main();
