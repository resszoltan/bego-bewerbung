/* -----------------------------------------------------------
    JavaScript für persönliche Portfolio-Seite
    Autor: Zoltan Ress
    Datum: 2025-12-08
----------------------------------------------------------- */

function openVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('video');
    modal.classList.add('active');
    video.play();
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('video');
    modal.classList.remove('active');
    video.pause();
    video.currentTime = 0;
}

// ESC-Taste zum Schließen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVideoModal();
    }
});

// Klick außerhalb des Videos schließt Modal
document.getElementById('videoModal').addEventListener('click', (e) => {
    if (e.target.id === 'videoModal') {
        closeVideoModal();
    }
});