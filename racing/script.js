class RacingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;

        // Game state
        this.isPlaying = false;
        this.score = 0;
        this.speed = 0;
        this.distance = 0;
        this.roadSpeed = 5;
        this.maxSpeed = 15;
        this.acceleration = 0.1;
        this.deceleration = 0.05;
        this.boosting = false;

        // Player car
        this.playerCar = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            width: 40,
            height: 70,
            speed: 5
        };

        // Road lines
        this.roadLines = [];
        this.initRoadLines();

        // Obstacles
        this.obstacles = [];
        this.obstacleSpeed = 5;
        this.obstacleSpawnRate = 0.02;

        // Controls
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };

        // UI elements
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.distanceElement = document.getElementById('distance');
        this.startBtn = document.getElementById('startBtn');

        // Event listeners
        this.setupEventListeners();
    }

    initRoadLines() {
        const lineCount = 5;
        const lineSpacing = this.canvas.height / lineCount;
        for (let i = 0; i < lineCount; i++) {
            this.roadLines.push({
                x: this.canvas.width / 2 - 2,
                y: i * lineSpacing,
                width: 4,
                height: 30
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.startBtn.addEventListener('click', () => this.startGame());
    }

    handleKeyDown(e) {
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = true;
        }
    }

    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.code)) {
            this.keys[e.code] = false;
        }
    }

    startGame() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.score = 0;
            this.speed = this.roadSpeed;
            this.distance = 0;
            this.obstacles = [];
            this.startBtn.textContent = 'Restart Game';
            this.gameLoop();
        } else {
            window.location.reload();
        }
    }

    updateGame() {
        if (!this.isPlaying) return;

        // Update speed and distance
        if (this.keys.Space && this.speed < this.maxSpeed) {
            this.speed += this.acceleration;
            this.boosting = true;
        } else if (this.speed > this.roadSpeed) {
            this.speed -= this.deceleration;
            this.boosting = false;
        }

        this.distance += this.speed;
        this.score = Math.floor(this.distance / 10);

        // Move player car
        if (this.keys.ArrowLeft && this.playerCar.x > 0) {
            this.playerCar.x -= this.playerCar.speed;
        }
        if (this.keys.ArrowRight && this.playerCar.x < this.canvas.width - this.playerCar.width) {
            this.playerCar.x += this.playerCar.speed;
        }

        // Update road lines
        this.roadLines.forEach(line => {
            line.y += this.speed;
            if (line.y > this.canvas.height) {
                line.y = -line.height;
            }
        });

        // Spawn and update obstacles
        if (Math.random() < this.obstacleSpawnRate) {
            this.spawnObstacle();
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += this.obstacleSpeed;
            return obstacle.y < this.canvas.height;
        });

        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver();
        }

        // Update UI
        this.updateUI();
    }

    spawnObstacle() {
        const laneWidth = this.canvas.width / 3;
        const lane = Math.floor(Math.random() * 3);
        const x = lane * laneWidth + laneWidth/2 - 20;

        this.obstacles.push({
            x: x,
            y: -50,
            width: 40,
            height: 70
        });
    }

    checkCollisions() {
        return this.obstacles.some(obstacle => {
            return (this.playerCar.x < obstacle.x + obstacle.width &&
                    this.playerCar.x + this.playerCar.width > obstacle.x &&
                    this.playerCar.y < obstacle.y + obstacle.height &&
                    this.playerCar.y + this.playerCar.height > obstacle.y);
        });
    }

    gameOver() {
        this.isPlaying = false;
        this.startBtn.textContent = 'Play Again';
        alert(`Game Over! Score: ${this.score}`);
    }

    drawGame() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw road lines
        this.ctx.fillStyle = '#ffffff';
        this.roadLines.forEach(line => {
            this.ctx.fillRect(line.x, line.y, line.width, line.height);
        });

        // Draw obstacles
        this.ctx.fillStyle = '#ff4444';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        // Draw player car
        this.ctx.fillStyle = this.boosting ? '#44ff44' : '#4444ff';
        this.ctx.fillRect(
            this.playerCar.x,
            this.playerCar.y,
            this.playerCar.width,
            this.playerCar.height
        );
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.speedElement.textContent = Math.floor(this.speed * 10);
        this.distanceElement.textContent = Math.floor(this.distance);
    }

    gameLoop() {
        if (this.isPlaying) {
            this.updateGame();
            this.drawGame();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RacingGame();
});
