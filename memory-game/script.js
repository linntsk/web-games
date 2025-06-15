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
    alert("Please enter your name to log in.");
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

function getSelectedTheme() {
  return document.getElementById('themeDropdown').value;
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
  const theme = getSelectedTheme();
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

  if (lockBoard || this === firstCard || this.classList.contains('matched')) return;

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

  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    // ✅ DO NOT clear innerText or unflip for matched cards
    setTimeout(() => {
      resetTurn();
      checkGameOver();
    }, 500); // Shorter delay is OK here
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
    setTimeout(() => {
      document.getElementById('finalTime').textContent = timer;
      document.getElementById('finalMoves').textContent = moves;

      const difficulty = document.getElementById('difficultyDropdown').value;
      const bestTimeKey = `bestTime_${currentUser}_${difficulty}`;
      const bestMovesKey = `bestMoves_${currentUser}_${difficulty}`;
      const prevBestTime = localStorage.getItem(bestTimeKey);
      const prevBestMoves = localStorage.getItem(bestMovesKey);

      saveToLeaderboard(timer, moves);
      updateLeaderboard();

      let message = '';
      
      if (!prevBestTime || timer < prevBestTime) {
        localStorage.setItem(bestTimeKey, timer);
        message += `🎯 New Best Time!<br>`;
      }
      
      if (!prevBestMoves || moves < prevBestMoves) {
        localStorage.setItem(bestMovesKey, moves);
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
  const entry = {
    user: currentUser,
    time,
    moves,
    date: new Date().toLocaleString()
  };

  const key = `leaderboard_${theme}_${difficulty}`;
  const current = JSON.parse(localStorage.getItem(key)) || [];

  current.push(entry);
  current.sort((a, b) => a.time - b.time || a.moves - b.moves);
  const top5 = current.slice(0, 5);

  localStorage.setItem(key, JSON.stringify(top5));
}

function updateLeaderboard() {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const theme = document.getElementById('themeDropdown').value;
  const key = `leaderboard_${theme}_${difficulty}`;
  const scores = JSON.parse(localStorage.getItem(key)) || [];

  const label = document.getElementById('leaderboardLabel');
  label.textContent = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)} | Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;

  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';

  if (scores.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No scores yet!';
    emptyMessage.style.color = '#777';
    list.appendChild(emptyMessage);
    return;
  }

  scores.forEach((score, index) => {
    const item = document.createElement('li');
    item.textContent = `${index + 1}. 👤 ${score.user} | ⏱️ ${score.time}s | 🔢 ${score.moves} moves | 📅 ${score.date}`;
    list.appendChild(item);
  });
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

document.getElementById('loginButton').addEventListener('click', loginUser);

document.getElementById('resetScores').addEventListener('click', () => {
  const difficulty = document.getElementById('difficultyDropdown').value;
  const theme = document.getElementById('themeDropdown').value;
  localStorage.removeItem(`bestTime_${currentUser}_${difficulty}`);
  localStorage.removeItem(`bestMoves_${currentUser}_${difficulty}`);
  localStorage.removeItem(`leaderboard_${theme}_${difficulty}`);
  updateBestStats();
  updateLeaderboard();
  alert('Best scores and leaderboard for this theme and difficulty have been reset.');
});

document.getElementById('leaderboardToggle').addEventListener('click', () => {
  const content = document.getElementById('leaderboardSectionContent');
  const header = document.getElementById('leaderboardToggle');
  
  content.classList.toggle('hidden');
  if (content.classList.contains('hidden')) {
    header.textContent = '🏅 Leaderboard ▼';
  } else {
    header.textContent = '🏅 Leaderboard ▲';
  }
});

function closePopup() {
  document.getElementById('winPopup').classList.add('hidden');
  createBoard();
}

window.closePopup = closePopup;

window.addEventListener('DOMContentLoaded', () => {
  loadUserFromStorage();
  if (currentUser) {
    createBoard();
    updateLeaderboard();
  }
});
