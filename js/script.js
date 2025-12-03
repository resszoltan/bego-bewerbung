/* -----------------------------------------------------------
    JavaScript für persönliche Portfolio-Seite
    Autor: Zoltan Ress
    Datum: 2025-12-03
----------------------------------------------------------- */

let chooseVisitCount = 0;
let isAnimating = false;
let isDarkMode = false;

function navigateCard(fromCard, toCard, direction) {
    if (isAnimating) return;
    isAnimating = true;

    const fromElement = document.querySelector(`[data-card="${fromCard}"]`);
    const toElement = document.querySelector(`[data-card="${toCard}"]`);

    // Reset counter when returning to the landing page
    if (toCard === 'landing') {
        chooseVisitCount = 0;
        document.getElementById('homeButton').classList.remove('visible');
    }

    // Count visits to choose card
    if (toCard === 'choose') {
        chooseVisitCount++;
        if (chooseVisitCount >= 2) {
            document.getElementById('homeButton').classList.add('visible');
        }
    }

    // Start circle- and counter-animations when navigating to Jurist card
    if (toCard === 'jurist') {
        setTimeout(() => {
            animateProgressCircles();
        }, 300);
    }

    // SCHRITT 1: Setze toCard in Schicht 2 (next-card, z-index 50)
    toElement.classList.add('next-card');

    // SCHRITT 2: Bestimme die Verschiebungsrichtung für fromCard
    let transform = '';
    switch(direction) {
        case 'down':
            transform = 'translateY(100vh)';
            break;
        case 'up':
            transform = 'translateY(-100vh)';
            break;
        case 'left':
            transform = 'translateX(-100vw)';
            break;
        case 'right':
            transform = 'translateX(100vw)';
            break;
    }

    // SCHRITT 3: Führe die Animation aus (fromCard wird weggeschoben)
    // Kurzes Delay damit der Browser die z-index Änderung registriert
    setTimeout(() => {
        fromElement.style.transform = transform;
    }, 10);

    // SCHRITT 4: Nach Animation - Cleanup und Schichtwechsel
    setTimeout(() => {
        // fromCard geht zurück ins Lager (Schicht 1, z-index 1)
        fromElement.classList.remove('current-card');
        fromElement.style.transition = 'none';  // Animation ausschalten
        fromElement.style.transform = '';

        // Nach kurzem Delay Transition wieder aktivieren
        setTimeout(() => {
            fromElement.style.transition = '';
        }, 50);
        
        // toCard wird zur aktuellen Card (Schicht 3, z-index 100)
        toElement.classList.remove('next-card');
        toElement.classList.add('current-card');
        
        isAnimating = false;
    }, 650);
}

// Touch/Swipe Support
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

    // Bestimme welche Card gerade sichtbar ist
    const visibleCard = getVisibleCard();

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
            // Swipe right
            handleSwipeGesture(visibleCard, 'right');
        } else {
            // Swipe left
            handleSwipeGesture(visibleCard, 'left');
        }
    } else if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
            // Swipe down
            handleSwipeGesture(visibleCard, 'down');
        } else {
            // Swipe up
            handleSwipeGesture(visibleCard, 'up');
        }
    }
}

function getVisibleCard() {
    const cards = document.querySelectorAll('.card');
    let highestZIndex = -1;
    let visibleCard = null;

    cards.forEach(card => {
        if (card.classList.contains('hidden')) return;
        const zIndex = parseInt(window.getComputedStyle(card).zIndex);
        if (zIndex > highestZIndex) {
            highestZIndex = zIndex;
            visibleCard = card.getAttribute('data-card');
        }
    });

    return visibleCard;
}

function handleSwipeGesture(currentCard, direction) {
    // Definiere Swipe-Navigation basierend auf aktueller Card
    const swipeMap = {
        'landing': {
            'up': ['landing', 'choose', 'up']
        },
        'choose': {
            'up': ['choose', 'landing', 'up'],
            'left': ['choose', 'itler', 'left'],
            'right': ['choose', 'jurist', 'right']
        },
        'itler': {
            'right': ['itler', 'choose', 'right'],
            'up': ['itler', 'tech', 'up']
        },
        'jurist': {
            'left': ['jurist', 'choose', 'left'],
            'up': ['jurist', 'zertifikate', 'up']
        },
        'tech': {
            'up': ['tech', 'itler', 'up'],
            'right': ['tech', 'ende', 'right']
        },
        'zertifikate': {
            'up': ['zertifikate', 'jurist', 'up'],
            'left': ['zertifikate', 'ende', 'left']
        }
    };

    if (swipeMap[currentCard] && swipeMap[currentCard][direction]) {
        const [from, to, dir] = swipeMap[currentCard][direction];
        navigateCard(from, to, dir);
    }
}

// Prüfe URL-Parameter beim Laden
window.addEventListener('DOMContentLoaded', () => {
    const returnCard = sessionStorage.getItem('returnCard');
    
    if (returnCard) {
        navigateCard('landing', returnCard, 'up');
        sessionStorage.removeItem('returnCard');
    }
});

function toggleDarkMode() {
    const zertifikateCard = document.querySelector('[data-card="zertifikate"]');
    const toggleButton = document.getElementById('darkModeToggle');
    
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        zertifikateCard.classList.add('dark-mode');
        toggleButton.textContent = '🌞';
    } else {
        zertifikateCard.classList.remove('dark-mode');
        toggleButton.textContent = '🌙';
    }
}

function animateProgressCircles() {
    console.log('Animation gestartet!'); // Debug
    
    // Reset circles first
    const circle1 = document.getElementById('progress1');
    const circle2 = document.getElementById('progress2');
    const counter1 = document.getElementById('counter1');
    const counter2 = document.getElementById('counter2');
    
    if (!circle1 || !circle2) {
        console.error('Circles nicht gefunden!');
        return;
    }
    
    // Explizit auf 0 setzen
    circle1.style.transition = 'none';
    circle2.style.transition = 'none';
    circle1.style.strokeDasharray = '0 326.73';
    circle2.style.strokeDasharray = '0 326.73';
    counter1.textContent = '0';
    counter2.textContent = '0';
    
    // Force reflow
    circle1.offsetHeight;
    circle2.offsetHeight;
    
    // Start animations
    setTimeout(() => {
        circle1.style.transition = 'stroke-dasharray 2s cubic-bezier(0.4, 0, 0.2, 1)';
        circle2.style.transition = 'stroke-dasharray 2s cubic-bezier(0.4, 0, 0.2, 1)';
        
        circle1.style.strokeDasharray = '245.04 326.73';
        circle2.style.strokeDasharray = '245.04 326.73';
        
        animateCounter('counter1', 0, 1500, 2000, true);
        animateCounter('counter2', 0, 3300, 2000, true);
        
        console.log('Animation sollte laufen!'); // Debug
    }, 100);
}

function animateCounter(elementId, start, end, duration, addPlus = false) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Counter element nicht gefunden:', elementId);
        return;
    }
    
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.floor(start + (end - start) * easeProgress);
        element.textContent = current + (progress === 1 && addPlus ? '+' : '');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}