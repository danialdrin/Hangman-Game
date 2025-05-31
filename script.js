// DOM Elements
const wordEl = document.getElementById('word');
const wrongLettersEl = document.getElementById('wrong-letters');
const playAgainBtn = document.getElementById('play-again');
const popup = document.getElementById('popup-container');
const notification = document.getElementById('notification-container');
const finalMessage = document.getElementById('final-message');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const startGameBtn = document.getElementById('start-game-btn');
const startDifficultySelect = document.getElementById('start-difficulty');
const coinCountEl = document.getElementById('coin-count');
const celebration = document.getElementById('celebration');
const newGameBtn = document.getElementById('new-game-btn');
const currentDifficultyEl = document.getElementById('current-difficulty');
const difficultyDisplayEl = document.getElementById('difficulty-display');
const useHintBtn = document.getElementById('use-hint-btn');
const buyHintBtn = document.getElementById('buy-hint-btn');

const figureParts = document.querySelectorAll('.figure-part');

// Game State Variables
let score = 0;
let coins = 0;
let timeLeft = 60;
let timer;
let hints = 1;
let wordHint = '';
let gameStarted = false;
let selectedDifficulty = 'medium';
let lastActivityTime = Date.now();
let idleTimer;

const wordData = [
	{ word: 'life', hint: 'The state of being alive' },
	{ word: 'moment', hint: 'A brief period of time' },
	{ word: 'school', hint: 'A place of learning' },
	{ word: 'college', hint: 'A higher education institution' },
	{ word: 'number', hint: 'A mathematical value' },
	{ word: 'string', hint: 'A sequence of characters' },
	{ word: 'apple', hint: 'A type of fruit' },
	{ word: 'mango', hint: 'A tropical fruit' },
	{ word: 'fruits', hint: 'Plural of fruit' },
	{ word: 'guava', hint: 'A tropical fruit with edible seeds' },
	{ word: 'tiger', hint: 'A large cat' },
	{ word: 'dog', hint: 'A domesticated carnivorous mammal' },
	{ word: 'ship', hint: 'A vessel for traveling on water' },
	{ word: 'sailor', hint: 'A person who navigates a ship' },
	{ word: 'rocket', hint: 'A vehicle that flies into space' },
	{ word: 'planet', hint: 'A celestial body in space' },
	{ word: 'device', hint: 'An electronic gadget' },
	{ word: 'google', hint: 'A popular search engine' },
	{ word: 'coding', hint: 'The act of writing software' },
	{ word: 'artist', hint: 'A person who creates art' },
	{ word: 'yellow', hint: 'A bright color' },
	{ word: 'monkey', hint: 'An agile animal that swings on trees' },
	{ word: 'elephant', hint: 'A large mammal with a trunk' },
	{ word: 'notebook', hint: 'A book for writing notes' },
	{ word: 'hardware', hint: 'The physical parts of a computer' },
	{ word: 'password', hint: 'A secret word used for access' },
	{ word: 'mountain', hint: 'A large natural elevation of the earth surface' }
];


function selectRandomWord() {
	const randomIndex = Math.floor(Math.random() * wordData.length);
	selectedWord = wordData[randomIndex].word;
	wordHint = wordData[randomIndex].hint;
	console.log(selectedWord);
}

selectRandomWord();

const correctLetters = [];
const wrongLetters = [];

function displayWord() {
	wordEl.innerHTML = `
	${selectedWord
		.split('')
		.map(
			(letter) =>
				`<span class="letter">${
					correctLetters.includes(
						letter
					)
						? letter
						: ''
				}</span>`
		)
		.join('')}
	`;

	// Adjust letter size based on word length
	adjustLetterSize();

	const innerWord = wordEl.innerText.replace(/\n/g, '');

	if (innerWord === selectedWord) {
		clearInterval(timer);
		showCelebration();
		setTimeout(() => {
			finalMessage.innerText = '🎉 Congratulations! You Won! 🎉';
			document.getElementById('final-score').textContent = score;
			document.getElementById('final-coins').textContent = coins;
			popup.style.display = 'flex';
		}, 2000);
	}
}

// Adjust letter size based on word length to prevent overflow
function adjustLetterSize() {
	const letters = document.querySelectorAll('.letter');
	const wordLength = selectedWord.length;

	// Calculate available width (game container width minus padding and margins)
	const containerWidth = 510; // 550px - 40px padding
	const availableWidth = containerWidth - 100; // Leave some margin

	// Calculate required width per letter (including margins)
	const totalLetterWidth = wordLength * 33; // 25px width + 8px margin on each side

	if (totalLetterWidth > availableWidth) {
		// Reduce size if word is too long
		const scaleFactor = availableWidth / totalLetterWidth;
		const newWidth = Math.floor(25 * scaleFactor);
		const newMargin = Math.floor(8 * scaleFactor);
		const newFontSize = Math.floor(28 * scaleFactor);
		const newHeight = Math.floor(50 * scaleFactor);

		letters.forEach(letter => {
			letter.style.width = `${newWidth}px`;
			letter.style.margin = `0 ${newMargin}px`;
			letter.style.fontSize = `${newFontSize}px`;
			letter.style.height = `${newHeight}px`;
		});
	} else {
		// Reset to default size
		letters.forEach(letter => {
			letter.style.width = '25px';
			letter.style.margin = '0 8px';
			letter.style.fontSize = '28px';
			letter.style.height = '50px';
		});
	}
}

// Update the wrong letters
function updateWrongLettersEl() {
	// Display Wrong Letters
	wrongLettersEl.innerHTML = `
	${wrongLetters.length > 0 ? '<p>Wrong</p>' : ''}
	${wrongLetters.map((letter) => `<span>${letter}</span>`)}`;

	// Display Parts
	figureParts.forEach((part, index) => {
		const errors = wrongLetters.length;

		if (index < errors) {
			part.style.display = 'block';
		} else {
			part.style.display = 'none';
		}
	});

	// Check if 'lost'
	if (wrongLetters.length === figureParts.length) {
		clearInterval(timer);
		finalMessage.innerHTML = '😞 Unfortunately you lost... 😞';
		document.getElementById('final-score').textContent = score;
		document.getElementById('final-coins').textContent = coins;
		popup.style.display = 'flex';
	}
}

// Show notification
function showNotification() {
	notification.classList.add('show');
	setTimeout(() => {
		notification.classList.remove('show');
	}, 2000);
}

// keydown letter press
window.addEventListener('keydown', (e) => {
	if (!gameStarted) return; // Only allow input when game is started

	if (e.keyCode >= 65 && e.keyCode <= 90) {
		const letter = e.key.toLowerCase();

		if (selectedWord.includes(letter)) {
			if (!correctLetters.includes(letter)) {
				correctLetters.push(letter);

				// Add coins for correct guess
				coins += 10;
				updateCoins();

				// Add animation to coin display
				coinCountEl.parentElement.classList.add('coin-animation');
				setTimeout(() => {
					coinCountEl.parentElement.classList.remove('coin-animation');
				}, 600);

				displayWord();
			} else {
				showNotification();
			}
		} else {
			if (!wrongLetters.includes(letter)) {
				wrongLetters.push(letter);

				updateWrongLettersEl();
			} else {
				showNotification();
			}
		}
	}
});

// Initialize timer
function startTimer() {
	clearInterval(timer);
	timer = setInterval(() => {
		timeLeft--;
		timerEl.textContent = `⏰ Time: ${timeLeft}s`;

		if (timeLeft === 0) {
			clearInterval(timer);
			finalMessage.innerText = '⏰ Time\'s up! You lost.';
			document.getElementById('final-score').textContent = score;
			document.getElementById('final-coins').textContent = coins;
			popup.style.display = 'flex';
		}
	}, 1000);
}

// Use hint function
function useHint() {
	if (hints > 0) {
		hints--;
		updateHintButtons();
		notification.innerHTML = `<p>💡 Hint: ${wordHint}</p>`;
		notification.classList.add('show');
		setTimeout(() => {
			notification.classList.remove('show');
		}, 1500);
		resetIdleTimer();
	}
}

// Buy hint function
function buyHint() {
	if (coins >= 50) {
		coins -= 50;
		hints++;
		updateCoins();
		updateHintButtons();
		notification.innerHTML = '<p>🪙 Hint purchased! You now have an extra hint.</p>';
		notification.classList.add('show');
		setTimeout(() => {
			notification.classList.remove('show');
		}, 1200);
		resetIdleTimer();
	}
}

// Update hint buttons state
function updateHintButtons() {
	// Update hints display
	document.getElementById('hints-left').textContent = hints;

	// Update use hint button
	if (hints > 0) {
		useHintBtn.classList.remove('disabled');
		useHintBtn.disabled = false;
	} else {
		useHintBtn.classList.add('disabled');
		useHintBtn.disabled = true;
	}

	// Update buy hint button
	if (coins >= 50) {
		buyHintBtn.classList.remove('disabled');
		buyHintBtn.disabled = false;
	} else {
		buyHintBtn.classList.add('disabled');
		buyHintBtn.disabled = true;
	}

	// Stop blinking if no hints available and can't buy
	if (hints === 0 && coins < 50) {
		useHintBtn.classList.remove('hint-blink');
		buyHintBtn.classList.remove('hint-blink');
	}
}

// Update coins display
function updateCoins() {
	coinCountEl.textContent = coins;
	updateHintButtons();
}

// Reset idle timer
function resetIdleTimer() {
	lastActivityTime = Date.now();
	clearTimeout(idleTimer);

	// Remove blinking
	useHintBtn.classList.remove('hint-blink');
	buyHintBtn.classList.remove('hint-blink');

	// Start new idle timer
	idleTimer = setTimeout(() => {
		if (gameStarted && (hints > 0 || coins >= 50)) {
			// Start blinking if player has hints or can buy hints
			if (hints > 0) {
				useHintBtn.classList.add('hint-blink');
			}
			if (coins >= 50) {
				buyHintBtn.classList.add('hint-blink');
			}
		}
	}, 5000);
}

// Show celebration animation
function showCelebration() {
	celebration.classList.add('active');
	setTimeout(() => {
		celebration.classList.remove('active');
	}, 3000);
}

// Start game function
function startGame() {
	gameStarted = true;
	startScreen.style.display = 'none';
	gameScreen.style.display = 'flex';

	// Set difficulty from start screen
	selectedDifficulty = startDifficultySelect.value;

	// Update difficulty display in game screen
	updateDifficultyDisplay();

	// Set timer based on difficulty
	if (selectedDifficulty === 'easy') {
		timeLeft = 90;
	} else if (selectedDifficulty === 'medium') {
		timeLeft = 60;
	} else {
		timeLeft = 30;
	}

	initGame();
}

// Update difficulty display
function updateDifficultyDisplay() {
	const difficultyText = selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1);
	currentDifficultyEl.textContent = difficultyText;

	// Remove existing difficulty classes
	difficultyDisplayEl.classList.remove('easy', 'medium', 'hard');
	// Add current difficulty class
	difficultyDisplayEl.classList.add(selectedDifficulty);
}

// Update restart game function - now goes back to start screen
playAgainBtn.addEventListener('click', () => {
	// Reset all game state
	gameStarted = false;
	correctLetters.splice(0);
	wrongLetters.splice(0);
	score = 0;
	coins = 0;
	hints = 1;

	// Clear all timers
	clearInterval(timer);
	clearTimeout(idleTimer);

	// Remove any blinking animations
	useHintBtn.classList.remove('hint-blink');
	buyHintBtn.classList.remove('hint-blink');

	// Reset displays
	updateScore();
	updateCoins();
	updateHintButtons();

	// Clear word display
	wordEl.innerHTML = '';

	// Clear wrong letters
	document.getElementById('wrong-letters').innerHTML = '';

	// Hide all hangman parts
	figureParts.forEach(part => {
		part.style.display = 'none';
	});

	// Hide popup and game screen, show start screen
	popup.style.display = 'none';
	gameScreen.style.display = 'none';
	startScreen.style.display = 'flex';
});

// New game function (goes back to start screen)
function newGame() {
	// Reset all game state
	gameStarted = false;
	correctLetters.splice(0);
	wrongLetters.splice(0);
	score = 0;
	coins = 0;
	hints = 1;

	// Clear all timers
	clearInterval(timer);
	clearTimeout(idleTimer);

	// Remove any blinking animations
	useHintBtn.classList.remove('hint-blink');
	buyHintBtn.classList.remove('hint-blink');

	// Reset displays
	updateScore();
	updateCoins();
	updateHintButtons();

	// Clear word display
	wordEl.innerHTML = '';

	// Clear wrong letters
	document.getElementById('wrong-letters').innerHTML = '';

	// Hide all hangman parts
	figureParts.forEach(part => {
		part.style.display = 'none';
	});

	// Hide game screen and show start screen
	gameScreen.style.display = 'none';
	startScreen.style.display = 'flex';
}

// Initialize game
function initGame() {
	selectRandomWord();
	displayWord();
	updateScore();
	updateCoins();
	updateHintButtons();
	startTimer();
	resetIdleTimer();
}

// Update score
function updateScore() {
	scoreEl.textContent = `Score: ${score}`;
}

// Event Listeners
startGameBtn.addEventListener('click', startGame);
useHintBtn.addEventListener('click', useHint);
buyHintBtn.addEventListener('click', buyHint);
newGameBtn.addEventListener('click', newGame);

// Add activity listeners to reset idle timer
window.addEventListener('keydown', resetIdleTimer);
window.addEventListener('click', resetIdleTimer);
window.addEventListener('mousemove', resetIdleTimer);

// Don't initialize game on load - wait for user to start
// Show start screen by default
