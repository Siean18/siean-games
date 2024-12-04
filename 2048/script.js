const grid = document.getElementById('grid');
const gameOverModal = document.getElementById('game-over');
const victoryModal = document.getElementById('victory');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const finalScoreElement = document.getElementById('final-score');

let board = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let gameHistory = [];
let won = false;

// Initialize game
function init() {
  board = Array(4).fill().map(() => Array(4).fill(0));
  score = 0;
  won = false;
  gameHistory = [];
  updateScore();
  addNewTile();
  addNewTile();
  updateBoard();
}

// Save game state for undo
function saveGameState() {
  gameHistory.push({
    board: board.map(row => [...row]),
    score: score
  });
  // Keep only last 10 moves
  if (gameHistory.length > 10) {
    gameHistory.shift();
  }
}

// Undo last move
function undo() {
  if (gameHistory.length === 0) return;
  
  const lastState = gameHistory.pop();
  board = lastState.board;
  score = lastState.score;
  updateScore();
  updateBoard();
}

function addNewTile() {
  let emptyCells = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 0) emptyCells.push({ row, col });
    }
  }
  if (emptyCells.length > 0) {
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() > 0.1 ? 2 : 4;
    
    // Add new tile with animation
    const tile = document.createElement('div');
    tile.className = 'tile new';
    tile.textContent = board[row][col];
    tile.dataset.value = board[row][col];
    
    const left = col * 115 + 15;
    const top = row * 115 + 15;
    
    tile.style.left = `${left}px`;
    tile.style.top = `${top}px`;
    
    grid.appendChild(tile);
  }
}

function updateBoard() {
  grid.innerHTML = '';
  
  // Create grid cells (background)
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    grid.appendChild(cell);
  }

  // Create and position tiles
  board.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.textContent = value;
        tile.dataset.value = value;
        
        // Calculate position
        const left = colIndex * 115 + 15; // 100px tile + 15px gap
        const top = rowIndex * 115 + 15;  // 100px tile + 15px gap
        
        tile.style.left = `${left}px`;
        tile.style.top = `${top}px`;
        
        grid.appendChild(tile);
      }
    });
  });
}

function updateScore() {
  scoreElement.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
  }
  bestScoreElement.textContent = bestScore;
}

function slideRow(row) {
  const filtered = row.filter(num => num);
  const missing = 4 - filtered.length;
  // Mengubah urutan array agar sesuai dengan arah yang benar
  return filtered.concat(Array(missing).fill(0));
}

function combineRow(row) {
  for (let i = 3; i > 0; i--) {
    if (row[i] && row[i] === row[i - 1]) {
      row[i] *= 2;
      score += row[i];
      row[i - 1] = 0;
      const tile = document.querySelector(`[data-value="${row[i]}"]`);
      if (tile) tile.classList.add('merged');
      
      if (row[i] === 2048 && !won) {
        won = true;
        showVictoryScreen();
      }
    }
  }
  return row;
}

function moveLeft() {
  let moved = false;
  for (let row = 0; row < 4; row++) {
    let newRow = slideRow(board[row]);
    newRow = combineRow(newRow);
    newRow = slideRow(newRow);
    if (newRow.toString() !== board[row].toString()) moved = true;
    board[row] = newRow;
  }
  return moved;
}

function rotateBoardClockwise() {
  board = board[0].map((_, i) => board.map(row => row[i]).reverse());
}

function rotateBoardCounterClockwise() {
  board = board[0].map((_, i) => board.map(row => row[3 - i]));
}

function move(direction) {
  saveGameState();
  let moved = false;

  // Menyesuaikan rotasi board untuk arah yang benar
  if (direction === 1) rotateBoardCounterClockwise(); // Up
  if (direction === 2) rotateBoardClockwise(), rotateBoardClockwise(); // Right
  if (direction === 3) rotateBoardClockwise(); // Down

  moved = moveLeft();

  // Mengembalikan rotasi board ke posisi semula
  if (direction === 1) rotateBoardClockwise(); // Undo Up
  if (direction === 2) rotateBoardClockwise(), rotateBoardClockwise(); // Undo Right
  if (direction === 3) rotateBoardCounterClockwise(); // Undo Down

  if (moved) {
    // Wait for animations to complete before adding new tile
    setTimeout(() => {
      addNewTile();
      if (isGameOver()) showGameOverScreen();
    }, 150); // Match the CSS transition duration
    
    updateBoard();
    updateScore();
  }
}

function isGameOver() {
  // Check for empty cells
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col] === 0) return false;
    }
  }

  // Check for possible merges
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const current = board[row][col];
      // Check right
      if (col < 3 && current === board[row][col + 1]) return false;
      // Check down
      if (row < 3 && current === board[row + 1][col]) return false;
    }
  }

  return true;
}

function showGameOverScreen() {
  finalScoreElement.textContent = score;
  gameOverModal.classList.remove('hidden');
}

function showVictoryScreen() {
  victoryModal.classList.remove('hidden');
}

function hideModals() {
  gameOverModal.classList.add('hidden');
  victoryModal.classList.add('hidden');
}

// Event Listeners
document.addEventListener('keydown', event => {
  if (event.key.startsWith('Arrow') || 'wasd'.includes(event.key.toLowerCase())) {
    event.preventDefault();
    const key = event.key.toLowerCase();
    switch (key) {
      case 'arrowleft':
      case 'a':
        move(0);
        break;
      case 'arrowup':
      case 'w':
        move(1);
        break;
      case 'arrowright':
      case 'd':
        move(2);
        break;
      case 'arrowdown':
      case 's':
        move(3);
        break;
    }
  }
});

document.getElementById('new-game').addEventListener('click', () => {
  init();
  hideModals();
});

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('restart').addEventListener('click', () => {
  init();
  hideModals();
});
document.getElementById('continue').addEventListener('click', hideModals);
document.getElementById('restart-victory').addEventListener('click', () => {
  init();
  hideModals();
});

// Initialize game
init();
