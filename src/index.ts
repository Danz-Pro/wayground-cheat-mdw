import { QuizQuestion, QuizInfo } from "./types";

let wrongOpacity = 0.2;
const defaultOpacity = 0.2;

const showNotification = (message: string, type: "success" | "error" | "info") => {
  const existing = document.getElementById("__mdw_notif");
  if (existing) existing.remove();

  const bgColor = type === "success" ? "#1B3A5C" : type === "error" ? "#C0392B" : "#2C3E50";
  const borderColor = type === "success" ? "#4CAF50" : type === "error" ? "#E74C3C" : "#3498DB";
  const icon = type === "success" ? "\u2713" : type === "error" ? "\u2717" : "\u2139";

  const notif = document.createElement("div");
  notif.id = "__mdw_notif";
  notif.style.cssText = "position:fixed;top:20px;right:20px;z-index:999999;padding:14px 22px;border-radius:10px;color:#fff;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:600;box-shadow:0 6px 20px rgba(0,0,0,0.35);border-left:4px solid " + borderColor + ";background:" + bgColor + ";opacity:0;transform:translateX(40px);transition:opacity 0.4s ease,transform 0.4s ease;max-width:360px;cursor:pointer;";
  notif.innerHTML = "<span style=\"margin-right:8px;font-size:18px;\">" + icon + "</span>" + message;
  document.body.appendChild(notif);

  requestAnimationFrame(function() {
    notif.style.opacity = "1";
    notif.style.transform = "translateX(0)";
  });

  const dismiss = function() {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(40px)";
    setTimeout(function() { if (notif.parentNode) notif.remove(); }, 400);
  };

  setTimeout(dismiss, 4000);
  notif.onclick = dismiss;
};

const createSettingsModal = () => {
  const overlay = document.createElement("div");
  overlay.id = "__mdw_settings_overlay";
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:999998;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;";

  const modal = document.createElement("div");
  modal.style.cssText = "background:linear-gradient(145deg,#1B3A5C,#0F2440);color:#fff;border-radius:16px;padding:0;width:380px;max-width:92vw;box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;transform:scale(0.9);transition:transform 0.3s ease;";

  const header = document.createElement("div");
  header.style.cssText = "background:#0D1B2A;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);";
  header.innerHTML = "<div style=\"display:flex;align-items:center;gap:10px;\"><div style=\"width:32px;height:32px;border-radius:8px;background:#4CAF50;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;\">W</div><div><div style=\"font-size:16px;font-weight:700;\">Wayground Cheat MDW</div><div style=\"font-size:11px;color:rgba(255,255,255,0.5);\">v2.0 by MDW</div></div></div>";

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = "background:none;border:none;color:rgba(255,255,255,0.6);font-size:22px;cursor:pointer;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;";
  closeBtn.onmouseover = function() { closeBtn.style.background = "rgba(255,255,255,0.1)"; closeBtn.style.color = "#fff"; };
  closeBtn.onmouseout = function() { closeBtn.style.background = "none"; closeBtn.style.color = "rgba(255,255,255,0.6)"; };

  const body = document.createElement("div");
  body.style.cssText = "padding:20px;max-height:60vh;overflow-y:auto;";

  const sectionTitle = function(text: string) {
    const el = document.createElement("div");
    el.style.cssText = "font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#4CAF50;margin-bottom:12px;margin-top:4px;";
    el.textContent = text;
    return el;
  };

  const sectionBox = document.createElement("div");
  sectionBox.style.cssText = "margin-bottom:20px;";

  sectionBox.appendChild(sectionTitle("Pengaturan"));

  const opacityContainer = document.createElement("div");
  opacityContainer.style.cssText = "background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;";

  const opacityLabel = document.createElement("div");
  opacityLabel.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;";
  opacityLabel.innerHTML = "<span style=\"font-size:13px;font-weight:600;\">Opacity Jawaban Salah</span><span id=\"__mdw_opacity_val\" style=\"font-size:13px;font-weight:700;color:#4CAF50;background:rgba(76,175,80,0.15);padding:2px 10px;border-radius:20px;\">20%</span>";

  const opacitySlider = document.createElement("input");
  opacitySlider.type = "range";
  opacitySlider.min = "0";
  opacitySlider.max = "100";
  opacitySlider.value = String(Math.round(wrongOpacity * 100));
  opacitySlider.id = "__mdw_opacity_slider";
  opacitySlider.style.cssText = "width:100%;height:6px;-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.1);border-radius:3px;outline:none;cursor:pointer;";

  opacitySlider.oninput = function() {
    const val = parseInt(opacitySlider.value, 10);
    wrongOpacity = val / 100;
    const valDisplay = document.getElementById("__mdw_opacity_val");
    if (valDisplay) valDisplay.textContent = val + "%";
    const fillPct = val + "%";
    opacitySlider.style.background = "linear-gradient(to right, #4CAF50 0%, #4CAF50 " + fillPct + ", rgba(255,255,255,0.1) " + fillPct + ", rgba(255,255,255,0.1) 100%)";
  };

  opacityContainer.appendChild(opacityLabel);
  opacityContainer.appendChild(opacitySlider);

  const opacityHint = document.createElement("div");
  opacityHint.style.cssText = "margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4);";
  opacityHint.textContent = "Semakin rendah opacity, jawaban salah semakin samar.";
  opacityContainer.appendChild(opacityHint);

  sectionBox.appendChild(opacityContainer);

  const previewBox = document.createElement("div");
  previewBox.style.cssText = "background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;display:flex;gap:10px;align-items:center;margin-top:10px;";

  const previewCorrect = document.createElement("div");
  previewCorrect.style.cssText = "flex:1;text-align:center;padding:10px;border-radius:8px;font-size:12px;font-weight:600;background:rgba(76,175,80,0.15);border:2px solid #4CAF50;";
  previewCorrect.textContent = "Benar";

  const previewWrong = document.createElement("div");
  previewWrong.id = "__mdw_preview_wrong";
  previewWrong.style.cssText = "flex:1;text-align:center;padding:10px;border-radius:8px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.1);opacity:0.2;transition:opacity 0.3s ease;";
  previewWrong.textContent = "Salah";

  previewBox.appendChild(previewCorrect);
  previewBox.appendChild(previewWrong);
  sectionBox.appendChild(previewBox);

  const originalOnInput = opacitySlider.oninput ? opacitySlider.oninput.bind(opacitySlider) : null;
  opacitySlider.oninput = function(e) {
    if (originalOnInput) originalOnInput(e as any);
    const preview = document.getElementById("__mdw_preview_wrong");
    if (preview) preview.style.opacity = String(wrongOpacity);
  };

  const guideBox = document.createElement("div");
  guideBox.style.cssText = "margin-bottom:0px;";

  guideBox.appendChild(sectionTitle("Petunjuk"));

  const guideItems = [
    ["1", "Aktifkan script di halaman wayground.com/join"],
    ["2", "Tunggu notifikasi berhasil muncul"],
    ["3", "Join game, jawaban benar otomatis disorot hijau"],
    ["4", "Jawaban salah akan dibuat samar sesuai opacity"],
  ];

  for (let i = 0; i < guideItems.length; i++) {
    const item = guideItems[i];
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:flex-start;gap:10px;padding:8px 0;";
    if (i < guideItems.length - 1) row.style.borderBottom = "1px solid rgba(255,255,255,0.04)";

    const num = document.createElement("div");
    num.style.cssText = "width:22px;height:22px;min-width:22px;border-radius:6px;background:rgba(76,175,80,0.15);color:#4CAF50;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;";
    num.textContent = item[0];

    const txt = document.createElement("div");
    txt.style.cssText = "font-size:12px;color:rgba(255,255,255,0.75);line-height:1.5;padding-top:2px;";
    txt.textContent = item[1];

    row.appendChild(num);
    row.appendChild(txt);
    guideBox.appendChild(row);
  }

  body.appendChild(sectionBox);
  body.appendChild(guideBox);

  const footer = document.createElement("div");
  footer.style.cssText = "padding:14px 20px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center;";
  footer.innerHTML = "<span style=\"font-size:10px;color:rgba(255,255,255,0.3);\">wayground-cheat-mdw</span>";

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "Reset Default";
  resetBtn.style.cssText = "font-size:11px;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);padding:6px 14px;border-radius:8px;cursor:pointer;transition:all 0.2s;";
  resetBtn.onmouseover = function() { resetBtn.style.background = "rgba(255,255,255,0.15)"; resetBtn.style.color = "#fff"; };
  resetBtn.onmouseout = function() { resetBtn.style.background = "rgba(255,255,255,0.08)"; resetBtn.style.color = "rgba(255,255,255,0.6)"; };
  resetBtn.onclick = function() {
    wrongOpacity = defaultOpacity;
    opacitySlider.value = String(Math.round(defaultOpacity * 100));
    if (opacitySlider.oninput) opacitySlider.oninput(null as any);
    showNotification("Opacity direset ke default (20%)", "success");
  };

  footer.appendChild(resetBtn);

  header.appendChild(closeBtn);
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  const openModal = function() {
    overlay.style.display = "flex";
    opacitySlider.value = String(Math.round(wrongOpacity * 100));
    const valDisplay = document.getElementById("__mdw_opacity_val");
    if (valDisplay) valDisplay.textContent = Math.round(wrongOpacity * 100) + "%";
    const preview = document.getElementById("__mdw_preview_wrong");
    if (preview) preview.style.opacity = String(wrongOpacity);
    const fillPct = Math.round(wrongOpacity * 100) + "%";
    opacitySlider.style.background = "linear-gradient(to right, #4CAF50 0%, #4CAF50 " + fillPct + ", rgba(255,255,255,0.1) " + fillPct + ", rgba(255,255,255,0.1) 100%)";
    requestAnimationFrame(function() {
      overlay.style.opacity = "1";
      modal.style.transform = "scale(1)";
    });
  };

  const closeModal = function() {
    overlay.style.opacity = "0";
    modal.style.transform = "scale(0.9)";
    setTimeout(function() { overlay.style.display = "none"; }, 300);
  };

  overlay.onclick = function(e: MouseEvent) {
    if ((e.target as HTMLElement) === overlay) closeModal();
  };
  closeBtn.onclick = closeModal;

  document.addEventListener("keydown", function(e: KeyboardEvent) {
    if (e.key === "Escape") closeModal();
  });

  overlay.style.display = "none";
  document.body.appendChild(overlay);

  setTimeout(function() { if (opacitySlider.oninput) opacitySlider.oninput(null as any); }, 100);

  return { openModal: openModal };
};

let settingsModal: { openModal: () => void } | null = null;

const hookMenuButton = () => {
  const waitForButton = function() {
    const btn = document.querySelector<HTMLElement>("[data-testid='menu-button']");
    if (btn) {
      btn.addEventListener("click", function(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        if (settingsModal) settingsModal.openModal();
      }, true);
      console.log("[Wayground Cheat MDW] Tombol menu berhasil di-hook!");
    } else {
      setTimeout(waitForButton, 1000);
    }
  };
  waitForButton();
};

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
      elem.style.opacity = String(wrongOpacity);
      elem.style.transition = "opacity 0.3s ease";
    }
  }

  if (correctCount > 0) {
    console.log("[Wayground Cheat MDW] " + correctCount + " jawaban benar disorot dari " + optionElements.length + " opsi (opacity: " + wrongOpacity + ")");
    return true;
  }

  return false;
};

let scriptActive = false;
let intervalId: any = null;

async function main() {
  scriptActive = true;

  settingsModal = createSettingsModal();
  hookMenuButton();

  console.log("%c Wayground Cheat MDW ", "background:#1B3A5C;color:#fff;font-size:14px;font-weight:bold;padding:4px 8px;border-radius:4px;");
  console.log("[Wayground Cheat MDW] Menunggu game dimulai...");
  showNotification("Script aktif! Klik tombol menu (bars) untuk buka setting.", "success");

  let roomHash = "";
  for (let i = 0; i < 120; i++) {
    if (!scriptActive) return;
    try {
      roomHash = getRoomHash();
      if (roomHash && roomHash.length > 0) break;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
    if (i > 0 && i % 10 === 0) {
      console.log("[Wayground Cheat MDW] Masih menunggu join game... (" + i + " detik)");
    }
  }

  if (!scriptActive) return;
  if (!roomHash) {
    console.error("[Wayground Cheat MDW] Timeout 120 detik. Pastikan sudah join game.");
    return;
  }

  console.log("[Wayground Cheat MDW] Room hash: " + roomHash);

  let quiz: QuizInfo;
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (!scriptActive) return;
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

  if (!scriptActive) return;

  console.log("[Wayground Cheat MDW] " + quiz!.data.questions.length + " pertanyaan dimuat");

  const questionMap = new Map<string, QuizQuestion>();
  for (const q of quiz!.data.questions) {
    questionMap.set(q._id, q);
  }

  let lastQuestionID: string | undefined = undefined;
  let retryCount = 0;
  const MAX_RETRY = 6;

  intervalId = setInterval(() => {
    if (!scriptActive) {
      clearInterval(intervalId);
      return;
    }
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
  showNotification("Berhasil! " + quiz!.data.questions.length + " soal dimuat.", "success");
}

main();
