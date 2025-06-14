const emojiThemes = {
  animals: ['🐶','🐱','🐻','🐼','🐨','🦁','🐸','🐵','🐔','🐷','🐮','🐰','🐯','🦊','🐹','🐢','🦓','🦒','🦘','🐊','🦀','🐙','🐬','🦉','🦄','🐝','🐞','🐍','🦔','🦕','🦖','🦂','🦚'],
  food: ['🍎','🍌','🍇','🍉','🍒','🍓','🍍','🥭','🍅','🥕','🌽','🥦','🧄','🥔','🥐','🍞','🧀','🍗','🍖','🍔','🍟','🍕','🌮','🌯','🍝','🍜','🍣','🍤','🍦','🍩','🍪','🍫','🍬'],
  sports: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🥊','🥋','⛳','🏒','🏑','🏏','🥌','🏹','🛹','🛷','🎿','⛷️','🏂','🚴','🚵','🏇','🏄','🤽','🤾','🤸','🤼','⛸️'],
  weather: ['☀️','🌤️','🌧️','⛈️','🌩️','❄️','🌪️','🌫️','🌈','🌂','☔','🌬️','🌡️','🌀','☁️','💨','🔥','🌊','🪐','🌙','⭐','🌟','⚡','☃️','🌅','🌄','🌃','🌆','🌇','🌉','🌌','🎇','🎆'],
  faces: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😶','🙄']
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

function getDifficultyCardCount() {
  const level = document.getElementById('difficultyDropdown').value;
  if (level === 'normal') return 10;  // 4x5
  if (level === 'medium') return 15;  // 6x5
  if (level === 'hard') return 20;    // 8x5
  return 10;
}

function updateBestStats() {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const bestTime = localStorage.getItem(`bestTime_${difficulty}`);
  const bestMoves = localStorage.getItem(`bestMoves_${difficulty}`);

  bestTimeDisplay.textContent = bestTime ?? '–';
  bestMovesDisplay.textContent = bestMoves ?? '–';
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

function createBoard() {
  gameBoard.innerHTML = '';
  const theme = document.getElementById('themeDropdown').value;
  const pool = [...emojiThemes[theme]];
  const pairCount = getDifficultyCardCount();
  const selected = shuffle(pool).slice(0, pairCount);
  cards = [...selected, ...selected]; // duplicate for matching
  shuffle(cards).forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.innerText = '';
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });

// adding timer and move counter and reset game stats
  timer = 0;
  moves = 0;
  gameStarted = false;
  timerDisplay.textContent = 0;
  movesDisplay.textContent = 0;
  clearInterval(timerInterval);
  updateBestStats();

// Adjust grid layout
gameBoard.style.gridTemplateColumns = 'repeat(5, 1fr)';

// Adjust font size for emoji visibility based on board size
let fontSize = '32px';
if (pairCount === 15) fontSize = '26px';
else if (pairCount === 20) fontSize = '22px';

document.querySelectorAll('.card').forEach(card => {
  card.style.fontSize = fontSize;
});

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
  const difficulty = document.getElementById('difficultyDropdown').value;
  const bestTime = localStorage.getItem(`bestTime_${difficulty}`);
  const bestMoves = localStorage.getItem(`bestMoves_${difficulty}`);

  let message = '';
  if (!bestTime || timer < bestTime) {
    localStorage.setItem(`bestTime_${difficulty}`, timer);
    message += `🎯 New Best Time!<br>`;
  }

  if (!bestMoves || moves < bestMoves) {
    localStorage.setItem(`bestMoves_${difficulty}`, moves);
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

document.getElementById('difficultyDropdown').addEventListener('change', () => {
  createBoard();  // reloads board with new difficulty
});

createBoard(); // initialize


function closePopup() {
  console.log("Closing popup");
  document.getElementById('winPopup').classList.add('hidden');
  createBoard(); // reset game
}

window.closePopup = closePopup;
