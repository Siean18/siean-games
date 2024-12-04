// Game configuration
const config = {
    easy: { size: 8, words: 6 },
    medium: { size: 10, words: 8 },
    hard: { size: 12, words: 10 }
};

// Word bank (can be expanded)
const wordBank = [
    'JAVASCRIPT', 'PYTHON', 'JAVA', 'HTML', 'CSS',
    'REACT', 'ANGULAR', 'VUE', 'NODE', 'PHP',
    'MYSQL', 'MONGO', 'REDIS', 'DOCKER', 'GIT',
    'LINUX', 'WINDOWS', 'MAC', 'CODE', 'WEB'
];

class WordSearch {
    constructor() {
        this.grid = [];
        this.words = [];
        this.foundWords = new Set();
        this.size = config.easy.size;
        this.selection = {
            start: null,
            current: null,
            cells: new Set()
        };
        this.timer = null;
        this.seconds = 0;

        this.initializeDOM();
        this.setupEventListeners();
    }

    initializeDOM() {
        this.gridElement = document.getElementById('grid');
        this.wordList = document.getElementById('words');
        this.timerElement = document.getElementById('timer');
        this.foundWordsElement = document.getElementById('found-words');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameBtn = document.getElementById('newGameBtn');
    }

    setupEventListeners() {
        this.gridElement.addEventListener('mousedown', this.startSelection.bind(this));
        this.gridElement.addEventListener('mouseover', this.updateSelection.bind(this));
        document.addEventListener('mouseup', this.endSelection.bind(this));
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.difficultySelect.addEventListener('change', () => this.startNewGame());
    }

    startNewGame() {
        // Clear previous game state
        this.foundWords.clear();
        this.selection = { start: null, current: null, cells: new Set() };
        clearInterval(this.timer);
        this.seconds = 0;

        // Set up new game
        const difficulty = this.difficultySelect.value;
        this.size = config[difficulty].size;
        this.words = this.selectRandomWords(config[difficulty].words);
        this.grid = this.createGrid();
        this.placeWords();
        this.fillEmptyCells();
        this.renderGrid();
        this.renderWordList();
        this.updateUI();
        this.startTimer();
    }

    selectRandomWords(count) {
        const shuffled = [...wordBank].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(word => word.toUpperCase());
    }

    createGrid() {
        return Array(this.size).fill().map(() => Array(this.size).fill(''));
    }

    placeWords() {
        for (const word of this.words) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;

            while (!placed && attempts < maxAttempts) {
                const direction = Math.floor(Math.random() * 8);
                const [dx, dy] = this.getDirection(direction);
                const [startX, startY] = this.getRandomStart(word, dx, dy);

                if (this.canPlaceWord(word, startX, startY, dx, dy)) {
                    this.placeWord(word, startX, startY, dx, dy);
                    placed = true;
                }
                attempts++;
            }
        }
    }

    getDirection(dir) {
        const directions = [
            [0, 1],   // right
            [1, 0],   // down
            [1, 1],   // diagonal down-right
            [-1, 1],  // diagonal up-right
            [0, -1],  // left
            [-1, 0],  // up
            [-1, -1], // diagonal up-left
            [1, -1]   // diagonal down-left
        ];
        return directions[dir];
    }

    getRandomStart(word, dx, dy) {
        const length = word.length - 1;
        let x = Math.floor(Math.random() * this.size);
        let y = Math.floor(Math.random() * this.size);

        // Adjust start position based on direction and word length
        if (dx < 0) x = Math.min(this.size - 1, x + length * Math.abs(dx));
        if (dy < 0) y = Math.min(this.size - 1, y + length * Math.abs(dy));
        if (dx > 0) x = Math.max(0, x - length * dx);
        if (dy > 0) y = Math.max(0, y - length * dy);

        return [x, y];
    }

    canPlaceWord(word, startX, startY, dx, dy) {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * dx;
            const y = startY + i * dy;

            if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
            if (this.grid[x][y] && this.grid[x][y] !== word[i]) return false;
        }
        return true;
    }

    placeWord(word, startX, startY, dx, dy) {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * dx;
            const y = startY + i * dy;
            this.grid[x][y] = word[i];
        }
    }

    fillEmptyCells() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.grid[i][j]) {
                    this.grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    renderGrid() {
        this.gridElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        this.gridElement.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = i;
                cell.dataset.y = j;
                cell.textContent = this.grid[i][j];
                this.gridElement.appendChild(cell);
            }
        }
    }

    renderWordList() {
        this.wordList.innerHTML = '';
        for (const word of this.words) {
            const li = document.createElement('li');
            li.textContent = word;
            li.className = this.foundWords.has(word) ? 'found' : '';
            this.wordList.appendChild(li);
        }
    }

    startSelection(e) {
        if (!e.target.classList.contains('cell')) return;
        
        this.selection.start = {
            x: parseInt(e.target.dataset.x),
            y: parseInt(e.target.dataset.y)
        };
        this.selection.current = {...this.selection.start};
        this.updateSelectedCells();
    }

    updateSelection(e) {
        if (!this.selection.start || !e.target.classList.contains('cell')) return;

        this.selection.current = {
            x: parseInt(e.target.dataset.x),
            y: parseInt(e.target.dataset.y)
        };
        this.updateSelectedCells();
    }

    endSelection() {
        if (!this.selection.start || !this.selection.current) return;

        const word = this.getSelectedWord();
        if (this.words.includes(word) && !this.foundWords.has(word)) {
            this.foundWords.add(word);
            this.markFoundWord(word);
            this.updateUI();
            this.checkGameCompletion();
        }

        this.clearSelection();
    }

    getSelectedWord() {
        const cells = Array.from(this.selection.cells)
            .map(cell => cell.textContent)
            .join('');
        const reversedCells = cells.split('').reverse().join('');
        return cells.length >= 3 ? (this.words.includes(cells) ? cells : 
               this.words.includes(reversedCells) ? reversedCells : '') : '';
    }

    updateSelectedCells() {
        // Clear previous selection
        document.querySelectorAll('.cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Calculate direction and length
        const dx = Math.sign(this.selection.current.x - this.selection.start.x);
        const dy = Math.sign(this.selection.current.y - this.selection.start.y);
        const length = Math.max(
            Math.abs(this.selection.current.x - this.selection.start.x),
            Math.abs(this.selection.current.y - this.selection.start.y)
        ) + 1;

        // Update selection
        this.selection.cells.clear();
        for (let i = 0; i < length; i++) {
            const x = this.selection.start.x + i * dx;
            const y = this.selection.start.y + i * dy;
            const cell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (cell) {
                cell.classList.add('selected');
                this.selection.cells.add(cell);
            }
        }
    }

    markFoundWord(word) {
        this.selection.cells.forEach(cell => {
            cell.classList.add('found');
        });
    }

    clearSelection() {
        document.querySelectorAll('.cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        this.selection = {
            start: null,
            current: null,
            cells: new Set()
        };
    }

    updateUI() {
        this.renderWordList();
        this.foundWordsElement.textContent = `Found: ${this.foundWords.size}/${this.words.length}`;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
            const minutes = Math.floor(this.seconds / 60);
            const remainingSeconds = this.seconds % 60;
            this.timerElement.textContent = 
                `Time: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    checkGameCompletion() {
        if (this.foundWords.size === this.words.length) {
            clearInterval(this.timer);
            setTimeout(() => {
                alert(`Congratulations! You found all words in ${this.seconds} seconds!`);
            }, 500);
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new WordSearch();
    game.startNewGame();
});
