const holes = document.querySelectorAll('.hole');
const moles = document.querySelectorAll('.mole');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const highScoreDisplay = document.getElementById('high-score');
const startButton = document.getElementById('startButton');

let score = 0;
let timeLeft = 30;
let highScore = localStorage.getItem('whackamoleHighScore') || 0;
let gameTimer;
let moleTimer;
let isPlaying = false;

// Initialize high score display
highScoreDisplay.textContent = `High Score: ${highScore}`;

// Add click listeners to moles
moles.forEach(mole => {
    mole.addEventListener('click', whack);
});

// Start button listener
startButton.addEventListener('click', startGame);

function startGame() {
    if (isPlaying) return;
    
    isPlaying = true;
    score = 0;
    timeLeft = 30;
    updateScore();
    updateTime();
    startButton.textContent = 'Game in Progress';
    startButton.disabled = true;

    // Start the game loop
    gameTimer = setInterval(() => {
        timeLeft--;
        updateTime();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Start spawning moles
    spawnMole();
}

function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    clearTimeout(moleTimer);
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('whackamoleHighScore', highScore);
        highScoreDisplay.textContent = `High Score: ${highScore}`;
    }

    // Reset all moles
    moles.forEach(mole => {
        mole.classList.remove('active');
        mole.classList.remove('bonked');
    });

    startButton.textContent = 'Start Game';
    startButton.disabled = false;
}

function spawnMole() {
    if (!isPlaying) return;

    // Hide all moles
    moles.forEach(mole => {
        mole.classList.remove('active');
        mole.classList.remove('bonked');
    });

    // Pick a random hole
    const randomHole = Math.floor(Math.random() * holes.length);
    const mole = moles[randomHole];
    
    // Show mole
    mole.classList.add('active');

    // Set random time for mole to hide
    const minTime = 500;
    const maxTime = 1500;
    const time = Math.random() * (maxTime - minTime) + minTime;

    moleTimer = setTimeout(() => {
        mole.classList.remove('active');
        if (isPlaying) spawnMole();
    }, time);
}

function whack(e) {
    if (!isPlaying) return;
    
    const mole = e.target;
    if (!mole.classList.contains('active') || mole.classList.contains('bonked')) return;

    score += 10;
    updateScore();
    
    // Visual feedback
    mole.classList.add('bonked');
    mole.classList.remove('active');
    
    // Sound effect could be added here
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateTime() {
    timeDisplay.textContent = `Time: ${timeLeft}s`;
}
