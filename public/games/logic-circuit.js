let circuits = [];
let gameState = {
  timeLeft: 120,
  score: 0,
  currentCircuitIndex: 0,
  timerInterval: null,
  gameActive: false,
  slots: []
};

// Gate definitions
const gateIcons = {
  'AND': '&',
  'OR': '∨',
  'NOT': '¬',
  'XOR': '⊕'
};

// Truth table inputs
const truthTableInputs = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
];

async function loadCircuits() {
  try {
    const response = await fetch('/api/games/logic-circuits');
    const data = await response.json();
    
    if (data.success && data.circuits && data.circuits.length > 0) {
      circuits = data.circuits.slice(0, 5);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error loading circuits:', error);
    return false;
  }
}

async function startGame() {
  const loaded = await loadCircuits();
  if (!loaded || circuits.length === 0) {
    alert('Failed to load puzzles. Please try again.');
    return;
  }
  
  gameState = {
    timeLeft: 120,
    score: 0,
    currentCircuitIndex: 0,
    timerInterval: null,
    gameActive: true,
    slots: []
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
  document.getElementById('currentPuzzle').textContent = gameState.currentCircuitIndex + 1;
  
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
  if (gameState.currentCircuitIndex >= circuits.length) {
    endGame();
    return;
  }
  
  const circuit = circuits[gameState.currentCircuitIndex];
  
  // Data is already parsed from backend
  const availableGates = circuit.available_gates;
  const expectedOutput = circuit.expected_output;
  const correctSequence = circuit.correct_sequence;
  
  // Initialize slots based on correct sequence length
  gameState.slots = new Array(correctSequence.length).fill(null);
  
  const gameArea = document.getElementById('gameArea');
  
  let html = `
    <div class="circuit-puzzle">
      <div class="puzzle-description">
        <h3>${circuit.title}</h3>
        <p>${circuit.description}</p>
      </div>
      
      <div class="truth-table-section">
        <h4>🎯 Target Truth Table</h4>
        <table class="truth-table">
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  truthTableInputs.forEach((inputs, idx) => {
    html += `
      <tr>
        <td>${inputs[0]}</td>
        <td>${inputs[1]}</td>
        <td class="output-col">${expectedOutput[idx]}</td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
      
      <div class="gate-bank-section">
        <h4>🔧 Available Gates (Drag to Circuit)</h4>
        <div class="gate-bank">
  `;
  
  availableGates.forEach(gate => {
    html += `
      <div class="gate" draggable="true" data-gate="${gate}">
        <div class="gate-icon">${gateIcons[gate]}</div>
        <div class="gate-label">${gate}</div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
      
      <div class="circuit-slots-section">
        <h4>⚡ Build Your Circuit</h4>
        <div class="circuit-flow">
          <div class="circuit-input">A, B</div>
          <div class="arrow-icon">→</div>
  `;
  
  for (let i = 0; i < correctSequence.length; i++) {
    html += `
      <div class="drop-slot" data-slot-index="${i}">
        <div class="slot-content">
          <div class="slot-placeholder">Drop Gate Here</div>
        </div>
      </div>
    `;
    if (i < correctSequence.length - 1) {
      html += '<div class="arrow-icon">→</div>';
    }
  }
  
  html += `
          <div class="arrow-icon">→</div>
          <div class="circuit-output">Output</div>
        </div>
      </div>
      
      <div class="submit-section">
        <button onclick="submitCircuit()" class="btn btn-primary btn-large">Submit Circuit</button>
        <button onclick="resetCircuit()" class="btn btn-secondary" style="margin-left: 1rem;">Reset</button>
      </div>
      
      <div id="resultDisplay"></div>
    </div>
  `;
  
  gameArea.innerHTML = html;
  
  // Setup drag and drop
  setupDragAndDrop();
}

function setupDragAndDrop() {
  const gates = document.querySelectorAll('.gate');
  const slots = document.querySelectorAll('.drop-slot');
  
  gates.forEach(gate => {
    gate.addEventListener('dragstart', handleDragStart);
    gate.addEventListener('dragend', handleDragEnd);
  });
  
  slots.forEach(slot => {
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('dragleave', handleDragLeave);
    slot.addEventListener('drop', handleDrop);
  });
}

let draggedGate = null;

function handleDragStart(e) {
  draggedGate = e.target.dataset.gate;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/html', e.target.innerHTML);
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'copy';
  e.currentTarget.classList.add('drag-over');
  return false;
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  e.preventDefault();
  
  const slot = e.currentTarget;
  const slotIndex = parseInt(slot.dataset.slotIndex);
  
  slot.classList.remove('drag-over');
  
  if (draggedGate) {
    // Update slot visual
    slot.classList.add('filled');
    slot.innerHTML = `
      <div class="slot-content">
        <div class="slot-gate">${gateIcons[draggedGate]}</div>
        <div class="slot-label">${draggedGate}</div>
      </div>
      <button class="remove-gate" onclick="removeGate(${slotIndex})">×</button>
    `;
    
    // Update game state
    gameState.slots[slotIndex] = draggedGate;
    draggedGate = null;
  }
  
  return false;
}

function removeGate(slotIndex) {
  const slot = document.querySelector(`[data-slot-index="${slotIndex}"]`);
  slot.classList.remove('filled');
  slot.innerHTML = `
    <div class="slot-content">
      <div class="slot-placeholder">Drop Gate Here</div>
    </div>
  `;
  
  gameState.slots[slotIndex] = null;
  
  // Re-setup drag and drop
  setupDragAndDrop();
}

function resetCircuit() {
  gameState.slots = new Array(gameState.slots.length).fill(null);
  showPuzzle();
}

async function submitCircuit() {
  if (!gameState.gameActive) return;
  
  // Check if all slots filled
  if (gameState.slots.some(slot => slot === null)) {
    alert('Please fill all gate slots before submitting!');
    return;
  }
  
  const circuit = circuits[gameState.currentCircuitIndex];
  const resultDiv = document.getElementById('resultDisplay');
  
  try {
    const response = await fetch('/api/games/validate-circuit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        circuitId: circuit.id,
        playerSequence: gameState.slots
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (data.isCorrect) {
        gameState.score += data.points;
        document.getElementById('score').textContent = gameState.score;
        
        resultDiv.innerHTML = `
          <div class="result-display correct">
            <h3>✓ Correct!</h3>
            <p class="result-message">Perfect! You earned ${data.points} points!</p>
            <button onclick="nextPuzzle()" class="btn btn-primary next-button">Next Puzzle →</button>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div class="result-display incorrect">
            <h3>✗ Incorrect</h3>
            <p class="result-message">That sequence doesn't produce the target output. Try again!</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error validating circuit:', error);
    alert('Error validating your solution. Please try again.');
  }
}

function nextPuzzle() {
  gameState.currentCircuitIndex++;
  document.getElementById('currentPuzzle').textContent = gameState.currentCircuitIndex + 1;
  showPuzzle();
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
        game: 'logic-circuit',
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