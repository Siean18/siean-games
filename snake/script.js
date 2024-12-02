// Setup canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game settings
const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

// Snake
let snake = [{x: 10, y: 10}];
let direction = "RIGHT";

// Food
let food = generateFood();

// Game loop
let gameInterval = setInterval(game, 100);

// Handle keypresses
document.addEventListener("keydown", changeDirection);

// Game logic
function game() {
    if (gameOver()) {
        clearInterval(gameInterval);
        alert("Game Over!");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveSnake();
    drawSnake();
    drawFood();
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
        food = generateFood();  // Generate new food
    } else {
        snake.pop();  // Remove the tail if no food is eaten
    }
}

// Draw snake on canvas
function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
    });
}

// Draw food on canvas
function drawFood() {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
}

// Generate random food position
function generateFood() {
    const x = Math.floor(Math.random() * columns);
    const y = Math.floor(Math.random() * rows);
    return {x, y};
}

// Change direction based on user input
function changeDirection(event) {
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
