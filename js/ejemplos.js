// ejemplos.js - Manejo de archivos de ejemplo

class EjemplosManager {
    constructor() {
        this.ejemplos = {
            'ejemplo_4.txt': {
                nombre: 'Ejemplo 4.txt',
                tamaño: 'Pequeño',
                descripcion: 'Conjunto de datos pequeño ideal para pruebas rápidas',
                complejidad: 'O(n log n)',
                tiempo: '2-3 segundos',
                icono: 'fa-database'
            },
            'ejemplo_6.txt': {
                nombre: 'Ejemplo 6.txt',
                tamaño: 'Mediano',
                descripcion: 'Datos de tamaño medio para análisis detallado',
                complejidad: 'O(n²)',
                tiempo: '5-8 segundos',
                icono: 'fa-server'
            },
            'ejemplo_8.txt': {
                nombre: 'Ejemplo 8.txt',
                tamaño: 'Grande',
                descripcion: 'Conjunto extenso para pruebas de rendimiento',
                complejidad: 'O(2ⁿ)',
                tiempo: '10-15 segundos',
                icono: 'fa-cloud'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.cargarEjemplosDisponibles();
    }
    
    setupEventListeners() {
        // Botones "Ejecutar"
        document.querySelectorAll('.btn-example').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const file = btn.getAttribute('data-file');
                this.cargarEjemplo(file);
            });
        });
        
        // Botones "Vista previa"
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const file = btn.getAttribute('data-file');
                this.mostrarVistaPrevia(file);
            });
        });
        
        // Clic en las tarjetas
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-example') && !e.target.closest('.btn-preview')) {
                    const file = card.getAttribute('data-example');
                    this.cargarEjemplo(file);
                }
            });
        });
        
        // Botón "Cargar Todos"
        const loadAllBtn = document.getElementById('load-all-examples');
        if (loadAllBtn) {
            loadAllBtn.addEventListener('click', () => this.cargarTodosLosEjemplos());
        }
        
        // Botón "Comparar"
        const compareBtn = document.getElementById('compare-examples');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => this.compararEjemplos());
        }
        
        // Modal
        const modal = document.getElementById('preview-modal');
        const closeBtn = document.getElementById('modal-close');
        const useFileBtn = document.getElementById('use-this-file');
        const downloadBtn = document.getElementById('download-example');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.cerrarModal());
        }
        
        if (useFileBtn) {
            useFileBtn.addEventListener('click', () => this.usarArchivoActual());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.descargarEjemploActual());
        }
        
        // Cerrar modal haciendo clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal();
                }
            });
        }
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
            }
        });
    }
    
    async cargarEjemplo(fileName) {
        try {
            // Mostrar indicador de carga
            this.mostrarCargando(fileName);
            
            // Obtener la ruta correcta del archivo
            const ruta = `data/${fileName}`;
            
            // Hacer la petición para cargar el archivo
            const respuesta = await fetch(ruta);
            
            if (!respuesta.ok) {
                throw new Error(`Error al cargar ${fileName}: ${respuesta.status}`);
            }
            
            const contenido = await respuesta.text();
            
            // Ocultar indicador de carga
            this.ocultarCargando();
            
            // Mostrar notificación de éxito
            this.mostrarNotificacion(`✅ ${fileName} cargado correctamente`, 'success');
            
            // Resaltar la tarjeta activa
            this.resaltarTarjetaActiva(fileName);
            
            // Procesar el contenido (aquí puedes integrar con tus algoritmos)
            this.procesarContenido(fileName, contenido);
            
            // Actualizar estadísticas
            this.actualizarEstadisticas(fileName, contenido);
            
            console.log(`Archivo ${fileName} cargado:`, contenido.substring(0, 100) + '...');
            
        } catch (error) {
            console.error('Error al cargar ejemplo:', error);
            this.ocultarCargando();
            this.mostrarNotificacion(`❌ Error al cargar ${fileName}`, 'error');
            
            // Mostrar ejemplo simulado si no existe el archivo
            this.mostrarEjemploSimulado(fileName);
        }
    }
    
    async mostrarVistaPrevia(fileName) {
        try {
            const modal = document.getElementById('preview-modal');
            const titulo = document.getElementById('modal-title');
            const contenidoElem = document.getElementById('file-content');
            const statsElem = document.getElementById('file-stats');
            
            if (!modal || !titulo || !contenidoElem) return;
            
            // Mostrar modal con indicador de carga
            modal.classList.add('show');
            titulo.textContent = `Vista Previa: ${fileName}`;
            contenidoElem.textContent = 'Cargando contenido...';
            statsElem.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Cargando estadísticas...</p></div>';
            
            // Establecer archivo actual para el modal
            modal.dataset.currentFile = fileName;
            
            // Cargar contenido del archivo
            const ruta = `data/${fileName}`;
            const respuesta = await fetch(ruta);
            
            if (!respuesta.ok) {
                throw new Error(`No se pudo cargar ${fileName}`);
            }
            
            const contenido = await respuesta.text();
            
            // Mostrar contenido (limitado a 1000 caracteres)
            const contenidoMostrar = contenido.length > 1000 
                ? contenido.substring(0, 1000) + '\n\n... [Contenido truncado] ...' 
                : contenido;
            
            contenidoElem.textContent = contenidoMostrar;
            
            // Mostrar estadísticas
            this.mostrarEstadisticas(fileName, contenido, statsElem);
            
        } catch (error) {
            console.error('Error en vista previa:', error);
            
            // Mostrar ejemplo simulado
            const contenidoElem = document.getElementById('file-content');
            const ejemploSimulado = this.generarEjemploSimulado(fileName);
            
            if (contenidoElem) {
                contenidoElem.textContent = ejemploSimulado;
            }
            
            this.mostrarNotificacion(`⚠️ Mostrando ejemplo simulado de ${fileName}`, 'warning');
            
            // Mostrar estadísticas simuladas
            const statsElem = document.getElementById('file-stats');
            if (statsElem) {
                this.mostrarEstadisticasSimuladas(fileName, statsElem);
            }
        }
    }
    
    mostrarEstadisticas(fileName, contenido, statsElem) {
        const ej = this.ejemplos[fileName];
        const lineas = contenido.split('\n').length;
        const palabras = contenido.split(/\s+/).length;
        const caracteres = contenido.length;
        const tamañoKB = (contenido.length / 1024).toFixed(2);
        
        statsElem.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Tamaño del archivo</div>
                <div class="stat-value">${tamañoKB} KB</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Líneas de datos</div>
                <div class="stat-value">${lineas} líneas</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Palabras</div>
                <div class="stat-value">${palabras} palabras</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Caracteres</div>
                <div class="stat-value">${caracteres} caracteres</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Complejidad estimada</div>
                <div class="stat-value">${ej.complejidad}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Tiempo estimado</div>
                <div class="stat-value">${ej.tiempo}</div>
            </div>
        `;
    }
    
    mostrarEstadisticasSimuladas(fileName, statsElem) {
        const ej = this.ejemplos[fileName];
        const tamaños = {
            'ejemplo_4.txt': '15.2 KB',
            'ejemplo_6.txt': '42.8 KB',
            'ejemplo_8.txt': '128.5 KB'
        };
        
        statsElem.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Tamaño del archivo</div>
                <div class="stat-value">${tamaños[fileName] || 'Desconocido'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Tipo de ejemplo</div>
                <div class="stat-value">${ej.tamaño}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Complejidad estimada</div>
                <div class="stat-value">${ej.complejidad}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Tiempo estimado</div>
                <div class="stat-value">${ej.tiempo}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Estado</div>
                <div class="stat-value" style="color: var(--warning-color);">Ejemplo simulado</div>
            </div>
        `;
    }
    
    generarEjemploSimulado(fileName) {
        const ejemplos = {
            'ejemplo_4.txt': `# Ejemplo de datos pequeños
# Para pruebas rápidas de algoritmos

valores = [23, 45, 12, 67, 89, 34, 56, 78, 90, 21]
resultados = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

# Configuración del algoritmo
iteraciones = 100
tolerancia = 0.001
max_iter = 1000

# Datos de entrada
x = [1.2, 2.4, 3.6, 4.8, 6.0]
y = [2.4, 4.8, 7.2, 9.6, 12.0]

# Fin del archivo ejemplo_4.txt`,
            
            'ejemplo_6.txt': `# Ejemplo de datos medianos
# Para análisis detallado

# Matriz de datos 10x10
matriz = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
    [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
    [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
    [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
    [91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
]

# Lista de nombres para ordenamiento
nombres = [
    "Ana", "Carlos", "Beatriz", "David", "Elena",
    "Fernando", "Gabriela", "Hector", "Isabel", "Javier",
    "Karla", "Luis", "Maria", "Nicolas", "Olivia"
]

# Puntos en 2D para algoritmos geométricos
puntos = [
    (12, 45), (23, 56), (34, 67), (45, 78), (56, 89),
    (67, 12), (78, 23), (89, 34), (90, 45), (12, 56),
    (23, 67), (34, 78), (45, 89), (56, 12), (67, 23)
]

# Fin del archivo ejemplo_6.txt`,
            
            'ejemplo_8.txt': `# Ejemplo de datos grandes
# Para pruebas de rendimiento y escalabilidad

# Secuencia de números grandes (100 elementos)
secuencia_larga = [
    542, 123, 876, 234, 765, 432, 987, 654, 321, 789,
    456, 123, 890, 567, 234, 891, 678, 345, 912, 789,
    654, 321, 987, 654, 321, 789, 456, 123, 890, 567,
    234, 891, 678, 345, 912, 789, 654, 321, 987, 654,
    321, 789, 456, 123, 890, 567, 234, 891, 678, 345,
    912, 789, 654, 321, 987, 654, 321, 789, 456, 123,
    890, 567, 234, 891, 678, 345, 912, 789, 654, 321,
    987, 654, 321, 789, 456, 123, 890, 567, 234, 891,
    678, 345, 912, 789, 654, 321, 987, 654, 321, 789,
    456, 123, 890, 567, 234, 891, 678, 345, 912, 789
]

# Datos para algoritmos de grafo
nodos = 50
aristas = [
    (1, 2, 5), (1, 3, 8), (2, 4, 3), (2, 5, 7), (3, 6, 2),
    (4, 7, 9), (5, 8, 1), (6, 9, 4), (7, 10, 6), (8, 11, 3),
    (9, 12, 7), (10, 13, 2), (11, 14, 8), (12, 15, 5), (13, 16, 9),
    (14, 17, 4), (15, 18, 6), (16, 19, 1), (17, 20, 3), (18, 21, 7),
    (19, 22, 2), (20, 23, 8), (21, 24, 5), (22, 25, 9), (23, 26, 4),
    (24, 27, 6), (25, 28, 1), (26, 29, 3), (27, 30, 7), (28, 31, 2)
]

# Texto largo para algoritmos de búsqueda
texto_largo = """
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
Duis aute irure dolor in reprehenderit in voluptate velit.
Excepteur sint occaecat cupidatat non proident, sunt in culpa.
"""

# Fin del archivo ejemplo_8.txt
`
        };
        
        return ejemplos[fileName] || `# Archivo de ejemplo: ${fileName}\n\nContenido de ejemplo generado automáticamente.`;
    }
    
    mostrarEjemploSimulado(fileName) {
        const contenido = this.generarEjemploSimulado(fileName);
        this.procesarContenido(fileName, contenido);
        this.resaltarTarjetaActiva(fileName);
        this.mostrarNotificacion(`⚠️ Usando ejemplo simulado de ${fileName}`, 'warning');
    }
    
    procesarContenido(fileName, contenido) {
        // Aquí es donde integras con tus algoritmos
        // Por ejemplo:
        
        // 1. Actualizar una variable global
        window.ejemploActual = {
            nombre: fileName,
            contenido: contenido,
            timestamp: new Date()
        };
        
        // 2. Mostrar en la consola para depuración
        console.log(`Procesando ${fileName}:`, {
            longitud: contenido.length,
            lineas: contenido.split('\n').length,
            primerasLineas: contenido.split('\n').slice(0, 3)
        });
        
        // 3. Actualizar la interfaz si existe
        const visualizacion = document.getElementById('algorithm-preview');
        if (visualizacion) {
            visualizacion.innerHTML = `
                <div class="visual-placeholder">
                    <h4>Archivo cargado: ${fileName}</h4>
                    <p>${contenido.split('\n').length} líneas de datos listas</p>
                    <div class="data-preview">
                        <pre>${contenido.substring(0, 200)}...</pre>
                    </div>
                </div>
            `;
        }
        
        // 4. Integrar con tus algoritmos existentes
        this.integrarConAlgoritmos(fileName, contenido);
    }
    
    integrarConAlgoritmos(fileName, contenido) {
        // Aquí llamas a tus funciones de algoritmos.js
        // Por ejemplo:
        
        // Si existe la función procesarDatos en algorithms.js
        if (typeof procesarDatos === 'function') {
            procesarDatos(contenido);
        }
        
        // O si usas un objeto global
        if (window.algoritmoManager) {
            window.algoritmoManager.cargarDatos(contenido);
        }
        
        // También puedes actualizar otras partes de la interfaz
        this.actualizarInterfazConDatos(fileName);
    }
    
    actualizarInterfazConDatos(fileName) {
        // Actualizar título o indicadores
        const titulo = document.querySelector('.hero-title');
        if (titulo) {
            titulo.innerHTML = `Algoritmo ejecutándose con <span class="gradient-text">${fileName}</span>`;
        }
    }
    
    async cargarTodosLosEjemplos() {
        this.mostrarNotificacion('Cargando todos los ejemplos...', 'info');
        
        const archivos = Object.keys(this.ejemplos);
        for (let i = 0; i < archivos.length; i++) {
            await this.cargarEjemplo(archivos[i]);
            await this.delay(1000); // Esperar 1 segundo entre cada carga
        }
        
        this.mostrarNotificacion('Todos los ejemplos han sido cargados', 'success');
    }
    
    compararEjemplos() {
        this.mostrarNotificacion('Funcionalidad de comparación en desarrollo', 'info');
        // Aquí puedes implementar la comparación entre ejemplos
    }
    
    mostrarCargando(fileName) {
        // Deshabilitar todos los botones
        document.querySelectorAll('.btn-example, .btn-preview').forEach(btn => {
            btn.disabled = true;
        });
        
        // Mostrar indicador en la tarjeta
        const card = document.querySelector(`[data-example="${fileName}"]`);
        if (card) {
            const actions = card.querySelector('.example-actions');
            if (actions) {
                const originalHTML = actions.innerHTML;
                actions.innerHTML = `
                    <div class="loading-indicator" style="width: 100%;">
                        <div class="spinner" style="width: 20px; height: 20px; margin: 0 auto;"></div>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem;">Cargando...</p>
                    </div>
                `;
                card.dataset.originalActions = originalHTML;
            }
        }
    }
    
    ocultarCargando() {
        // Habilitar todos los botones
        document.querySelectorAll('.btn-example, .btn-preview').forEach(btn => {
            btn.disabled = false;
        });
        
        // Restaurar contenido original de las tarjetas
        document.querySelectorAll('.example-card').forEach(card => {
            const originalHTML = card.dataset.originalActions;
            if (originalHTML) {
                const actions = card.querySelector('.example-actions');
                if (actions) {
                    actions.innerHTML = originalHTML;
                    // Re-conectar event listeners
                    this.reconectarEventListeners(card);
                }
                delete card.dataset.originalActions;
            }
        });
    }
    
    reconectarEventListeners(card) {
        const file = card.getAttribute('data-example');
        const runBtn = card.querySelector('.btn-example');
        const previewBtn = card.querySelector('.btn-preview');
        
        if (runBtn) {
            runBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cargarEjemplo(file);
            });
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mostrarVistaPrevia(file);
            });
        }
    }
    
    resaltarTarjetaActiva(fileName) {
        // Quitar clase active de todas las tarjetas
        document.querySelectorAll('.example-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Agregar clase active a la tarjeta correspondiente
        const card = document.querySelector(`[data-example="${fileName}"]`);
        if (card) {
            card.classList.add('active');
        }
    }
    
    actualizarEstadisticas(fileName, contenido) {
        // Actualizar estadísticas en tiempo real si hay un elemento para mostrarlas
        const statsContainer = document.getElementById('live-stats');
        if (statsContainer) {
            const lineas = contenido.split('\n').length;
            const palabras = contenido.split(/\s+/).length;
            
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h4>📊 Estadísticas Actuales</h4>
                    <p><strong>Archivo:</strong> ${fileName}</p>
                    <p><strong>Líneas:</strong> ${lineas}</p>
                    <p><strong>Palabras:</strong> ${palabras}</p>
                    <p><strong>Tamaño:</strong> ${(contenido.length / 1024).toFixed(2)} KB</p>
                </div>
            `;
        }
    }
    
    cargarEjemplosDisponibles() {
        // Verificar qué archivos existen realmente
        Object.keys(this.ejemplos).forEach(async (fileName) => {
            try {
                const respuesta = await fetch(`data/${fileName}`, { method: 'HEAD' });
                if (!respuesta.ok) {
                    // Marcar como no disponible
                    const card = document.querySelector(`[data-example="${fileName}"]`);
                    if (card) {
                        card.classList.add('no-disponible');
                        const runBtn = card.querySelector('.btn-example');
                        if (runBtn) {
                            runBtn.disabled = true;
                            runBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No disponible';
                            runBtn.title = 'Archivo no encontrado en data/';
                        }
                    }
                }
            } catch (error) {
                console.log(`Archivo ${fileName} no disponible`);
            }
        });
    }
    
    usarArchivoActual() {
        const modal = document.getElementById('preview-modal');
        const fileName = modal.dataset.currentFile;
        
        if (fileName) {
            this.cerrarModal();
            this.cargarEjemplo(fileName);
        }
    }
    
    descargarEjemploActual() {
        const modal = document.getElementById('preview-modal');
        const fileName = modal.dataset.currentFile;
        const contenido = document.getElementById('file-content').textContent;
        
        if (fileName && contenido) {
            const blob = new Blob([contenido], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.mostrarNotificacion(`📥 ${fileName} descargado`, 'success');
        }
    }
    
    cerrarModal() {
        const modal = document.getElementById('preview-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 
                              tipo === 'error' ? 'exclamation-circle' : 
                              tipo === 'warning' ? 'exclamation-triangle' : 
                              'info-circle'}"></i>
            <span>${mensaje}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Agregar al cuerpo
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        // Configurar botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.ejemplosManager = new EjemplosManager();
});