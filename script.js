let total_problems = 0;
let problems = [];
let currentIndex = 0;
let startTime = 0;

const startBtn = document.getElementById("start-btn");
const gameScreen = document.getElementById("game-screen");
const startScreen = document.getElementById("start-screen");
const endScreen = document.getElementById("end-screen");
const problemText = document.getElementById("problem");
const resultText = document.getElementById("result");
const answerButtons = document.getElementById("answer-buttons");
const finalMessage = document.getElementById("final-message");
const progressBar = document.getElementById("progress-bar");
const correctAudio = document.getElementById("correct-audio");
const operationRadios = document.querySelectorAll('input[name="operation"]');
const carryOptions = document.getElementById("carry-options");

function updateCarrySagariLabel(op) {
  // op: 'add' or 'sub'
  const carryLabel = document.getElementById("carry-label");
  const sagariLabel = document.getElementById("sagari-label");
  const carryLabelNo = document.getElementById("carry-label-no");
  const sagariLabelNo = document.getElementById("sagari-label-no");
  if (!carryLabel || !sagariLabel || !carryLabelNo || !sagariLabelNo) return;
  if (op === "sub") {
    carryLabel.style.display = "none";
    sagariLabel.style.display = "inline";
    carryLabelNo.style.display = "none";
    sagariLabelNo.style.display = "inline";
  } else {
    carryLabel.style.display = "inline";
    sagariLabel.style.display = "none";
    carryLabelNo.style.display = "inline";
    sagariLabelNo.style.display = "none";
  }
}
// ページ読み込み時に初期状態を決める
window.addEventListener("DOMContentLoaded", () => {
  const checkedOp = document.querySelector(
    'input[name="operation"]:checked'
  ).value;
  // ここを修正：加算と減算どちらでもくりオプション表示
  carryOptions.style.display =
    checkedOp === "add" || checkedOp === "sub" ? "flex" : "none";
  updateCarrySagariLabel(checkedOp);
});

// くりあがりの選択表示
operationRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    // ここを修正：加算・減算の時にくり選択肢を表示
    if ((radio.value === "add" || radio.value === "sub") && radio.checked) {
      carryOptions.style.display = "flex";
      updateCarrySagariLabel(radio.value);
    } else if (radio.value === "mul" && radio.checked) {
      carryOptions.style.display = "none";
    }
  });
});

// スタートボタンを押した時
startBtn.onclick = () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
  startTime = Date.now();

  const selectedOrder = document.querySelector(
    'input[name="order"]:checked'
  ).value;
  const selectedType = document.querySelector(
    'input[name="type"]:checked'
  ).value;
  const selectedOp = document.querySelector(
    'input[name="operation"]:checked'
  ).value;

  // 問題リストを先に生成（答えの範囲確定のため）
  generateProblemList(selectedOrder, selectedType, selectedOp);

  // answer-displayの表示/非表示を制御
  const answerDisplay = document.getElementById("answer-display");
  if (selectedOp === "mul") {
    answerDisplay.style.display = "block";
    renderAnswerButtons("mul"); // かけ算 → 0〜9の数字ボタン
  } else {
    answerDisplay.style.display = "none";
    // --- button範囲の仕様に合わせて分岐 ---
    if (selectedOp === "sub") {
      renderAnswerButtons(9); // ひき算はいつも1〜9
    } else if (selectedOp === "add") {
      if (selectedType === "carry") {
        renderAnswerButtons(18, 11); // たし算 くりあがりあり→11〜18
      } else {
        renderAnswerButtons(10); // たし算 くりあがりなし→1〜10
      }
    }
  }

  displayProblem();
  updateProgressBar();
};

// 問題リストを作る
function generateProblemList(
  order = "sequential",
  type = "no-carry",
  operation = "add"
) {
  problems = [];

  if (operation === "sub") {
    // 引き算
    if (type === "carry") {
      for (let a = 11; a <= 18; a++) {
        for (let b = 1; b <= 9; b++) {
          if (a > b) {
            const a1 = a % 10,
              b1 = b % 10;
            if (a1 < b1) {
              problems.push({ a, b, op: "-" });
            }
          }
        }
      }
    } else {
      for (let a = 2; a <= 10; a++) {
        for (let b = 1; b <= 9; b++) {
          if (a > b) {
            const a1 = a % 10,
              b1 = b % 10;
            if (a1 >= b1) {
              problems.push({ a, b, op: "-" });
            }
          }
        }
      }
    }
  } else if (operation === "mul") {
    // かけ算
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        problems.push({ a, b, op: "×" });
      }
    }
  } else {
    //足し算
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const sum = a + b;
        if (
          (type === "no-carry" && sum <= 10) ||
          (type === "carry" && sum > 10)
        ) {
          problems.push({ a, b, op: "+" });
        }
      }
    }
  }

  total_problems = problems.length;

  // ランダムの場合
  if (order === "random") {
    shuffle(problems);
  }
}

// 問題をシャッフルする
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 問題を表示する
function showProblem() {
  resultText.textContent = "";

  if (currentIndex >= problems.length) {
    endGame();
    return;
  }

  const { a, b } = problems[currentIndex];
  problemText.textContent = `${a} + ${b} = ?`;
}

function displayProblem() {
  if (currentIndex >= problems.length) {
    endGame();
    return;
  }

  const problem = problems[currentIndex];
  const { a, b, op } = problem;
  problemText.textContent = `${a} ${op} ${b} = ?`;
}

function checkAnswer(input) {
  const { a, b, op } = problems[currentIndex];
  let correct;
  if (op === "+") {
    correct = a + b;
  } else if (op === "-") {
    correct = a - b;
  } else if (op === "×") {
    correct = a * b;
  }

  if (input === correct) {
    resultText.textContent = "○ せいかい！";
    resultText.style.color = "green";

    if (correctAudio) {
      correctAudio.currentTime = 0;
      correctAudio.play();
    }

    // ちょっと待ってから次へ（300msくらい）
    setTimeout(() => {
      currentIndex++;
      displayProblem();
      updateProgressBar();
    }, 300);
  } else {
    // 間違い処理
    // 正解するまで進めない
    resultText.textContent = "✕ ざんねん…";
    resultText.style.color = "red";
  }
}

// 回答ボタンを作る
function renderAnswerButtons(maxAnswer, minAnswer = 1) {
  const container = document.getElementById("answer-buttons");
  container.innerHTML = ""; // 既存ボタンをクリア

  if (maxAnswer === "mul") {
    // かけ算用：電卓風のボタン配置
    let currentAnswer = "";

    // 電卓風のグリッドレイアウトを適用
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(3, 1fr)";
    container.style.gridTemplateRows = "repeat(4, 1fr)";
    container.style.gap = "10px";
    container.style.maxWidth = "300px";
    container.style.margin = "0 auto";

    // 数字ボタン（7, 8, 9, 4, 5, 6, 1, 2, 3, 0）を電卓順で配置
    const numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0];
    numbers.forEach((num) => {
      const btn = document.createElement("button");
      btn.textContent = num;
      btn.style.fontSize = "1rem";
      btn.style.padding = "8px 12px";
      btn.addEventListener("click", () => {
        currentAnswer += num.toString();
        updateAnswerDisplay(currentAnswer);
      });
      container.appendChild(btn);
    });

    // クリアボタン（左下）
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "クリア";
    clearBtn.style.fontSize = "0.9rem";
    clearBtn.style.padding = "8px 6px";
    clearBtn.addEventListener("click", () => {
      currentAnswer = "";
      updateAnswerDisplay("");
    });
    container.appendChild(clearBtn);

    // 決定ボタン（右下）
    const enterBtn = document.createElement("button");
    enterBtn.textContent = "けってい";
    enterBtn.style.fontSize = "0.9rem";
    enterBtn.style.padding = "8px 6px";
    enterBtn.addEventListener("click", () => {
      if (currentAnswer !== "") {
        checkAnswer(parseInt(currentAnswer));
        currentAnswer = "";
        updateAnswerDisplay("");
      }
    });
    container.appendChild(enterBtn);
  } else if (typeof maxAnswer === "number") {
    for (let i = minAnswer; i <= maxAnswer; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.addEventListener("click", () => checkAnswer(i));
      container.appendChild(btn);
    }
  }
}

// プログレスバーを更新する
function updateProgressBar() {
  const percent = Math.floor((currentIndex / total_problems) * 100);
  progressBar.style.width = `${percent}%`;
}

// 答え表示を更新する
function updateAnswerDisplay(answer) {
  const answerDisplay = document.getElementById("answer-display");
  if (answerDisplay) {
    answerDisplay.textContent = answer || "";
  }
}

// 問題が終了した後の処理
function endGame() {
  gameScreen.style.display = "none";
  endScreen.style.display = "block";

  const endTime = Date.now();
  const elapsed = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  finalMessage.textContent = `ぜんぶで ${minutes}ふん${seconds}びょう かかりました！`;
}
