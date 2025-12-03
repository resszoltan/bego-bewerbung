/* -----------------------------------------------------------
    JavaScript für persönliche Portfolio-Seite
    Autor: Zoltan Ress
    Datum: 2025-12-02
----------------------------------------------------------- */

let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetDisplay = false;

const mainDisplay = document.getElementById('mainDisplay');
const secondaryDisplay = document.getElementById('secondaryDisplay');

function updateDisplay() {
    mainDisplay.textContent = currentInput;
    if (previousInput && operator) {
        secondaryDisplay.textContent = `${previousInput} ${operator}`;
    } else {
        secondaryDisplay.textContent = '';
    }
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        currentInput = number;
        shouldResetDisplay = false;
    } else {
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else if (number === '.' && currentInput.includes('.')) {
            return;
        } else {
            currentInput += number;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (operator && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
    updateDisplay();
}

function calculate() {
    if (!operator || !previousInput) return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;

    switch(operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                currentInput = 'Error';
                updateDisplay();
                setTimeout(() => {
                    clearAll();
                }, 1500);
                return;
            }
            result = prev / current;
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }

    // Runde auf 8 Dezimalstellen
    result = Math.round(result * 100000000) / 100000000;
    
    currentInput = result.toString();
    operator = null;
    previousInput = '';
    shouldResetDisplay = true;
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Tastatur-Support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendNumber('.');
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        appendOperator(e.key);
    } else if (e.key === '%') {
        appendOperator('%');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        clearAll();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    }
});

// Initial Display
updateDisplay();