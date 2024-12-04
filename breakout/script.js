const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Set canvas size
canvas.width = 480;
canvas.height = 640;

// Game variables
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_SPEED = 8;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_TOP_OFFSET = 60;
const BRICK_LEFT_OFFSET = (canvas.width - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING))) / 2;

// Colors
const COLORS = [
    '#FF6B6B', // Merah
    '#4ECDC4', // Cyan
    '#45B7D1', // Biru Muda
    '#96CEB4', // Hijau Muda
    '#FFEEAD'  // Kuning Muda
];

const PADDLE_GRADIENT = ctx.createLinearGradient(0, 0, PADDLE_WIDTH, 0);
PADDLE_GRADIENT.addColorStop(0, '#4A90E2');   // Biru
PADDLE_GRADIENT.addColorStop(1, '#45B7D1');   // Biru Muda

const BALL_GRADIENT = ctx.createRadialGradient(0, 0, 0, 0, 0, BALL_RADIUS);
BALL_GRADIENT.addColorStop(0, '#FFF');    // Putih di tengah
BALL_GRADIENT.addColorStop(1, '#4A90E2'); // Biru di pinggir

let paddle = {
    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 0,
    color: PADDLE_GRADIENT
};

let ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 5,
    dx: 0,
    dy: 0,
    color: BALL_GRADIENT
};

let bricks = [];
let score = 0;
let lives = 3;
let gameStarted = false;
let rightPressed = false;
let leftPressed = false;
let mouseX = 0;

// Initialize game
createBricks();

// Event listeners
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousemove', mouseMoveHandler);
startButton.addEventListener('click', startGame);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        mouseX = relativeX - PADDLE_WIDTH / 2;
    }
}

function createBricks() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < BRICK_COLS; col++) {
            const brickX = BRICK_LEFT_OFFSET + col * (BRICK_WIDTH + BRICK_PADDING);
            const brickY = BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING);
            bricks[row][col] = {
                x: brickX,
                y: brickY,
                status: 1,
                color: COLORS[row]
            };
        }
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        resetBall();
        startButton.textContent = 'Restart Game';
    } else {
        resetGame();
    }
}

function resetGame() {
    score = 0;
    lives = 3;
    createBricks();
    resetBall();
    updateScore();
    updateLives();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    // Random angle between -45 and 45 degrees
    const angle = (Math.random() * 90 - 45) * Math.PI / 180;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
}

function collisionDetection() {
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.status === 1) {
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + BRICK_WIDTH &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + BRICK_HEIGHT) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;
                    updateScore();
                    
                    if (score === BRICK_ROWS * BRICK_COLS * 10) {
                        showWinScreen();
                        gameStarted = false;
                    }
                }
            }
        }
    }
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

function updateLives() {
    livesElement.textContent = `Lives: ${lives}`;
}

function showWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = '48px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
}

function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = '48px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    ctx.strokeStyle = '#30305a';
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw bricks
    ctx.shadowBlur = 10;
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            if (bricks[row][col].status === 1) {
                const brick = bricks[row][col];
                ctx.shadowColor = brick.color;
                ctx.fillStyle = brick.color;
                
                // Draw main brick
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fill();
                
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT/2);
            }
        }
    }
    ctx.shadowBlur = 0;

    // Draw paddle with gradient
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4A90E2';
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Add highlight to paddle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height/2);
    ctx.shadowBlur = 0;

    // Draw ball with gradient
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#4A90E2';
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw game over or win screen
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 24px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Press Start to Play!', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '16px Poppins';
        ctx.fillText('Use arrow keys or mouse to move the paddle', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function update() {
    if (!gameStarted) return;

    // Move paddle with keyboard
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += PADDLE_SPEED;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= PADDLE_SPEED;
    }

    // Move paddle with mouse
    if (mouseX >= 0 && mouseX <= canvas.width - paddle.width) {
        paddle.x = mouseX;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Ball collision with paddle
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        // Add some randomness to the bounce
        const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.dx = hitPoint * 5;
    }

    // Ball out of bounds
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();
        if (lives === 0) {
            showGameOver();
            gameStarted = false;
        } else {
            resetBall();
        }
    }

    // Check brick collision
    collisionDetection();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
