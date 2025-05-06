let currentStream;
let facingMode = 'environment'; // 'environment' para cámara trasera, 'user' para frontal

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js');
    });
}

// Elementos del DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const switchButton = document.getElementById('switch-camera');
const gridOverlay = document.querySelector('.grid-overlay');
const result = document.getElementById('result');

// Crear grilla numerada
function createGrid() {
    gridOverlay.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-cell-number', i + 1);
        gridOverlay.appendChild(cell);
    }
}

// Inicializar cámara
async function initCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            const videoAspectRatio = video.videoWidth / video.videoHeight;
            const containerWidth = video.offsetWidth;
            const containerHeight = containerWidth / videoAspectRatio;
            video.parentElement.style.height = `${containerHeight}px`;
        };

    } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

// Cambiar cámara
switchButton.addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    initCamera();
});

// Capturar imagen
captureButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Dibujar el video
    ctx.drawImage(video, 0, 0);
    
    // Dibujar la grilla
    const cellWidth = canvas.width / 3;
    const cellHeight = canvas.height / 3;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    // Líneas verticales
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, canvas.height);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(canvas.width, i * cellHeight);
        ctx.stroke();
    }
    
    // Números de las celdas
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const number = i * 3 + j + 1;
            ctx.fillText(
                number.toString(),
                j * cellWidth + 10,
                i * cellHeight + 30
            );
        }
    }

    // Convertir a imagen
    const image = canvas.toDataURL('image/jpeg');
    
    // Mostrar resultado
    result.innerHTML = `
        <h3>Imagen Capturada:</h3>
        <img src="${image}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;">
    `;
});

// Inicializar la aplicación
createGrid();
initCamera();