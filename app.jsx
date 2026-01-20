const { useState, useEffect } = React;

// アプリのメインコンポーネント
function App() {
  const [screen, setScreen] = useState('modeSelect');
  const [mode, setMode] = useState(null);
  const [setting, setSetting] = useState(null);
  const [order, setOrder] = useState('sequential');
  const [problems, setProblems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongProblems, setWrongProblems] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // モード選択画面
  if (screen === 'modeSelect') {
    return (
      <ModeSelectScreen
        onSelectMode={(selectedMode) => {
          setMode(selectedMode);
          setScreen('settingSelect');
        }}
      />
    );
  }

  // 設定選択画面
  if (screen === 'settingSelect') {
    return (
      <SettingSelectScreen
        mode={mode}
        order={order}
        onSelectOrder={(selectedOrder) => setOrder(selectedOrder)}
        onSelectSetting={(selectedSetting, selectedOrder) => {
          try {
            const finalOrder = selectedOrder || order;
            console.log('onSelectSetting called', { selectedSetting, selectedOrder, finalOrder, mode });
            setSetting(selectedSetting);
            const generatedProblems = generateProblems(mode, selectedSetting, finalOrder);
            console.log('Generated problems:', generatedProblems.length);
            if (generatedProblems.length === 0) {
              console.error('No problems generated!');
              alert('問題が生成されませんでした。設定を確認してください。');
              return;
            }
            setProblems(generatedProblems);
            console.log('Setting screen to question');
            setScreen('question');
            setStartTime(Date.now());
            console.log('Screen should be question now');
          } catch (error) {
            console.error('Error in onSelectSetting:', error);
            alert('エラーが発生しました: ' + error.message);
          }
        }}
      />
    );
  }

  // 問題画面
  if (screen === 'question') {
    return (
      <QuestionScreen
        mode={mode}
        problems={problems}
        currentIndex={currentIndex}
        correctCount={correctCount}
        selectedAnswer={selectedAnswer}
        feedback={feedback}
        onAnswerSelect={(answer) => setSelectedAnswer(answer)}
        onAnswerSubmit={(answer) => {
          const problem = problems[currentIndex];
          const isCorrect = checkAnswer(problem, answer, mode);
          
          if (isCorrect) {
            // 一度でも間違えていない場合のみ正解数にカウント
            if (!wrongProblems.has(currentIndex)) {
              setCorrectCount(correctCount + 1);
            }
            setFeedback('correct');
            // 正解音を再生
            const audio = document.getElementById('correct-audio');
            if (audio) {
              audio.currentTime = 0;
              audio.play();
            }
            
            setTimeout(() => {
              if (currentIndex + 1 >= problems.length) {
                setEndTime(Date.now());
                setScreen('result');
              } else {
                setCurrentIndex(currentIndex + 1);
                setSelectedAnswer(null);
                setFeedback(null);
              }
            }, 800);
          } else {
            // 間違えた場合はフラグを立てる
            setWrongProblems(new Set(wrongProblems).add(currentIndex));
            setFeedback('incorrect');
            setTimeout(() => {
              setFeedback(null);
            }, 1000);
          }
        }}
        onBackToModeSelect={() => {
          setScreen('modeSelect');
          setMode(null);
          setSetting(null);
          setProblems([]);
          setCurrentIndex(0);
          setCorrectCount(0);
          setWrongProblems(new Set());
          setStartTime(null);
          setEndTime(null);
          setSelectedAnswer(null);
          setFeedback(null);
        }}
      />
    );
  }

  // 結果画面
  if (screen === 'result') {
    return (
      <ResultScreen
        correctCount={correctCount}
        wrongCount={wrongProblems.size}
        totalCount={problems.length}
        startTime={startTime}
        endTime={endTime}
        onRestart={() => {
          setScreen('modeSelect');
          setMode(null);
          setSetting(null);
          setProblems([]);
          setCurrentIndex(0);
          setCorrectCount(0);
          setWrongProblems(new Set());
          setStartTime(null);
          setEndTime(null);
          setSelectedAnswer(null);
          setFeedback(null);
        }}
      />
    );
  }

  return null;
}

// モード選択画面コンポーネント
function ModeSelectScreen({ onSelectMode }) {
  const handleModeSelect = (mode, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSelectMode(mode);
  };

  return (
    <div className="screen mode-select-screen">
      <h1>けいさんカード</h1>
      <div className="mode-buttons">
        <button 
          className="mode-button" 
          onClick={(e) => handleModeSelect('add', e)}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleModeSelect('add', e);
          }}
        >
          たしざん
        </button>
        <button 
          className="mode-button" 
          onClick={(e) => handleModeSelect('sub', e)}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleModeSelect('sub', e);
          }}
        >
          ひきざん
        </button>
        <button 
          className="mode-button" 
          onClick={(e) => handleModeSelect('mul', e)}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleModeSelect('mul', e);
          }}
        >
          かけざん
        </button>
      </div>
    </div>
  );
}

// 設定選択画面コンポーネント
function SettingSelectScreen({ mode, order, onSelectOrder, onSelectSetting }) {
  // モードに応じてデフォルト値を設定
  const getDefaultSetting = () => {
    if (mode === 'add') return 'noCarry';
    if (mode === 'sub') return 'noBorrow';
    if (mode === 'mul') return 'level2';
    return null;
  };
  
  const [localSetting, setLocalSetting] = useState(getDefaultSetting());

  const handleStart = () => {
    console.log('handleStart called', { localSetting, order });
    if (localSetting !== null) {
      onSelectSetting(localSetting, order);
    } else {
      console.error('localSetting is null');
    }
  };

  return (
    <div className="screen setting-select-screen">
      <h2>せってい</h2>
      
      {/* 出題順の選択 */}
      <div className="setting-group">
        <div className="setting-label">しゅつだいじゅん</div>
        <div className="radio-group">
          <label className={order === 'sequential' ? 'selected' : ''}>
            <input
              type="radio"
              name="order"
              value="sequential"
              checked={order === 'sequential'}
              onChange={(e) => onSelectOrder(e.target.value)}
            />
            ならびじゅん
          </label>
          <label className={order === 'random' ? 'selected' : ''}>
            <input
              type="radio"
              name="order"
              value="random"
              checked={order === 'random'}
              onChange={(e) => onSelectOrder(e.target.value)}
            />
            ランダム
          </label>
        </div>
      </div>

      {/* モード別の設定 */}
      {mode === 'add' && (
        <div className="setting-group">
          <div className="setting-label">たしざんのせってい</div>
          <div className="radio-group">
            <label className={localSetting === 'noCarry' ? 'selected' : ''}>
              <input
                type="radio"
                name="add-setting"
                value="noCarry"
                checked={localSetting === 'noCarry'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              くりあがり なし
            </label>
            <label className={localSetting === 'carry' ? 'selected' : ''}>
              <input
                type="radio"
                name="add-setting"
                value="carry"
                checked={localSetting === 'carry'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              くりあがり あり
            </label>
          </div>
        </div>
      )}

      {mode === 'sub' && (
        <div className="setting-group">
          <div className="setting-label">ひきざんのせってい</div>
          <div className="radio-group">
            <label className={localSetting === 'noBorrow' ? 'selected' : ''}>
              <input
                type="radio"
                name="sub-setting"
                value="noBorrow"
                checked={localSetting === 'noBorrow'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              くりさがり なし
            </label>
            <label className={localSetting === 'borrow' ? 'selected' : ''}>
              <input
                type="radio"
                name="sub-setting"
                value="borrow"
                checked={localSetting === 'borrow'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              くりさがり あり
            </label>
          </div>
        </div>
      )}

      {mode === 'mul' && (
        <div className="setting-group">
          <div className="setting-label">かけざんのせってい</div>
          <div className="radio-group">
            <label className={localSetting === 'level2' ? 'selected' : ''}>
              <input
                type="radio"
                name="mul-setting"
                value="level2"
                checked={localSetting === 'level2'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              2のだん
            </label>
            <label className={localSetting === 'level3' ? 'selected' : ''}>
              <input
                type="radio"
                name="mul-setting"
                value="level3"
                checked={localSetting === 'level3'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              3のだん
            </label>
            <label className={localSetting === 'all' ? 'selected' : ''}>
              <input
                type="radio"
                name="mul-setting"
                value="all"
                checked={localSetting === 'all'}
                onChange={(e) => setLocalSetting(e.target.value)}
              />
              ぜんぶ まぜる
            </label>
          </div>
        </div>
      )}

      <button 
        className="start-button" 
        onClick={(e) => {
          e.preventDefault();
          handleStart();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (localSetting !== null) {
            handleStart();
          }
        }}
        disabled={localSetting === null}
      >
        スタート
      </button>
    </div>
  );
}

// 問題画面コンポーネント
function QuestionScreen({ 
  mode, 
  problems, 
  currentIndex, 
  correctCount,
  selectedAnswer,
  feedback,
  onAnswerSelect,
  onAnswerSubmit,
  onBackToModeSelect
}) {
  const [inputValue, setInputValue] = useState('');

  if (problems.length === 0 || currentIndex >= problems.length) {
    return null;
  }

  const problem = problems[currentIndex];
  const totalProblems = problems.length;
  const progress = ((currentIndex + 1) / totalProblems) * 100;

  // たし算・ひき算：選択式
  if (mode === 'add' || mode === 'sub') {
    const answerOptions = getAnswerOptions(problems, mode);
    
    return (
      <div className="screen question-screen">
        <div className="progress-info">
          {currentIndex + 1} / {totalProblems}
        </div>
        <div className="problem-text">
          {problem.a} {mode === 'add' ? '+' : '-'} {problem.b} = ?
        </div>
        <div className={`answer-buttons-grid ${feedback === 'correct' ? 'correct' : ''} ${feedback === 'incorrect' ? 'incorrect' : ''}`}>
          {answerOptions.map((answer) => (
            <button
              key={answer}
              className={`answer-button ${selectedAnswer === answer ? 'selected' : ''} ${feedback === 'correct' && selectedAnswer === answer ? 'correct-answer' : ''} ${feedback === 'incorrect' && selectedAnswer === answer ? 'incorrect-answer' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                // 正解中の時だけボタンを無効化（間違えた時はすぐに再挑戦可能）
                if (feedback !== 'correct') {
                  onAnswerSelect(answer);
                  onAnswerSubmit(answer);
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 正解中の時だけボタンを無効化（間違えた時はすぐに再挑戦可能）
                if (feedback !== 'correct') {
                  onAnswerSelect(answer);
                  onAnswerSubmit(answer);
                }
              }}
            >
              {answer}
            </button>
          ))}
        </div>
        <div className="feedback-container">
          {feedback === 'correct' && (
            <div className="feedback correct-feedback">⭐ せいかい！</div>
          )}
          {feedback === 'incorrect' && (
            <div className="feedback incorrect-feedback">✕ ざんねん…</div>
          )}
        </div>
      </div>
    );
  }

  // かけ算：入力式
  if (mode === 'mul') {
    return (
      <div className="screen question-screen">
        <div className="progress-info">
          {currentIndex + 1} / {totalProblems}
        </div>
        <div className="problem-text">
          {problem.a} × {problem.b} = ?
        </div>
        <div className="input-answer-container">
          <div className="answer-display">{inputValue || '?'}</div>
          <div className="number-pad">
            {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map((num) => (
              <button
                key={num}
                className="number-button"
                onClick={(e) => {
                  e.preventDefault();
                  if (feedback === null) {
                    setInputValue(inputValue + num.toString());
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (feedback === null) {
                    setInputValue(inputValue + num.toString());
                  }
                }}
              >
                {num}
              </button>
            ))}
            <button
              className="number-button clear-button"
              onClick={(e) => {
                e.preventDefault();
                // 正解中の時だけボタンを無効化（間違えた時はすぐに再挑戦可能）
                if (feedback !== 'correct') {
                  setInputValue('');
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 正解中の時だけボタンを無効化（間違えた時はすぐに再挑戦可能）
                if (feedback !== 'correct') {
                  setInputValue('');
                }
              }}
            >
              クリア
            </button>
            <button
              className="number-button ok-button"
              onClick={(e) => {
                e.preventDefault();
                // 正解中の時だけボタンを無効化（間違えた時はすぐに再挑戦可能）
                if (feedback !== 'correct' && inputValue !== '') {
                  onAnswerSubmit(parseInt(inputValue));
                  setInputValue('');
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 正解中の時だけボタンを無効化（間違えた時はすぐに再挑戦可能）
                if (feedback !== 'correct' && inputValue !== '') {
                  onAnswerSubmit(parseInt(inputValue));
                  setInputValue('');
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
        <div className="feedback-container">
          {feedback === 'correct' && (
            <div className="feedback correct-feedback">⭐ せいかい！</div>
          )}
          {feedback === 'incorrect' && (
            <div className="feedback incorrect-feedback">✕ ざんねん…</div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// 結果画面コンポーネント
function ResultScreen({ correctCount, wrongCount, totalCount, startTime, endTime, onRestart }) {
  const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  let message = 'よくがんばったね！';
  let messageElement = <div>{message}</div>;
  if (wrongCount === 0 && correctCount === totalCount) {
    messageElement = (
      <div>
        <div>ぜんもんせいかい！</div>
        <div>すごいね！</div>
      </div>
    );
  } else if (correctCount >= totalCount * 0.8) {
    message = 'とってもよくできました！';
    messageElement = <div>{message}</div>;
  }

  return (
    <div className="screen result-screen">
      <h1>おわり！</h1>
      <div className="result-content">
        <div className="result-item">
          <div className="result-label">せいかいすう</div>
          <div className="result-value">{correctCount}もん / {totalCount}もん</div>
        </div>
        {wrongCount > 0 && (
          <div className="result-item">
            <div className="result-label">まちがえたすう</div>
            <div className="result-value">{wrongCount}もん</div>
          </div>
        )}
        <div className="result-item">
          <div className="result-label">かかったじかん</div>
          <div className="result-value">{minutes}ふん{seconds}びょう</div>
        </div>
        <div className="encouragement-message">{messageElement}</div>
      </div>
      <div className="result-buttons">
        <button 
          className="result-button" 
          onClick={(e) => {
            e.preventDefault();
            onRestart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRestart();
          }}
        >
          もういちど
        </button>
        <button 
          className="result-button" 
          onClick={(e) => {
            e.preventDefault();
            onRestart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRestart();
          }}
        >
          さいしょにもどる
        </button>
      </div>
    </div>
  );
}

// 問題生成関数
function generateProblems(mode, setting, order) {
  console.log('generateProblems called', { mode, setting, order });
  let problems = [];

  if (mode === 'add') {
    // たし算：1〜9 + 1〜9
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const answer = a + b;
        const carry = answer >= 10;
        
        if ((setting === 'noCarry' && !carry) || (setting === 'carry' && carry)) {
          problems.push({ a, b, answer, carry });
        }
      }
    }
  } else if (mode === 'sub') {
    // ひき算
    if (setting === 'noBorrow') {
      // くりさがりなし：9-8までの問題、答えが0でない
      for (let a = 1; a <= 9; a++) {
        for (let b = 1; b <= 8; b++) {
          if (a > b) { // 答えが0でない
            const borrow = (a % 10) < b;
            if (!borrow) {
              const answer = a - b;
              problems.push({ a, b, answer, borrow });
            }
          }
        }
      }
    } else if (setting === 'borrow') {
      // くりさがりあり：1〜18 - 1〜9（答えが0以上）
      for (let a = 1; a <= 18; a++) {
        for (let b = 1; b <= 9; b++) {
          if (a > b) { // 答えが0でない
            const answer = a - b;
            const borrow = (a % 10) < b;
            if (borrow) {
              problems.push({ a, b, answer, borrow });
            }
          }
        }
      }
    }
  } else if (mode === 'mul') {
    // かけ算
    if (setting === 'level2') {
      // 2のだん（10問：2×1〜2×9、ただし2×0は含めない）
      for (let b = 1; b <= 9; b++) {
        problems.push({ a: 2, b, answer: 2 * b });
      }
    } else if (setting === 'level3') {
      // 3のだん（10問：3×1〜3×9）
      for (let b = 1; b <= 9; b++) {
        problems.push({ a: 3, b, answer: 3 * b });
      }
    } else if (setting === 'all') {
      // ぜんぶまぜる（20問：2のだんと3のだん）
      for (let b = 1; b <= 9; b++) {
        problems.push({ a: 2, b, answer: 2 * b });
      }
      for (let b = 1; b <= 9; b++) {
        problems.push({ a: 3, b, answer: 3 * b });
      }
    }
  }

  // ランダムの場合はシャッフル
  if (order === 'random') {
    shuffle(problems);
  }

  console.log('Generated problems count:', problems.length);
  return problems;
}

// 配列をシャッフル
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// 答えの選択肢を取得（たし算・ひき算用）
function getAnswerOptions(problems, mode) {
  const allAnswers = new Set();
  
  problems.forEach(problem => {
    allAnswers.add(problem.answer);
  });

  return Array.from(allAnswers).sort((a, b) => a - b);
}

// 答えをチェック
function checkAnswer(problem, userAnswer, mode) {
  return problem.answer === userAnswer;
}

// アプリをレンダリング
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    if (ReactDOM.createRoot) {
      // React 18
      const root = ReactDOM.createRoot(rootElement);
      root.render(<App />);
      console.log('React app rendered with createRoot');
    } else {
      // React 17以前のフォールバック
      ReactDOM.render(<App />, rootElement);
      console.log('React app rendered with render');
    }
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}
