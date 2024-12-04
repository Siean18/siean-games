const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

// Set canvas size
canvas.width = 320;
canvas.height = 480;

// Game variables
const GRAVITY = 0.35;  // Kurangi gravitasi (sebelumnya 0.5)
const FLAP_SPEED = -7; // Kurangi kecepatan lompat (sebelumnya -8)
const PIPE_SPEED = 1.5; // Kurangi kecepatan pipa (sebelumnya 2)
const PIPE_SPAWN_INTERVAL = 2000; // Tambah interval spawn (sebelumnya 1500)
const PIPE_GAP = 180; // Perbesar celah pipa (sebelumnya 150)
const PIPE_WIDTH = 52;

let bird = {
    x: canvas.width / 3,
    y: canvas.height / 2,
    velocity: 0,
    width: 30,
    height: 30,
    color: '#FFD700' // Gold color for bird
};

let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameStarted = false;
let gameOver = false;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) {
            startGame();
        }
        flap();
    }
});

canvas.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    }
    flap();
});

startButton.addEventListener('click', () => {
    if (!gameStarted || gameOver) {
        resetGame();
        startGame();
    }
});

function startGame() {
    gameStarted = true;
    gameOver = false;
    startButton.textContent = 'Restart Game';
    spawnPipe();
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    updateScore();
}

function flap() {
    if (gameOver) return;
    bird.velocity = FLAP_SPEED;
}

function spawnPipe() {
    if (!gameStarted || gameOver) return;

    const minHeight = 50;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    // Batasi ketinggian pipa agar tidak terlalu ekstrim
    const height = Math.floor(Math.random() * (maxHeight - minHeight) * 0.7 + minHeight);

    pipes.push({
        x: canvas.width,
        topHeight: height,
        bottomY: height + PIPE_GAP,
        passed: false,
        color: '#32CD32' // Lime green color for pipes
    });

    setTimeout(spawnPipe, PIPE_SPAWN_INTERVAL);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

function checkCollision(pipe) {
    const birdRight = bird.x + bird.width;
    const birdBottom = bird.y + bird.height;

    // Check collision with top pipe
    if (birdRight > pipe.x && bird.x < pipe.x + PIPE_WIDTH &&
        bird.y < pipe.topHeight) {
        return true;
    }

    // Check collision with bottom pipe
    if (birdRight > pipe.x && bird.x < pipe.x + PIPE_WIDTH &&
        birdBottom > pipe.bottomY) {
        return true;
    }

    return false;
}

function update() {
    if (!gameStarted) return;

    // Update bird
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Check boundaries
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    if (bird.y + bird.height > canvas.height) {
        gameOver = true;
    }

    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;

        // Check collision
        if (checkCollision(pipe)) {
            gameOver = true;
        }

        // Score point
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.passed = true;
            score++;
            updateScore();
        }
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    pipes.forEach(pipe => {
        ctx.fillStyle = pipe.color;
        // Draw top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, canvas.height - pipe.bottomY);
    });

    // Draw bird
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(Math.min(Math.max(bird.velocity * 0.04, -0.5), 0.5));
    ctx.fillStyle = bird.color;
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    ctx.restore();

    // Draw game over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize high score
highScoreElement.textContent = `High Score: ${highScore}`;

// Start game loop
gameLoop();
