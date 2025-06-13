const emojiThemes = {
  animals: ['🐶','🐱','🐻','🐼','🐨','🦁','🐸','🐵'],
  food: ['🍎','🍕','🍔','🍣','🍩','🍇','🍓','🍫'],
  sports: ['⚽','🏀','🏈','⚾','🎾','🏐','🏓','🥊']
};
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let timer = 0;
let moves = 0;
let timerInterval = null;
let gameStarted = false;

const gameBoard = document.getElementById('gameBoard');
const resetBtn = document.getElementById('reset');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const bestTimeDisplay = document.getElementById('bestTime');
const bestMovesDisplay = document.getElementById('bestMoves');

function getSelectedTheme() {
  const dropdown = document.getElementById('themeDropdown');
  return dropdown.value;
}

function updateBestStats() {
  const bestTime = localStorage.getItem('bestTime');
  const bestMoves = localStorage.getItem('bestMoves');

  bestTimeDisplay.textContent = bestTime ?? '–';
  bestMovesDisplay.textContent = bestMoves ?? '–';
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

function createBoard() {
  gameBoard.innerHTML = '';
  
  const selectedTheme = getSelectedTheme();
  const themeEmojis = emojiThemes[selectedTheme];
  cards = [...themeEmojis, ...themeEmojis];
  shuffle(cards).forEach(symbol => {

    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.innerText = '';
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });

  // adding timer and move counter
  timer = 0;
  moves = 0;
  gameStarted = false;
  timerDisplay.textContent = 0;
  movesDisplay.textContent = 0;
  clearInterval(timerInterval);

updateBestStats();
}

function flipCard() {
  
  // Start timer on first card flip
  if (!gameStarted) {
    gameStarted = true;
    timerInterval = setInterval(() => {
      timer++;
      timerDisplay.textContent = timer;
    }, 1000);
  }

  if (lockBoard || this === firstCard) return;

  this.innerText = this.dataset.symbol;
  this.classList.add('flipped');

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  //add this line after a pair of cards are flipped
  moves++;
  movesDisplay.textContent = moves;


  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    resetTurn();
    checkGameOver();
  } else {
    setTimeout(() => {
      firstCard.innerText = '';
      secondCard.innerText = '';
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function checkGameOver() {
  const allMatched = [...document.querySelectorAll('.card')].every(card =>
    card.classList.contains('matched')
  );
  if (allMatched && gameStarted) {
  clearInterval(timerInterval);

    // Set values in popup
  setTimeout(() => {
    document.getElementById('finalTime').textContent = timer;
    document.getElementById('finalMoves').textContent = moves;

    // Load best score
    const bestTime = localStorage.getItem('bestTime');
    const bestMoves = localStorage.getItem('bestMoves');

    let message = '';
    if (!bestTime || timer < bestTime) {
      localStorage.setItem('bestTime', timer);
      message += `🎯 New Best Time!<br>`;
    }

    if (!bestMoves || moves < bestMoves) {
      localStorage.setItem('bestMoves', moves);
      message += `💪 New Best Move Count!`;
    }
  
  updateBestStats();

  document.getElementById('newRecordMessage').innerHTML = message;
  document.getElementById('winPopup').classList.remove('hidden');
}, 300);

  }
}

resetBtn.addEventListener('click', createBoard);

document.getElementById('themeDropdown').addEventListener('change', () => {
  createBoard();  // this reloads the board with the new theme
});

createBoard(); // initialize


function closePopup() {
  console.log("Closing popup");
  document.getElementById('winPopup').classList.add('hidden');
  createBoard(); // reset game
}

window.closePopup = closePopup;
