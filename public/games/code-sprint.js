const questions = [
  {
    question: "What will `console.log(typeof null)` output?",
    options: ["null", "undefined", "object", "number"],
    correct: 2
  },
  {
    question: "What is the output of `3 + '3'` in JavaScript?",
    options: ["6", "33", "Error", "NaN"],
    correct: 1
  },
  {
    question: "Which method adds an element to the end of an array?",
    options: ["push()", "unshift()", "append()", "add()"],
    correct: 0
  },
  {
    question: "What does `===` check in JavaScript?",
    options: ["Value only", "Type only", "Value and type", "Reference"],
    correct: 2
  },
  {
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correct: 1
  },
  {
    question: "Which keyword declares a block-scoped variable?",
    options: ["var", "let", "const", "Both B and C"],
    correct: 3
  },
  {
    question: "What will `[1, 2] + [3, 4]` return in JavaScript?",
    options: ["[1,2,3,4]", "1,23,4", "Error", "[4,6]"],
    correct: 1
  },
  {
    question: "What does SQL stand for?",
    options: ["Simple Query Language", "Structured Query Language", "System Query Logic", "Standard Query List"],
    correct: 1
  },
  {
    question: "Which HTTP method is idempotent?",
    options: ["POST", "GET", "PATCH", "DELETE"],
    correct: 1
  },
  {
    question: "What is the output of `console.log([] == [])`?",
    options: ["true", "false", "Error", "undefined"],
    correct: 1
  }
];

let gameState = {
  timeLeft: 60,
  score: 0,
  currentQuestionIndex: 0,
  timerInterval: null,
  gameActive: false
};

function startGame() {
  // Reset game state
  gameState = {
    timeLeft: 60,
    score: 0,
    currentQuestionIndex: 0,
    timerInterval: null,
    gameActive: true
  };
  
  // Hide win screen
  document.getElementById('winScreen').style.display = 'none';
  
  // Show countdown
  showCountdown();
}

function showCountdown() {
  const overlay = document.getElementById('countdownOverlay');
  const number = document.getElementById('countdownNumber');
  
  overlay.style.display = 'flex';
  let count = 3;
  
  const countdownInterval = setInterval(() => {
    if (count === 0) {
      clearInterval(countdownInterval);
      overlay.style.display = 'none';
      startActualGame();
    } else {
      number.textContent = count;
      count--;
    }
  }, 1000);
}

function startActualGame() {
  // Update UI
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('totalQuestions').textContent = questions.length;
  
  // Start timer
  gameState.timerInterval = setInterval(updateTimer, 1000);
  
  // Show first question
  showQuestion();
}

function updateTimer() {
  gameState.timeLeft--;
  const timerEl = document.getElementById('timer');
  timerEl.textContent = gameState.timeLeft;
  
  if (gameState.timeLeft <= 10) {
    timerEl.classList.add('timer-warning');
  }
  
  if (gameState.timeLeft <= 0) {
    endGame();
  }
}

function showQuestion() {
  if (gameState.currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }
  
  const question = questions[gameState.currentQuestionIndex];
  const gameArea = document.getElementById('gameArea');
  
  document.getElementById('currentQuestion').textContent = gameState.currentQuestionIndex + 1;
  
  let html = `
    <div class="question-card">
      <h3 class="question-text">${question.question}</h3>
      <div class="options-grid">
  `;
  
  question.options.forEach((option, index) => {
    html += `
      <button class="option-button" onclick="selectAnswer(${index})">
        ${String.fromCharCode(65 + index)}. ${option}
      </button>
    `;
  });
  
  html += `
      </div>
    </div>
  `;
  
  gameArea.innerHTML = html;
}

function selectAnswer(answerIndex) {
  if (!gameState.gameActive) return;
  
  const question = questions[gameState.currentQuestionIndex];
  const buttons = document.querySelectorAll('.option-button');
  
  // Disable all buttons
  buttons.forEach(btn => btn.disabled = true);
  
  // Show correct/incorrect
  buttons[answerIndex].classList.add(answerIndex === question.correct ? 'option-correct' : 'option-incorrect');
  if (answerIndex !== question.correct) {
    buttons[question.correct].classList.add('option-correct');
  }
  
  // Update score
  if (answerIndex === question.correct) {
    gameState.score += 10;
    document.getElementById('score').textContent = gameState.score;
  }
  
  // Move to next question after delay
  setTimeout(() => {
    gameState.currentQuestionIndex++;
    showQuestion();
  }, 1000);
}

function endGame() {
  gameState.gameActive = false;
  clearInterval(gameState.timerInterval);
  
  // Submit score
  submitScore(gameState.score);
  
  // Show win screen with confetti
  showWinScreen();
  createConfetti();
}

function showWinScreen() {
  const winScreen = document.getElementById('winScreen');
  const finalScore = document.getElementById('finalScore');
  
  finalScore.textContent = gameState.score;
  winScreen.style.display = 'flex';
}

function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

async function submitScore(score) {
  try {
    const response = await fetch('/api/games/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        game: 'code-sprint',
        score: score
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Score submitted! Your rank:', data.rank);
    }
  } catch (error) {
    console.error('Error submitting score:', error);
  }
}