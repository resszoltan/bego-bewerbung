// Grid Position Management
let currentCard = 2;        // Start bei Landing Page (Card 2)
let card5VisitCount = 0;    // Zähler für Card 5 Besuche

// Card Positionen im Grid (row, col)
const cardPositions = {
    1: { row: 2, col: 0 },
    2: { row: 2, col: 1 },  // Landing page
    3: { row: 2, col: 2 },
    4: { row: 1, col: 0 },  // Der ITler
    5: { row: 1, col: 1 },  // Choose Your Character
    6: { row: 1, col: 2 },  // Der Jurist
    7: { row: 0, col: 0 },  // Technologien
    8: { row: 0, col: 1 },  // Dankeschön
    9: { row: 0, col: 2 }   // Zertifikate
};

function navigateTo(cardNumber) {
    currentCard = cardNumber;
    
    // Zurücksetzen des Zählers wenn zur Landing Page zurückgekehrt wird
    if (cardNumber === 2) {
        card5VisitCount = 0;
        const homeButton = document.getElementById('homeButton');
        homeButton.classList.remove('visible');
    }
    
    // Zähle Besuche auf Card 5
    if (cardNumber === 5) {
        card5VisitCount++;
        updateHomeButtonVisibility();
    }
    
    updateGridPosition();
}

function updateHomeButtonVisibility() {
    const homeButton = document.getElementById('homeButton');
    if (card5VisitCount >= 2) {
        homeButton.classList.add('visible');
    }
}

function updateGridPosition() {
    const position = cardPositions[currentCard];
    const gridContainer = document.getElementById('gridContainer');
    
    // Berechne die Translation basierend auf der Card-Position
    const translateX = -position.col * 100;
    const translateY = -position.row * 100;
    
    gridContainer.style.transform = `translate(${translateX}vw, ${translateY}vh)`;
}

// Initial Position setzen (Card 2 - Landing Page)
updateGridPosition();

// Touch/Swipe Support für mobile Geräte
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const viewport = document.querySelector('.viewport');

viewport.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

viewport.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;

    // Horizontal swipe hat Priorität wenn größer
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Swipe right - zeige linke Card
            handleSwipeRight();
        } else {
            // Swipe left - zeige rechte Card
            handleSwipeLeft();
        }
    } else if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
            // Swipe down - zeige obere Card
            handleSwipeDown();
        } else {
            // Swipe up - zeige untere Card
            handleSwipeUp();
        }
    }
}

function handleSwipeLeft() {
    const pos = cardPositions[currentCard];
    // Suche Card rechts davon
    for (let card in cardPositions) {
        if (cardPositions[card].row === pos.row && 
            cardPositions[card].col === pos.col + 1) {
            navigateTo(parseInt(card));
            break;
        }
    }
}

function handleSwipeRight() {
    const pos = cardPositions[currentCard];
    // Suche Card links davon
    for (let card in cardPositions) {
        if (cardPositions[card].row === pos.row && 
            cardPositions[card].col === pos.col - 1) {
            navigateTo(parseInt(card));
            break;
        }
    }
}

function handleSwipeUp() {
    const pos = cardPositions[currentCard];
    // Suche Card darunter
    for (let card in cardPositions) {
        if (cardPositions[card].col === pos.col && 
            cardPositions[card].row === pos.row + 1) {
            navigateTo(parseInt(card));
            break;
        }
    }
}

function handleSwipeDown() {
    const pos = cardPositions[currentCard];
    // Suche Card darüber
    for (let card in cardPositions) {
        if (cardPositions[card].col === pos.col && 
            cardPositions[card].row === pos.row - 1) {
            navigateTo(parseInt(card));
            break;
        }
    }
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
            handleSwipeRight();
            break;
        case 'ArrowRight':
            handleSwipeLeft();
            break;
        case 'ArrowUp':
            handleSwipeDown();
            break;
        case 'ArrowDown':
            handleSwipeUp();
            break;
    }
});
