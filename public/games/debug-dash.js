let challenges = [];
let editor = null;

let gameState = {
  timeLeft: 150,
  score: 0,
  currentChallengeIndex: 0,
  timerInterval: null,
  gameActive: false
};

async function loadChallenges() {
  try {
    const response = await fetch('/api/games/debug-challenges', { credentials: 'same-origin' });

    if (response.status === 401) {
      // Not authenticated — redirect to login page
      // Use same route used elsewhere (server maps /login)
      window.location.href = '/login';
      return false;
    }

    const data = await response.json();
    
    if (data.success) {
      challenges = data.challenges.slice(0, 5); // Limit to 5
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error loading challenges:', error);
    return false;
  }
}

async function startGame() {
  // Load challenges first
  const loaded = await loadChallenges();
  if (!loaded || challenges.length === 0) {
    alert('Failed to load challenges. Please try again.');
    return;
  }
  
  // Reset game state
  gameState = {
    timeLeft: 150,
    score: 0,
    currentChallengeIndex: 0,
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
  document.getElementById('currentChallenge').textContent = gameState.currentChallengeIndex + 1;
  
  gameState.timerInterval = setInterval(updateTimer, 1000);
  showChallenge();
}

function updateTimer() {
  gameState.timeLeft--;
  const timerEl = document.getElementById('timer');
  timerEl.textContent = gameState.timeLeft;
  
  if (gameState.timeLeft <= 20) {
    timerEl.classList.add('timer-warning');
  }
  
  if (gameState.timeLeft <= 0) {
    endGame();
  }
}

function showChallenge() {
  if (gameState.currentChallengeIndex >= challenges.length) {
    endGame();
    return;
  }
  
  const challenge = challenges[gameState.currentChallengeIndex];
  const gameArea = document.getElementById('gameArea');
  
  let html = `
    <div class="challenge-description">
      <h3>${challenge.title}</h3>
      <p>${challenge.description}</p>
      <p><strong>Your task:</strong> Fix the bug and make the code produce the correct output.</p>
    </div>
    
    <div class="editor-container">
      <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Code Editor:</label>
      <textarea id="codeEditor"></textarea>
    </div>
    
    <div class="button-group">
      <button onclick="runCode()" class="btn btn-primary">▶ Run Code</button>
      <button onclick="resetCode()" class="btn btn-secondary">↻ Reset</button>
    </div>
    
    <div class="output-section">
      <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Output:</label>
      <div id="output" class="output-box">Click "Run Code" to see the output...</div>
    </div>
  `;
  
  gameArea.innerHTML = html;
  
  // Initialize CodeMirror
  const textarea = document.getElementById('codeEditor');
  editor = CodeMirror.fromTextArea(textarea, {
    mode: 'javascript',
    theme: 'monokai',
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
    lineWrapping: true
  });
  
  editor.setValue(challenge.starter_code);
}

function resetCode() {
  if (editor && gameState.currentChallengeIndex < challenges.length) {
    const challenge = challenges[gameState.currentChallengeIndex];
    editor.setValue(challenge.starter_code);
    document.getElementById('output').textContent = 'Click "Run Code" to see the output...';
    document.getElementById('output').className = 'output-box';
  }
}

async function runCode() {
  if (!gameState.gameActive || !editor) return;
  
  const code = editor.getValue();
  const challenge = challenges[gameState.currentChallengeIndex];
  const outputEl = document.getElementById('output');
  
  outputEl.textContent = 'Running...';
  outputEl.className = 'output-box';
  
  try {
    const response = await fetch('/api/games/run', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        challengeId: challenge.id
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.error) {
        outputEl.textContent = `Error: ${data.error}`;
        outputEl.className = 'output-box output-incorrect';
      } else if (data.isCorrect) {
        outputEl.textContent = `✓ Correct!\n\nYour Output:\n${data.output}\n\nExpected:\n${data.expectedOutput}`;
        outputEl.className = 'output-box output-correct';
        
        // Add points
        gameState.score += data.points;
        document.getElementById('score').textContent = gameState.score;
        
        // Move to next challenge after delay
        setTimeout(() => {
          gameState.currentChallengeIndex++;
          document.getElementById('currentChallenge').textContent = gameState.currentChallengeIndex + 1;
          showChallenge();
        }, 2000);
      } else {
        outputEl.textContent = `✗ Incorrect\n\nYour Output:\n${data.output || '(empty)'}\n\nExpected:\n${data.expectedOutput}\n\nTry again!`;
        outputEl.className = 'output-box output-incorrect';
      }
    }
  } catch (error) {
    console.error('Error running code:', error);
    outputEl.textContent = `Error: ${error.message}`;
    outputEl.className = 'output-box output-incorrect';
  }
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
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        game: 'debug-dash',
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