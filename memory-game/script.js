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
let streak = 0;
let currentUser = null;

const gameBoard = document.getElementById('gameBoard');
const resetBtn = document.getElementById('reset');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const bestTimeDisplay = document.getElementById('bestTime');
const bestMovesDisplay = document.getElementById('bestMoves');

function loginUser() {
  const username = document.getElementById('usernameInput').value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  currentUser = username;
  localStorage.setItem('currentUser', username);

  document.getElementById('loggedInUser').classList.remove('hidden');
  document.getElementById('currentUsername').textContent = username;
  document.getElementById('loginButton').disabled = true;
  document.getElementById('usernameInput').disabled = true;

  updateBestStats();
  createBoard();
  updateLeaderboard();
}

function loadUserFromStorage() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = savedUser;
    document.getElementById('loggedInUser').classList.remove('hidden');
    document.getElementById('currentUsername').textContent = savedUser;
    document.getElementById('loginButton').disabled = true;
    document.getElementById('usernameInput').value = savedUser;
    document.getElementById('usernameInput').disabled = true;
  }
}

function getDifficultyCardCount() {
  const level = document.getElementById('difficultyDropdown').value;
  if (level === 'normal') return 10;
  if (level === 'medium') return 15;
  if (level === 'hard') return 20;
  return 10;
}

function updateBestStats() {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const bestTime = localStorage.getItem(`bestTime_${currentUser}_${difficulty}`);
  const bestMoves = localStorage.getItem(`bestMoves_${currentUser}_${difficulty}`);
  bestTimeDisplay.textContent = bestTime ?? '–';
  bestMovesDisplay.textContent = bestMoves ?? '–';
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}

function createBoard() {
  if (!currentUser) return;

  gameBoard.innerHTML = '';
  const theme = document.getElementById('themeDropdown').value;
  const pool = [...emojiThemes[theme]];
  const pairCount = getDifficultyCardCount();
  const selected = shuffle(pool).slice(0, pairCount);
  const cards = [...selected, ...selected];
  shuffle(cards).forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.innerText = '';
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });

  timer = 0;
  moves = 0;
  gameStarted = false;
  timerDisplay.textContent = 0;
  movesDisplay.textContent = 0;
  clearInterval(timerInterval);
  updateBestStats();

  const difficulty = document.getElementById('difficultyDropdown').value;
  gameBoard.style.gridTemplateColumns = 'repeat(5, 1fr)';
}

function flipCard() {
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
  moves++;
  movesDisplay.textContent = moves;

  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    streak++;
    if (streak >= 3) alert(`🔥 Streak Bonus! ${streak} correct in a row!`);
    resetTurn();
    checkGameOver();
  } else {
    streak = 0;
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
    setTimeout(() => {
      document.getElementById('finalTime').textContent = timer;
      document.getElementById('finalMoves').textContent = moves;

      const difficulty = document.getElementById('difficultyDropdown').value;
      const bestTime = localStorage.getItem(`bestTime_${currentUser}_${difficulty}`);
      const bestMoves = localStorage.getItem(`bestMoves_${currentUser}_${difficulty}`);

      saveToLeaderboard(timer, moves);
      updateLeaderboard();

      let message = '';
      if (!bestTime || timer < bestTime) {
        localStorage.setItem(`bestTime_${currentUser}_${difficulty}`, timer);
        message += `🎯 New Best Time!<br>`;
      }
      if (!bestMoves || moves < bestMoves) {
        localStorage.setItem(`bestMoves_${currentUser}_${difficulty}`, moves);
        message += `💪 New Best Move Count!`;
      }

      updateBestStats();

      document.getElementById('newRecordMessage').innerHTML = message;
      document.getElementById('winPopup').classList.remove('hidden');
    }, 300);
  }
}

function saveToLeaderboard(time, moves) {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const theme = document.getElementById('themeDropdown').value;
  const key = `leaderboard_${theme}_${difficulty}`;
  const entry = { time, moves, date: new Date().toLocaleString() };

  const current = JSON.parse(localStorage.getItem(key)) || [];
  current.push(entry);
  current.sort((a, b) => a.time - b.time || a.moves - b.moves);
  localStorage.setItem(key, JSON.stringify(current.slice(0, 5)));
}

function updateLeaderboard() {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const theme = document.getElementById('themeDropdown').value;
  const key = `leaderboard_${theme}_${difficulty}`;
  const scores = JSON.parse(localStorage.getItem(key)) || [];

  const label = document.getElementById('leaderboardLabel');
  label.textContent = `Theme: ${theme} | Difficulty: ${difficulty}`;

  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';

  if (scores.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No scores yet!';
    list.appendChild(empty);
    return;
  }

  scores.forEach((score, i) => {
    const item = document.createElement('li');
    item.textContent = `${i + 1}. ⏱️ ${score.time}s | 🔢 ${score.moves} moves | 📅 ${score.date}`;
    list.appendChild(item);
  });
}

function closePopup() {
  document.getElementById('winPopup').classList.add('hidden');
  createBoard();
}

resetBtn.addEventListener('click', createBoard);

document.getElementById('themeDropdown').addEventListener('change', () => {
  createBoard();
  updateLeaderboard();
});

document.getElementById('difficultyDropdown').addEventListener('change', () => {
  createBoard();
  updateLeaderboard();
});

document.getElementById('resetScores').addEventListener('click', () => {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const theme = document.getElementById('themeDropdown').value;

  localStorage.removeItem(`bestTime_${currentUser}_${difficulty}`);
  localStorage.removeItem(`bestMoves_${currentUser}_${difficulty}`);
  localStorage.removeItem(`leaderboard_${theme}_${difficulty}`);

  updateBestStats();
  updateLeaderboard();
  alert('Scores reset.');
});

window.closePopup = closePopup;

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginButton').addEventListener('click', loginUser);
  loadUserFromStorage();
  if (currentUser) {
    createBoard();
    updateLeaderboard();
  }
});
