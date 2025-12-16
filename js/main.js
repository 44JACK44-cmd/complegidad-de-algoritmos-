// main.js - Punto de entrada principal

document.addEventListener('DOMContentLoaded', function() {
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está cargado');
    }
    
    // Inicializar la interfaz
    if (window.ui) {
        window.ui.inicializar();
    } else {
        console.error('Interfaz de usuario no disponible');
    }
    
    // Configurar navegación suave
    configurarNavegacion();
    
    console.log('Aplicación de Calendarios Deportivos iniciada');
});

// Configurar navegación suave para enlaces internos
function configurarNavegacion() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Variables globales
window.currentData = null;
window.currentAlgorithm = 'constructivo';
window.currentCalendario = null;
window.executionResults = null;
window.ultimoTiempoEjecucion = null;

// Función global para mostrar detalles de gira
window.mostrarDetallesGira = function(indice) {
    if (window.ui && typeof window.ui.mostrarDetallesGira === 'function') {
        window.ui.mostrarDetallesGira(indice);
    }
};

// Función para generar datos aleatorios (para pruebas)
window.generarDatosAleatorios = function(n) {
    const D = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                row.push(0);
            } else {
                row.push(Math.floor(Math.random() * 900) + 100);
            }
        }
        D.push(row);
    }
    
    return {
        n,
        minStreak: 1,
        maxStreak: 3,
        D
    };
};

// Polyfill para performance.memory si no existe
if (typeof performance === 'undefined') {
    window.performance = {};
}
if (!performance.memory) {
    performance.memory = {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
    };
}