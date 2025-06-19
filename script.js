const TOTAL_PROBLEMS = 45;
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
const nextBtn = document.getElementById("next-btn");
const finalMessage = document.getElementById("final-message");
const progressBar = document.getElementById("progress-bar");
const correctAudio = document.getElementById("correct-audio");

// スタートボタンを押した時
startBtn.onclick = () => {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
  startTime = Date.now();
  generateProblemList();
  showProblem();
  updateProgressBar();
};

// 問題リストを作る
function generateProblemList() {
  problems = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      if (a + b <= 10) {
        problems.push({ a, b });
      }
    }
  }
  shuffle(problems);
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

// 正誤判定
function checkAnswer(selected) {
  const { a, b } = problems[currentIndex];
  const correctAnswer = a + b;

  if (selected === correctAnswer) {
    resultText.textContent = "○ せいかい！";
    resultText.style.color = "green";
    if (correctAudio) {
      correctAudio.currentTime = 0;
      correctAudio.play();
      // 次の問題へ
      currentIndex++;
      showProblem();
      updateProgressBar();
    }
  } else {
    // 正解するまで進めない
    resultText.textContent = "✕ ざんねん…";
    resultText.style.color = "red";
  }
}

// １〜１０のボタンを作る
function createAnswerButtons() {
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => checkAnswer(i);
    answerButtons.appendChild(btn);
  }
}
createAnswerButtons();

// プログレスバーを更新する
function updateProgressBar() {
  const percent = Math.floor((currentIndex / TOTAL_PROBLEMS) * 100);
  progressBar.style.width = `${percent}%`;
}

// 問題が終了した後の処理
function endGame() {
  gameScreen.style.display = "none";
  endScreen.style.display = "block";

  const endTime = Date.now();
  const elapsed = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  finalMessage.textContent = `よくがんばったね！！\nぜんぶで ${minutes}ふん${seconds}びょう かかりました！`;
}
