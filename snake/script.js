// Setup canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

// Game state
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameSpeed = 100;
let isPaused = false;

// Snake
let snake = [{x: 10, y: 10}];
let direction = "RIGHT";

// Food types
const foodTypes = {
    normal: { color: "#FF0000", points: 1, chance: 0.7 },
    special: { color: "#FFD700", points: 3, chance: 0.2 },
    super: { color: "#FF00FF", points: 5, chance: 0.1 }
};

// Food
let food = generateFood();

// Game loop
let gameInterval = setInterval(gameLoop, gameSpeed);

// Handle keypresses
document.addEventListener("keydown", handleKeyPress);

// Game loop function
function gameLoop() {
    if (isPaused) return;
    
    if (gameOver()) {
        clearInterval(gameInterval);
        updateHighScore();
        alert("Game Over! Your score: " + score);
        resetGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    drawFood();
    updateScore();
}

// Move snake based on the current direction
function moveSnake() {
    const head = { ...snake[0] };

    if (direction === "LEFT") head.x -= 1;
    if (direction === "UP") head.y -= 1;
    if (direction === "RIGHT") head.x += 1;
    if (direction === "DOWN") head.y += 1;

    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += food.points;
        food = generateFood();
        increaseSpeed();
    } else {
        snake.pop();
    }
}

// Draw snake on canvas
function drawSnake() {
    snake.forEach((segment, index) => {
        // Head color different from body
        ctx.fillStyle = index === 0 ? "#00FF00" : "#008000";
        ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
        
        // Add eyes to the head
        if (index === 0) {
            ctx.fillStyle = "#000";
            const eyeSize = scale / 6;
            // Position eyes based on direction
            if (direction === "RIGHT" || direction === "LEFT") {
                ctx.fillRect((segment.x * scale) + scale * 0.7, (segment.y * scale) + scale * 0.3, eyeSize, eyeSize);
                ctx.fillRect((segment.x * scale) + scale * 0.7, (segment.y * scale) + scale * 0.6, eyeSize, eyeSize);
            } else {
                ctx.fillRect((segment.x * scale) + scale * 0.3, (segment.y * scale) + scale * 0.7, eyeSize, eyeSize);
                ctx.fillRect((segment.x * scale) + scale * 0.6, (segment.y * scale) + scale * 0.7, eyeSize, eyeSize);
            }
        }
    });
}

// Draw food on canvas
function drawFood() {
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(
        (food.x * scale) + scale/2,
        (food.y * scale) + scale/2,
        scale/2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Generate random food position and type
function generateFood() {
    const x = Math.floor(Math.random() * columns);
    const y = Math.floor(Math.random() * rows);
    
    // Determine food type based on chance
    const rand = Math.random();
    let foodType;
    if (rand < foodTypes.normal.chance) foodType = foodTypes.normal;
    else if (rand < foodTypes.normal.chance + foodTypes.special.chance) foodType = foodTypes.special;
    else foodType = foodTypes.super;

    return {
        x,
        y,
        color: foodType.color,
        points: foodType.points
    };
}

// Handle key presses for direction and pause
function handleKeyPress(event) {
    // Pause game
    if (event.key === "p" || event.key === "P") {
        isPaused = !isPaused;
        return;
    }

    if (isPaused) return;

    // Movement
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
}

// Check if the game is over
function gameOver() {
    const head = snake[0];

    // Check for collision with walls
    if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
        return true;
    }

    // Check for collision with itself
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Update score display
function updateScore() {
    document.getElementById("scoreValue").textContent = score;
    document.getElementById("highScoreValue").textContent = highScore;
}

// Update high score
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHighScore", highScore);
    }
}

// Increase game speed as score increases
function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 2;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// Reset game
function resetGame() {
    snake = [{x: 10, y: 10}];
    direction = "RIGHT";
    score = 0;
    gameSpeed = 100;
    food = generateFood();
    isPaused = false;
    gameInterval = setInterval(gameLoop, gameSpeed);
    updateScore();
}
