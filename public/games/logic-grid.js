const puzzles = [
  {
    question: "What is the next number in the sequence: 2, 4, 8, 16, ?",
    options: ["20", "24", "32", "64"],
    correct: 2,
    difficulty: "Easy",
    multiplier: 1
  },
  {
    question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
    options: ["Yes", "No", "Sometimes", "Cannot determine"],
    correct: 0,
    difficulty: "Medium",
    multiplier: 1.5
  },
  {
    question: "A function takes 2ms for 10 items. Using O(n²), how long for 20 items?",
    options: ["4ms", "8ms", "16ms", "32ms"],
    correct: 1,
    difficulty: "Medium",
    multiplier: 1.5
  },
  {
    question: "What's the minimum number of swaps to sort [3, 2, 1]?",
    options: ["1", "2", "3", "0"],
    correct: 0,
    difficulty: "Hard",
    multiplier: 2
  },
  {
    question: "In binary, what is 1011 + 0110?",
    options: ["10001", "10101", "11001", "11111"],
    correct: 0,
    difficulty: "Hard",
    multiplier: 2
  },
  {
    question: "A recursive function calls itself n times. Stack space complexity is?",
    options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    correct: 1,
    difficulty: "Medium",
    multiplier: 1.5
  }
];

let gameState = {
  timeLeft: 120,
  score: 0,
  puzzlesSolved: 0,
  currentPuzzleIndex: 0,
  timerInterval: null,
  gameActive: false
};

function startGame() {
  gameState = {
    timeLeft: 120,
    score: 0,
    puzzlesSolved: 0,
    currentPuzzleIndex: 0,
    timerInterval: null,
    gameActive: true
  };
  
  document.getElementById('winScreen').style.display = 'none';
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
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('puzzlesSolved').textContent = gameState.puzzlesSolved;
  
  gameState.timerInterval = setInterval(updateTimer, 1000);
  showPuzzle();
}

function updateTimer() {
  gameState.timeLeft--;
  const timerEl = document.getElementById('timer');
  timerEl.textContent = gameState.timeLeft;
  
  if (gameState.timeLeft <= 30) {
    timerEl.classList.add('timer-warning');
  }
  
  if (gameState.timeLeft <= 0) {
    endGame();
  }
}

function showPuzzle() {
  if (gameState.currentPuzzleIndex >= puzzles.length) {
    endGame();
    return;
  }
  
  const puzzle = puzzles[gameState.currentPuzzleIndex];
  const gameArea = document.getElementById('gameArea');
  
  let html = `
    <div class="question-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 class="question-text" style="margin: 0;">${puzzle.question}</h3>
        <span class="difficulty-badge ${puzzle.difficulty.toLowerCase()}" style="font-size: 0.9rem;">
          ${puzzle.difficulty} (${puzzle.multiplier}x)
        </span>
      </div>
      <div class="options-grid">
  `;
  
  puzzle.options.forEach((option, index) => {
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
  
  const puzzle = puzzles[gameState.currentPuzzleIndex];
  const buttons = document.querySelectorAll('.option-button');
  
  buttons.forEach(btn => btn.disabled = true);
  
  buttons[answerIndex].classList.add(answerIndex === puzzle.correct ? 'option-correct' : 'option-incorrect');
  if (answerIndex !== puzzle.correct) {
    buttons[puzzle.correct].classList.add('option-correct');
  }
  
  if (answerIndex === puzzle.correct) {
    const basePoints = 20;
    const earnedPoints = Math.round(basePoints * puzzle.multiplier);
    
    gameState.score += earnedPoints;
    gameState.puzzlesSolved++;
    
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('puzzlesSolved').textContent = gameState.puzzlesSolved;
  }
  
  setTimeout(() => {
    gameState.currentPuzzleIndex++;
    showPuzzle();
  }, 1500);
}

function endGame() {
  gameState.gameActive = false;
  clearInterval(gameState.timerInterval);
  
  submitScore(gameState.score);
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
        game: 'logic-grid',
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