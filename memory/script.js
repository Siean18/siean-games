const gameContainer = document.getElementById("game-container");
const movesCount = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const restartButton = document.getElementById("restart");

// Game state variables
let cards;
let moves = 0;
let seconds = 0;
let minutes = 0;
let firstCard = false;
let secondCard = false;
let interval;

// Card items with emojis
const items = [
    '🎮', '🎲', '🎯', '🎪',
    '🎨', '🎭', '🎪', '🎯',
    '🎲', '🎮', '🎨', '🎭'
];

// Timer
const timeGenerator = () => {
    seconds += 1;
    if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
    }
    let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
    let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
    timeValue.innerHTML = `${minutesValue}:${secondsValue}`;
};

// Calculate moves
const movesCounter = () => {
    moves++;
    movesCount.innerHTML = moves;
};

// Generate random cards
const generateRandom = (size = 12) => {
    let tempArray = [...items];
    let cardValues = [];
    size = size || items.length;
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        cardValues.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
    }
    return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
    gameContainer.innerHTML = "";
    cardValues = [...cardValues];
    for (let i = 0; i < size * 3; i++) {
        const card = document.createElement("div");
        card.classList.add("card");
        const cardFront = document.createElement("div");
        cardFront.classList.add("card-front");
        const cardBack = document.createElement("div");
        cardBack.classList.add("card-back");
        cardFront.innerHTML = cardValues[i];
        card.setAttribute("data-card-value", cardValues[i]);
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        gameContainer.appendChild(card);
    }
};

// Check for match
const checkMatch = (e) => {
    const clickedCard = e.target.closest('.card');
    if (!clickedCard || clickedCard.classList.contains('flipped')) return;

    clickedCard.classList.add("flipped");
    if (!firstCard) {
        firstCard = clickedCard;
        firstCardValue = clickedCard.getAttribute("data-card-value");
    } else {
        movesCounter();
        secondCard = clickedCard;
        let secondCardValue = clickedCard.getAttribute("data-card-value");
        if (firstCardValue === secondCardValue) {
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            firstCard = false;
            if (document.querySelectorAll(".matched").length === items.length) {
                clearInterval(interval);
                setTimeout(() => {
                    alert(`You Won!\nMoves: \${moves}\nTime: \${timeValue.innerHTML}`);
                    restartGame();
                }, 500);
            }
        } else {
            let [tempFirst, tempSecond] = [firstCard, secondCard];
            firstCard = false;
            secondCard = false;
            setTimeout(() => {
                tempFirst.classList.remove("flipped");
                tempSecond.classList.remove("flipped");
            }, 900);
        }
    }
};

// Restart game
const restartGame = () => {
    moves = 0;
    seconds = 0;
    minutes = 0;
    timeValue.innerHTML = "00:00";
    movesCount.innerHTML = 0;
    firstCard = false;
    secondCard = false;
    clearInterval(interval);
    interval = setInterval(timeGenerator, 1000);
    let cardValues = generateRandom();
    matrixGenerator(cardValues);
    cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.addEventListener("click", checkMatch);
    });
};

// Initialize game
window.onload = () => {
    restartGame();
    restartButton.addEventListener("click", restartGame);
};
