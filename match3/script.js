class Match3Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 8;
        this.tileSize = 60;
        this.score = 0;
        this.moves = 0;
        this.seconds = 0;
        this.colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        this.selectedTile = null;
        this.board = [];
        this.animations = [];
        this.isAnimating = false;

        // Initialize canvas size
        this.canvas.width = this.gridSize * this.tileSize;
        this.canvas.height = this.gridSize * this.tileSize;

        // Initialize UI elements
        this.scoreElement = document.getElementById('score');
        this.movesElement = document.getElementById('moves');
        this.timeElement = document.getElementById('time');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.hintBtn = document.getElementById('hintBtn');

        // Event listeners
        this.canvas.addEventListener('mousedown', this.handleClick.bind(this));
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.hintBtn.addEventListener('click', () => this.showHint());

        // Start game
        this.startNewGame();
    }

    startNewGame() {
        this.score = 0;
        this.moves = 0;
        this.seconds = 0;
        this.updateUI();
        this.initializeBoard();
        this.startTimer();
    }

    initializeBoard() {
        this.board = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                let color;
                do {
                    color = this.getRandomColor();
                } while (this.wouldCauseMatch(i, j, color));
                this.board[i][j] = {
                    color: color,
                    x: j * this.tileSize,
                    y: i * this.tileSize,
                    isSpecial: false
                };
            }
        }
        this.draw();
    }

    wouldCauseMatch(row, col, color) {
        // Check horizontal
        if (col >= 2 &&
            this.board[row][col-1]?.color === color &&
            this.board[row][col-2]?.color === color) {
            return true;
        }
        // Check vertical
        if (row >= 2 &&
            this.board[row-1][col]?.color === color &&
            this.board[row-2][col]?.color === color) {
            return true;
        }
        return false;
    }

    getRandomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const tile = this.board[i][j];
                if (tile) {
                    this.drawTile(tile, j * this.tileSize, i * this.tileSize);
                }
            }
        }

        // Draw selected tile highlight
        if (this.selectedTile) {
            const {row, col} = this.selectedTile;
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                col * this.tileSize,
                row * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
    }

    drawTile(tile, x, y) {
        this.ctx.fillStyle = tile.color;
        this.ctx.beginPath();
        this.ctx.roundRect(
            x + 2,
            y + 2,
            this.tileSize - 4,
            this.tileSize - 4,
            10
        );
        this.ctx.fill();

        if (tile.isSpecial) {
            // Draw special candy indicator (star)
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(
                x + this.tileSize/2,
                y + this.tileSize/2,
                5,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    handleClick(e) {
        if (this.isAnimating) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        if (this.selectedTile === null) {
            this.selectedTile = {row, col};
        } else {
            if (this.isAdjacent(this.selectedTile, {row, col})) {
                this.swapTiles(this.selectedTile, {row, col});
                this.moves++;
                this.updateUI();
            }
            this.selectedTile = null;
        }
        this.draw();
    }

    isAdjacent(tile1, tile2) {
        const rowDiff = Math.abs(tile1.row - tile2.row);
        const colDiff = Math.abs(tile1.col - tile2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async swapTiles(tile1, tile2) {
        // Swap colors
        const temp = this.board[tile1.row][tile1.col].color;
        this.board[tile1.row][tile1.col].color = this.board[tile2.row][tile2.col].color;
        this.board[tile2.row][tile2.col].color = temp;

        // Check for matches
        const matches = this.findMatches();
        if (matches.length > 0) {
            await this.handleMatches(matches);
        } else {
            // Swap back if no matches
            const temp = this.board[tile1.row][tile1.col].color;
            this.board[tile1.row][tile1.col].color = this.board[tile2.row][tile2.col].color;
            this.board[tile2.row][tile2.col].color = temp;
        }
        this.draw();
    }

    findMatches() {
        const matches = [];

        // Check horizontal matches
        for (let i = 0; i < this.gridSize; i++) {
            let matchCount = 1;
            let startCol = 0;
            for (let j = 1; j < this.gridSize; j++) {
                if (this.board[i][j].color === this.board[i][j-1].color) {
                    matchCount++;
                } else {
                    if (matchCount >= 3) {
                        matches.push({
                            row: i,
                            startCol: startCol,
                            endCol: j-1,
                            direction: 'horizontal'
                        });
                    }
                    matchCount = 1;
                    startCol = j;
                }
            }
            if (matchCount >= 3) {
                matches.push({
                    row: i,
                    startCol: startCol,
                    endCol: this.gridSize-1,
                    direction: 'horizontal'
                });
            }
        }

        // Check vertical matches
        for (let j = 0; j < this.gridSize; j++) {
            let matchCount = 1;
            let startRow = 0;
            for (let i = 1; i < this.gridSize; i++) {
                if (this.board[i][j].color === this.board[i-1][j].color) {
                    matchCount++;
                } else {
                    if (matchCount >= 3) {
                        matches.push({
                            col: j,
                            startRow: startRow,
                            endRow: i-1,
                            direction: 'vertical'
                        });
                    }
                    matchCount = 1;
                    startRow = i;
                }
            }
            if (matchCount >= 3) {
                matches.push({
                    col: j,
                    startRow: startRow,
                    endRow: this.gridSize-1,
                    direction: 'vertical'
                });
            }
        }

        return matches;
    }

    async handleMatches(matches) {
        this.isAnimating = true;

        // Remove matched tiles and update score
        for (const match of matches) {
            if (match.direction === 'horizontal') {
                const matchLength = match.endCol - match.startCol + 1;
                this.score += matchLength * 10;
                
                // Create special candy if match length >= 4
                if (matchLength >= 4) {
                    const specialCol = Math.floor((match.startCol + match.endCol) / 2);
                    this.board[match.row][specialCol].isSpecial = true;
                }

                for (let j = match.startCol; j <= match.endCol; j++) {
                    this.board[match.row][j] = null;
                }
            } else {
                const matchLength = match.endRow - match.startRow + 1;
                this.score += matchLength * 10;

                // Create special candy if match length >= 4
                if (matchLength >= 4) {
                    const specialRow = Math.floor((match.startRow + match.endRow) / 2);
                    this.board[specialRow][match.col].isSpecial = true;
                }

                for (let i = match.startRow; i <= match.endRow; i++) {
                    this.board[i][match.col] = null;
                }
            }
        }

        this.updateUI();
        await this.dropTiles();
        
        // Check for new matches after dropping
        const newMatches = this.findMatches();
        if (newMatches.length > 0) {
            await this.handleMatches(newMatches);
        }

        this.isAnimating = false;
    }

    async dropTiles() {
        let dropped = false;
        do {
            dropped = false;
            // Drop existing tiles
            for (let i = this.gridSize - 2; i >= 0; i--) {
                for (let j = 0; j < this.gridSize; j++) {
                    if (this.board[i][j] && !this.board[i + 1][j]) {
                        this.board[i + 1][j] = this.board[i][j];
                        this.board[i][j] = null;
                        dropped = true;
                    }
                }
            }
            
            // Fill empty top row
            for (let j = 0; j < this.gridSize; j++) {
                if (!this.board[0][j]) {
                    this.board[0][j] = {
                        color: this.getRandomColor(),
                        isSpecial: false
                    };
                    dropped = true;
                }
            }

            if (dropped) {
                this.draw();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } while (dropped);
    }

    showHint() {
        // Find potential matches
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize - 1; j++) {
                // Try horizontal swap
                this.swapColors(i, j, i, j + 1);
                if (this.findMatches().length > 0) {
                    this.swapColors(i, j, i, j + 1);
                    // Highlight the potential match
                    this.highlightTiles([{row: i, col: j}, {row: i, col: j + 1}]);
                    return;
                }
                this.swapColors(i, j, i, j + 1);
            }
        }
    }

    swapColors(row1, col1, row2, col2) {
        const temp = this.board[row1][col1].color;
        this.board[row1][col1].color = this.board[row2][col2].color;
        this.board[row2][col2].color = temp;
    }

    highlightTiles(tiles) {
        // Visual hint effect
        const originalColors = tiles.map(tile => this.board[tile.row][tile.col].color);
        
        const flash = () => {
            tiles.forEach(tile => {
                this.board[tile.row][tile.col].color = '#ffffff';
            });
            this.draw();

            setTimeout(() => {
                tiles.forEach((tile, index) => {
                    this.board[tile.row][tile.col].color = originalColors[index];
                });
                this.draw();
            }, 200);
        };

        flash();
        setTimeout(flash, 400);
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateUI();
        }, 1000);
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.movesElement.textContent = this.moves;
        const minutes = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        this.timeElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Match3Game();
});
