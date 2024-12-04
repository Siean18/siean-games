class TypingSpeedTest {
    constructor() {
        this.timeLeft = 60;
        this.isRunning = false;
        this.errors = 0;
        this.totalTyped = 0;
        this.timer = null;
        
        // Text content for different modes
        this.textContent = {
            words: [
                "the quick brown fox jumps over the lazy dog",
                "programming is the art of telling another human what one wants",
                "debugging is twice as hard as writing the code in the first place",
                "code is like humor when you have to explain it it is bad",
                "simplicity is prerequisite for reliability keep it simple",
                "kucing coklat melompat di atas anjing yang malas",
                "programming adalah seni memberi tahu komputer apa yang kita inginkan",
                "debugging itu dua kali lebih sulit daripada menulis kode",
                "kode itu seperti lelucon kalau harus dijelaskan berarti tidak bagus",
                "kesederhanaan adalah kunci dari keandalan sebuah program",
                "belajar coding itu seperti belajar bahasa baru butuh latihan",
                "teknologi adalah alat manusia adalah pemikir di baliknya",
                "masa depan milik mereka yang percaya pada keindahan mimpinya",
                "jangan pernah menyerah sebelum mencoba dengan sungguh sungguh",
                "hidup itu seperti kode kadang error tapi bisa diperbaiki"
            ],
            quotes: [
                "Be the change you wish to see in the world. - Mahatma Gandhi",
                "I think therefore I am. - René Descartes",
                "Life is what happens when you're busy making other plans. - John Lennon",
                "To be yourself in a world that is trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson",
                "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. - Albert Einstein",
                "Jadilah perubahan yang ingin kamu lihat di dunia ini. - Mahatma Gandhi",
                "Pendidikan adalah senjata paling mematikan karena dengan itu Anda dapat mengubah dunia. - Nelson Mandela",
                "Hidup itu seperti sepeda untuk menjaga keseimbangan kamu harus terus bergerak. - Albert Einstein",
                "Sukses adalah guru yang buruk ia membuat orang pintar berpikir bahwa mereka tidak akan pernah gagal. - Bill Gates",
                "Jangan menjelaskan tentang dirimu kepada siapapun karena yang menyukaimu tidak butuh itu dan yang membencimu tidak percaya itu. - Ali bin Abi Thalib"
            ],
            code: [
                "function factorial(n) {\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}",
                "const sum = array.reduce((a, b) => a + b, 0);",
                "if (condition) {\n  doSomething();\n} else {\n  doSomethingElse();\n}",
                "class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n}",
                "const promise = new Promise((resolve, reject) => {\n  if (success) resolve(data);\n  else reject(error);\n});",
                "function hitungFaktorial(n) {\n  return n <= 1 ? 1 : n * hitungFaktorial(n - 1);\n}",
                "const jumlah = array.reduce((a, b) => a + b, 0);",
                "if (kondisi) {\n  lakukanSesuatu();\n} else {\n  lakukanHalLain();\n}",
                "class PersegiPanjang {\n  constructor(lebar, tinggi) {\n    this.lebar = lebar;\n    this.tinggi = tinggi;\n  }\n}",
                "const janji = new Promise((resolve, reject) => {\n  if (berhasil) resolve(data);\n  else reject(error);\n});"
            ]
        };

        // DOM elements
        this.textDisplay = document.getElementById('textDisplay');
        this.textInput = document.getElementById('textInput');
        this.timeSelect = document.getElementById('timeSelect');
        this.modeSelect = document.getElementById('modeSelect');
        this.startBtn = document.getElementById('startBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.errorsDisplay = document.getElementById('errors');
        this.timeDisplay = document.getElementById('time');
        this.resultsDiv = document.getElementById('results');

        // Event listeners
        this.startBtn.addEventListener('click', () => this.startTest());
        this.retryBtn.addEventListener('click', () => this.resetTest());
        this.textInput.addEventListener('input', () => this.checkInput());
        this.timeSelect.addEventListener('change', () => this.updateTimer());
        this.modeSelect.addEventListener('change', () => this.updateText());
    }

    startTest() {
        this.isRunning = true;
        this.errors = 0;
        this.totalTyped = 0;
        this.timeLeft = parseInt(this.timeSelect.value);
        this.updateText();
        this.textInput.value = '';
        this.textInput.disabled = false;
        this.textInput.focus();
        this.startBtn.disabled = true;
        this.resultsDiv.style.display = 'none';
        this.startTimer();
    }

    resetTest() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.errors = 0;
        this.totalTyped = 0;
        this.timeLeft = parseInt(this.timeSelect.value);
        this.updateDisplay();
        this.textInput.value = '';
        this.textInput.disabled = true;
        this.startBtn.disabled = false;
        this.resultsDiv.style.display = 'none';
        this.textDisplay.innerHTML = 'Click Start to begin typing test...';
    }

    updateText() {
        const mode = this.modeSelect.value;
        const texts = this.textContent[mode];
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        this.textDisplay.innerHTML = randomText;
    }

    checkInput() {
        if (!this.isRunning) return;

        const currentInput = this.textInput.value;
        const originalText = this.textDisplay.textContent;
        this.totalTyped = currentInput.length;

        let displayText = '';
        let errors = 0;

        for (let i = 0; i < currentInput.length; i++) {
            if (i >= originalText.length) {
                errors++;
                displayText += `<span class="incorrect">${currentInput[i]}</span>`;
            } else if (currentInput[i] === originalText[i]) {
                displayText += `<span class="correct">${originalText[i]}</span>`;
            } else {
                errors++;
                displayText += `<span class="incorrect">${originalText[i]}</span>`;
            }
        }

        if (currentInput.length < originalText.length) {
            displayText += originalText.substring(currentInput.length);
        }

        this.errors = errors;
        this.textDisplay.innerHTML = displayText;
        this.updateDisplay();

        // Check if text is completed
        if (currentInput === originalText) {
            this.updateText();
            this.textInput.value = '';
        }
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.endTest();
            }
        }, 1000);
    }

    updateTimer() {
        this.timeLeft = parseInt(this.timeSelect.value);
        this.updateDisplay();
    }

    calculateWPM() {
        const minutes = (parseInt(this.timeSelect.value) - this.timeLeft) / 60;
        const words = this.totalTyped / 5; // Standard: 5 characters = 1 word
        return Math.round(words / minutes);
    }

    calculateAccuracy() {
        return this.totalTyped === 0 ? 100 : 
            Math.round(((this.totalTyped - this.errors) / this.totalTyped) * 100);
    }

    updateDisplay() {
        this.wpmDisplay.textContent = this.calculateWPM();
        this.accuracyDisplay.textContent = this.calculateAccuracy() + '%';
        this.errorsDisplay.textContent = this.errors;
        this.timeDisplay.textContent = this.timeLeft + 's';
    }

    endTest() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.textInput.disabled = true;
        this.startBtn.disabled = false;

        // Show results
        this.resultsDiv.style.display = 'block';
        document.getElementById('resultWPM').textContent = this.calculateWPM();
        document.getElementById('resultChars').textContent = this.totalTyped;
        document.getElementById('resultAccuracy').textContent = this.calculateAccuracy() + '%';
        document.getElementById('resultCorrectWords').textContent = 
            Math.round((this.totalTyped - this.errors) / 5);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TypingSpeedTest();
});
