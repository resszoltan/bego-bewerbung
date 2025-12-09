/* -----------------------------------------------------------
    JavaScript für persönliche Portfolio-Seite
    Autor: Zoltan Ress
    Datum: 2025-12-09
----------------------------------------------------------- */

// Game State
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let gameStarted = false;
let isProcessing = false;

// Emojis für die Karten
const emojis = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎲', '🎸', '🎺'];

// Sound Effects (Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function flipSound() {
    playSound(400, 0.1);
}

function matchSound() {
    playSound(600, 0.15);
    setTimeout(() => playSound(800, 0.15), 100);
}

function winSound() {
    playSound(523, 0.2);
    setTimeout(() => playSound(659, 0.2), 150);
    setTimeout(() => playSound(784, 0.3), 300);
}

// Initialize Game
function initGame() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Create card pairs
    const cardEmojis = [...emojis, ...emojis];
    cardEmojis.sort(() => Math.random() - 0.5);
    
    cards = cardEmojis.map((emoji, index) => ({
        id: index,
        emoji: emoji,
        flipped: false,
        matched: false
    }));

    // Render cards
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.innerHTML = `
            <div class="card-back">❓</div>
            <div class="card-front">${card.emoji}</div>
        `;
        cardElement.addEventListener('click', () => flipCard(card.id));
        gameBoard.appendChild(cardElement);
    });

    // Reset game state
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    gameStarted = false;
    isProcessing = false;
    
    updateDisplay();
    stopTimer();
}

function flipCard(cardId) {
    if (isProcessing) return;
    
    const card = cards[cardId];
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    
    if (card.flipped || card.matched || flippedCards.length >= 2) return;

    // Start timer on first move
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    // Flip card
    card.flipped = true;
    cardElement.classList.add('flipped');
    flippedCards.push(card);
    flipSound();

    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        updateDisplay();
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.emoji === card2.emoji) {
        // Match!
        setTimeout(() => {
            card1.matched = true;
            card2.matched = true;
            document.querySelector(`[data-id="${card1.id}"]`).classList.add('matched');
            document.querySelector(`[data-id="${card2.id}"]`).classList.add('matched');
            matchSound();
            
            matchedPairs++;
            flippedCards = [];
            isProcessing = false;

            if (matchedPairs === emojis.length) {
                setTimeout(() => endGame(), 500);
            }
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            card1.flipped = false;
            card2.flipped = false;
            document.querySelector(`[data-id="${card1.id}"]`).classList.remove('flipped');
            document.querySelector(`[data-id="${card2.id}"]`).classList.remove('flipped');
            flippedCards = [];
            isProcessing = false;
        }, 1000);
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateDisplay() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timeDisplay').textContent = 
        `${minutes}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('movesDisplay').textContent = moves;
}

function endGame() {
    stopTimer();
    winSound();
    
    // Save highscore
    const score = {
        time: seconds,
        moves: moves,
        date: new Date().toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    saveHighscore(score);

    // Show win modal
    document.getElementById('finalTime').textContent = 
        document.getElementById('timeDisplay').textContent;
    document.getElementById('finalMoves').textContent = moves;
    
    displayHighscoresInModal('winHighscores');
    document.getElementById('winModal').classList.add('active');
}

function saveHighscore(score) {
    let highscores = JSON.parse(localStorage.getItem('memoryHighscores') || '[]');
    highscores.push(score);
    highscores.sort((a, b) => a.time - b.time || a.moves - b.moves);
    highscores = highscores.slice(0, 10); // Keep top 10
    localStorage.setItem('memoryHighscores', JSON.stringify(highscores));
}

function displayHighscoresInModal(elementId) {
    const highscores = JSON.parse(localStorage.getItem('memoryHighscores') || '[]');
    const container = document.getElementById(elementId);
    
    if (highscores.length === 0) {
        container.innerHTML = '<p style="color: #666;">Noch keine Bestzeiten vorhanden.</p>';
        return;
    }

    const top3 = highscores.slice(0, 3);
    container.innerHTML = top3.map((score, index) => {
        const minutes = Math.floor(score.time / 60);
        const secs = score.time % 60;
        const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
        const medal = ['🥇', '🥈', '🥉'][index];
        
        return `
            <div class="highscore-item">
                <span>${medal} ${timeStr} - ${score.moves} Züge</span>
                <span style="font-size: 0.9rem; ">${score.date}</span>
            </div>
        `;
    }).join('');
}

function showHighscores() {
    displayHighscoresInModal('highscoreList');
    document.getElementById('highscoreModal').classList.add('active');
}

function closeHighscores() {
    document.getElementById('highscoreModal').classList.remove('active');
}

function restartGame() {
    document.getElementById('winModal').classList.remove('active');
    initGame();
}

function exitGame() {
    if (confirm('Möchtest du das Spiel wirklich beenden?')) {
        window.close();
    }
}

// Initialize on load
initGame();