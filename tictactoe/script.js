const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const status = document.getElementById('status');
const restartButton = document.getElementById('restart');
const X_CLASS = 'x';
const O_CLASS = 'o';
let xIsNext = true;
let gameActive = true;

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

startGame();

function startGame() {
    xIsNext = true;
    gameActive = true;
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winning');
        cell.textContent = '';
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    updateStatus();
}

function handleClick(e) {
    if (!gameActive) return;
    
    const cell = e.target;
    const currentClass = xIsNext ? X_CLASS : O_CLASS;
    
    placeMark(cell, currentClass);
    
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        updateStatus();
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
    cell.textContent = currentClass === X_CLASS ? 'X' : 'O';
}

function swapTurns() {
    xIsNext = !xIsNext;
}

function updateStatus() {
    status.textContent = `Player ${xIsNext ? 'X' : 'O'}'s Turn`;
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        const win = combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
        if (win) {
            combination.forEach(index => {
                cells[index].classList.add('winning');
            });
        }
        return win;
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function endGame(draw) {
    gameActive = false;
    if (draw) {
        status.textContent = 'Draw!';
    } else {
        status.textContent = `Player ${xIsNext ? 'X' : 'O'} Wins!`;
    }
}

restartButton.addEventListener('click', startGame);
