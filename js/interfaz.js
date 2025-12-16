// js/interfaz.js - Funciones de interfaz de usuario

class InterfazUsuario {
    constructor() {
        this.visualizador = null;
        this.fechaActual = 0;
        this.calendarioCompleto = null;
        this.manejadorArchivos = null;
        this.inicializado = false;
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        this.manejadorArchivos = new ManejadorArchivos();
        
        this.inicializarEventos();
        this.inicializarComponentes();
        
        // Cargar ejemplo por defecto
        setTimeout(() => {
            this.cargarEjemplo('4');
        }, 500);
        
        this.inicializado = true;
        console.log('Interfaz de usuario inicializada');
    }
    
    inicializarEventos() {
        // Eventos de carga de archivos
        this.setupFileUpload();
        
        // Eventos de ejemplos
        const ejemploBtns = document.querySelectorAll('[data-example]');
        ejemploBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const ejemplo = btn.dataset.example;
                this.cargarEjemplo(ejemplo);
            });
        });
        
        // Eventos de algoritmo
        const algorithmCards = document.querySelectorAll('.algorithm-card');
        algorithmCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.seleccionarAlgoritmo(e);
            });
        });
        
        // Eventos de pestañas
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.cambiarPestaña(e);
            });
        });
        
        // Eventos del calendario
        const prevDateBtn = document.getElementById('prevDate');
        const nextDateBtn = document.getElementById('nextDate');
        
        if (prevDateBtn) {
            prevDateBtn.addEventListener('click', () => this.navegarFecha(-1));
        }
        
        if (nextDateBtn) {
            nextDateBtn.addEventListener('click', () => this.navegarFecha(1));
        }
        
        // Evento de exportación
        const exportBtn = document.getElementById('exportCalendar');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportarCalendario());
        }
        
        // Evento de ejecución
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.ejecutarAlgoritmo());
        }
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        
        if (!uploadArea || !fileInput || !selectFileBtn) return;
        
        // Click en el botón
        selectFileBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Selección de archivo
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#e8f4fc';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#f8fafc';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#f8fafc';
            
            if (e.dataTransfer.files.length) {
                this.handleFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            await this.handleFile(file);
        }
    }
    
    async handleFile(file) {
        const loadingOverlay = this.mostrarCargando('Cargando archivo...');
        
        try {
            const datos = await this.manejadorArchivos.leerArchivoEntrada(file);
            
            // Guardar datos globalmente
            window.currentData = datos;
            window.currentAlgorithm = 'constructivo';
            
            // Actualizar UI
            this.actualizarInfoArchivo(file.name, datos);
            this.actualizarVistaPreviaMatriz(datos.D);
            this.habilitarEjecucion();
            this.resaltarAlgoritmo('constructivo');
            
            this.mostrarNotificacion(`Archivo "${file.name}" cargado correctamente`, 'success');
            
        } catch (error) {
            console.error('Error al cargar archivo:', error);
            this.mostrarNotificacion(`Error: ${error.message}`, 'error');
        } finally {
            this.ocultarCargando(loadingOverlay);
        }
    }
    
    cargarEjemplo(tipo) {
        try {
            const datos = this.manejadorArchivos.generarDatosEjemplo(tipo);
            
            // Guardar datos globalmente
            window.currentData = datos;
            window.currentAlgorithm = 'constructivo';
            
            // Actualizar UI
            this.actualizarInfoArchivo(`ejemplo_${tipo}.txt`, datos);
            this.actualizarVistaPreviaMatriz(datos.D);
            this.habilitarEjecucion();
            this.resaltarAlgoritmo('constructivo');
            
            this.mostrarNotificacion(`Ejemplo ${tipo} equipos cargado`, 'success');
            
        } catch (error) {
            this.mostrarNotificacion(`Error: ${error.message}`, 'error');
        }
    }
    
    // ========== ALGORITMOS ==========
    
    seleccionarAlgoritmo(evento) {
        const card = evento.currentTarget;
        const algoritmo = card.dataset.algorithm;
        
        this.resaltarAlgoritmo(algoritmo);
        window.currentAlgorithm = algoritmo;
        
        this.actualizarUIAlgoritmo(algoritmo);
        this.mostrarNotificacion(`Algoritmo ${this.obtenerNombreAlgoritmo(algoritmo)} seleccionado`, 'info');
    }
    
    resaltarAlgoritmo(algoritmo) {
        // Deseleccionar todas las cards
        document.querySelectorAll('.algorithm-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Seleccionar la actual
        const card = document.querySelector(`.algorithm-card[data-algorithm="${algoritmo}"]`);
        if (card) {
            card.classList.add('selected');
        }
    }
    
    async ejecutarAlgoritmo() {
        if (!window.currentData) {
            this.mostrarNotificacion('Primero carga los datos', 'warning');
            return;
        }
        
        const executeBtn = document.getElementById('executeBtn');
        const iterationsInput = document.getElementById('iterations');
        const timeoutInput = document.getElementById('timeout');
        
        // Deshabilitar botón durante ejecución
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ejecutando...';
        
        // Actualizar estado
        this.actualizarEstadoEjecucion('Ejecutando...', 'executing');
        
        const loadingOverlay = this.mostrarCargando('Ejecutando algoritmo...');
        
        try {
            const startTime = performance.now();
            
            // Crear instancia del calendario
            const { n, D, minStreak, maxStreak } = window.currentData;
            const calendario = new CalendarioTorneo(n, D, minStreak, maxStreak);
            
            // Ejecutar algoritmo seleccionado
            let resultado;
            switch(window.currentAlgorithm) {
                case 'constructivo':
                    resultado = calendario.algoritmoConstructivo();
                    break;
                case 'busqueda-local':
                    resultado = calendario.algoritmoBusquedaLocal();
                    break;
                case 'combinado':
                    resultado = calendario.algoritmoCombinado();
                    break;
                case 'fuerza-bruta':
                    if (n > 4) {
                        throw new Error('Fuerza bruta solo disponible para n ≤ 4');
                    }
                    resultado = calendario.algoritmoFuerzaBruta();
                    break;
                default:
                    throw new Error('Algoritmo no reconocido');
            }
            
            const endTime = performance.now();
            const tiempoEjecucion = (endTime - startTime) / 1000;
            
            // Verificar resultado
            const verificacion = calendario.verificarCalendario(resultado);
            const giras = calendario.calcularGiras(resultado);
            const costoTotal = calendario.calcularCostoTotal(resultado);
            
            // Guardar resultados
            window.executionResults = {
                calendario: resultado,
                verificacion,
                giras,
                costoTotal,
                algoritmo: window.currentAlgorithm,
                tiempoEjecucion
            };
            
            window.currentCalendario = resultado;
            window.ultimoTiempoEjecucion = tiempoEjecucion;
            
            // Actualizar UI
            this.actualizarResultadosEjecucion(window.executionResults);
            this.actualizarVisualizacionCalendario(resultado);
            this.actualizarTablaGiras(giras);
            this.actualizarResultadosVerificacion(verificacion);
            
            // Habilitar exportación
            this.habilitarExportacion();
            
            this.mostrarNotificacion('Algoritmo ejecutado correctamente', 'success');
            
        } catch (error) {
            console.error('Error en ejecución:', error);
            this.mostrarNotificacion(`Error: ${error.message}`, 'error');
            this.actualizarEstadoEjecucion('Error', 'error');
        } finally {
            // Restaurar botón
            executeBtn.disabled = false;
            executeBtn.innerHTML = '<i class="fas fa-play"></i> Ejecutar Algoritmo';
            this.ocultarCargando(loadingOverlay);
        }
    }
    
    // ========== ACTUALIZACIÓN DE UI ==========
    
    actualizarUIAlgoritmo(algoritmo) {
        const executeBtn = document.getElementById('executeBtn');
        const iterationsInput = document.getElementById('iterations');
        
        if (!executeBtn) return;
        
        const nombres = {
            'constructivo': 'Constructivo',
            'busqueda-local': 'Búsqueda Local',
            'combinado': 'Combinado',
            'fuerza-bruta': 'Fuerza Bruta'
        };
        
        executeBtn.innerHTML = `<i class="fas fa-play"></i> Ejecutar ${nombres[algoritmo]}`;
        
        // Ajustar parámetros según algoritmo
        if (iterationsInput) {
            switch(algoritmo) {
                case 'fuerza-bruta':
                    iterationsInput.disabled = true;
                    iterationsInput.value = 1;
                    break;
                case 'constructivo':
                    iterationsInput.disabled = false;
                    iterationsInput.value = 1;
                    break;
                case 'busqueda-local':
                    iterationsInput.disabled = false;
                    iterationsInput.value = 500;
                    break;
                case 'combinado':
                    iterationsInput.disabled = false;
                    iterationsInput.value = 300;
                    break;
            }
        }
    }
    
    actualizarInfoArchivo(nombre, datos) {
        const fileName = document.getElementById('fileName');
        const fileTeams = document.getElementById('fileTeams');
        const fileMin = document.getElementById('fileMin');
        const fileMax = document.getElementById('fileMax');
        const fileInfo = document.getElementById('fileInfo');
        
        if (fileName) fileName.textContent = nombre;
        if (fileTeams) fileTeams.textContent = datos.n;
        if (fileMin) fileMin.textContent = datos.minStreak;
        if (fileMax) fileMax.textContent = datos.maxStreak;
        if (fileInfo) fileInfo.style.display = 'block';
    }
    
    actualizarVistaPreviaMatriz(matriz) {
        const container = document.getElementById('matrixPreview');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (matriz && matriz.length > 0) {
            const tabla = this.manejadorArchivos.formatearMatrizParaVisualizacion(matriz);
            container.appendChild(tabla);
        } else {
            container.innerHTML = '<p class="empty-matrix">No hay datos cargados</p>';
        }
    }
    
    actualizarResultadosEjecucion(resultados) {
        // Actualizar estadísticas
        this.actualizarEstadisticas(resultados);
        
        // Actualizar visualización
        if (resultados.calendario) {
            this.actualizarVisualizacionCalendario(resultados.calendario);
        }
    }
    
    actualizarEstadisticas(resultados) {
        const tiempoElement = document.getElementById('executionTime');
        const costoElement = document.getElementById('totalCost');
        const estadoElement = document.getElementById('executionStatus');
        const memoriaElement = document.getElementById('memoryUsed');
        
        if (tiempoElement && resultados.tiempoEjecucion) {
            tiempoElement.textContent = `${resultados.tiempoEjecucion.toFixed(2)} s`;
        }
        
        if (costoElement && resultados.costoTotal) {
            costoElement.textContent = resultados.costoTotal.toFixed(2);
        }
        
        if (estadoElement) {
            estadoElement.textContent = 'Completado';
            estadoElement.className = 'status-success';
        }
        
        if (memoriaElement) {
            if (performance && performance.memory) {
                const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                memoriaElement.textContent = `${usedMB.toFixed(2)} MB`;
            } else {
                memoriaElement.textContent = 'N/A';
            }
        }
    }
    
    actualizarEstadoEjecucion(texto, tipo) {
        const estadoElement = document.getElementById('executionStatus');
        if (estadoElement) {
            estadoElement.textContent = texto;
            estadoElement.className = `status-${tipo}`;
        }
    }
    
    // ========== VISUALIZACIÓN ==========
    
    inicializarComponentes() {
        // Inicializar visualizador si existe
        if (typeof VisualizadorCalendario !== 'undefined') {
            this.visualizador = new VisualizadorCalendario();
        }
        
        // Inicializar tooltips
        this.inicializarTooltips();
    }
    
    actualizarVisualizacionCalendario(calendario) {
        this.calendarioCompleto = calendario;
        this.fechaActual = 0;
        
        // Actualizar grid de calendario
        this.actualizarGridCalendario(calendario);
        
        // Actualizar navegación de fechas
        this.actualizarNavegacionFechas();
    }
    
    actualizarGridCalendario(calendario) {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const n = calendario[0].length;
        const numFechas = calendario.length;
        
        // Mostrar máximo 8 equipos en la vista grid
        const mostrarEquipos = Math.min(8, n);
        
        for (let equipo = 0; equipo < mostrarEquipos; equipo++) {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'calendar-team';
            
            const teamHeader = document.createElement('h4');
            teamHeader.textContent = `Equipo ${equipo + 1}`;
            teamHeader.title = `Equipo ${equipo + 1}`;
            teamDiv.appendChild(teamHeader);
            
            // Mostrar partidos
            for (let fecha = 0; fecha < numFechas; fecha++) {
                const match = calendario[fecha][equipo];
                if (match === 0) continue;
                
                const matchDiv = document.createElement('div');
                matchDiv.className = `calendar-match ${match > 0 ? 'home' : 'away'}`;
                
                const rival = Math.abs(match);
                const tipo = match > 0 ? '🏠' : '✈️';
                const texto = match > 0 ? `vs ${rival}` : `@ ${rival}`;
                
                matchDiv.innerHTML = `
                    <span class="match-fecha">F${fecha + 1}</span>
                    <span class="match-details">${tipo} ${texto}</span>
                `;
                
                matchDiv.title = `Fecha ${fecha + 1}: ${match > 0 ? 'Local' : 'Visitante'} vs Equipo ${rival}`;
                teamDiv.appendChild(matchDiv);
            }
            
            grid.appendChild(teamDiv);
        }
        
        // Mostrar indicador si hay más equipos
        if (n > mostrarEquipos) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'calendar-team info';
            infoDiv.innerHTML = `<h4>...</h4><p>+ ${n - mostrarEquipos} equipos más</p>`;
            grid.appendChild(infoDiv);
        }
    }
    
    actualizarTablaGiras(giras) {
        const tbody = document.getElementById('girasTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        giras.forEach((gira, index) => {
            const row = document.createElement('tr');
            
            const numPartidos = gira.detalles?.reduce((total, detalle) => 
                total + detalle.rivales.length, 0) || 0;
            const eficiencia = numPartidos > 0 ? (gira.costoTotal / numPartidos).toFixed(2) : '0.00';
            
            row.innerHTML = `
                <td>
                    <strong>Equipo ${gira.equipo || index + 1}</strong>
                    <br>
                    <small>${numPartidos} partidos de visita</small>
                </td>
                <td>${gira.numGiras || 0}</td>
                <td>${gira.costoTotal?.toFixed(2) || '0.00'}</td>
                <td>
                    <span class="eficiencia">${eficiencia}/partido</span>
                    <button class="btn btn-sm btn-outline" onclick="ui.mostrarDetallesGira(${index})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    actualizarResultadosVerificacion(verificacion) {
        const container = document.getElementById('tab-verification');
        if (!container) return;
        
        // Limpiar contenedor
        const existingPane = container.querySelector('.tab-pane.active');
        if (existingPane) {
            existingPane.remove();
        }
        
        let html = `
            <div class="tab-pane active">
                <div class="verification-results">
                    <div class="verification-item ${verificacion.basico?.valido ? 'success' : 'error'}">
                        <i class="fas ${verificacion.basico?.valido ? 'fa-check' : 'fa-times'}"></i>
                        <div>
                            <h5>Calendario Básico</h5>
                            <p>${verificacion.basico?.valido ? 'Estructura válida' : 'Errores en estructura'}</p>
                        </div>
                    </div>
                    
                    <div class="verification-item ${verificacion.streak?.cumple ? 'success' : 'warning'}">
                        <i class="fas ${verificacion.streak?.cumple ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                        <div>
                            <h5>Restricciones Streak</h5>
                            <p>${verificacion.streak?.cumple ? 'Streaks dentro de límites' : 'Algunos streaks fuera de límites'}</p>
                        </div>
                    </div>
                    
                    <div class="verification-item ${verificacion.repeticiones?.cumple ? 'success' : 'warning'}">
                        <i class="fas ${verificacion.repeticiones?.cumple ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                        <div>
                            <h5>Sin Partidos Consecutivos</h5>
                            <p>${verificacion.repeticiones?.cumple ? 'No hay repeticiones' : 'Hay repeticiones de rivales'}</p>
                        </div>
                    </div>
                    
                    <div class="verification-item ${verificacion.completamenteValido ? 'success' : 'warning'}">
                        <i class="fas ${verificacion.completamenteValido ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                        <div>
                            <h5>Validez Completa</h5>
                            <p>${verificacion.completamenteValido ? 'Calendario válido' : 'Calendario requiere ajustes'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
    }
    
    // ========== NAVEGACIÓN ==========
    
    navegarFecha(direccion) {
        if (!this.calendarioCompleto) return;
        
        const numFechas = this.calendarioCompleto.length;
        this.fechaActual += direccion;
        
        // Asegurar que esté en rango
        if (this.fechaActual < 0) this.fechaActual = 0;
        if (this.fechaActual >= numFechas) this.fechaActual = numFechas - 1;
        
        this.actualizarNavegacionFechas();
    }
    
    actualizarNavegacionFechas() {
        if (!this.calendarioCompleto) return;
        
        const numFechas = this.calendarioCompleto.length;
        const fechaElement = document.getElementById('currentDate');
        
        if (fechaElement) {
            fechaElement.textContent = `Fecha ${this.fechaActual + 1} de ${numFechas}`;
        }
        
        // Habilitar/deshabilitar botones
        const prevBtn = document.getElementById('prevDate');
        const nextBtn = document.getElementById('nextDate');
        
        if (prevBtn) prevBtn.disabled = this.fechaActual === 0;
        if (nextBtn) nextBtn.disabled = this.fechaActual === numFechas - 1;
    }
    
    cambiarPestaña(evento) {
        const boton = evento.currentTarget;
        const tabId = boton.dataset.tab;
        
        // Desactivar todos los botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Desactivar todos los paneles
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Activar botón actual
        boton.classList.add('active');
        
        // Activar panel correspondiente
        const panel = document.getElementById(`tab-${tabId}`);
        if (panel) {
            panel.classList.add('active');
        }
    }
    
    // ========== UTILIDADES ==========
    
    habilitarEjecucion() {
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = false;
        }
    }
    
    habilitarExportacion() {
        const exportBtn = document.getElementById('exportCalendar');
        if (exportBtn) {
            exportBtn.disabled = false;
        }
    }
    
    obtenerNombreAlgoritmo(codigo) {
        const nombres = {
            'constructivo': 'Constructivo',
            'busqueda-local': 'Búsqueda Local',
            'combinado': 'Combinado',
            'fuerza-bruta': 'Fuerza Bruta'
        };
        
        return nombres[codigo] || codigo;
    }
    
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        
        const iconos = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${iconos[tipo] || 'info-circle'}"></i>
            <span>${mensaje}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Botón para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    mostrarCargando(mensaje = 'Procesando...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${mensaje}</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    ocultarCargando(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
    
    inicializarTooltips() {
        // Implementación simple de tooltips
        const elementos = document.querySelectorAll('[title]');
        elementos.forEach(el => {
            el.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.title;
                
                const rect = this.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.top - 35) + 'px';
                tooltip.style.left = (rect.left + rect.width/2) + 'px';
                tooltip.style.transform = 'translateX(-50%)';
                
                document.body.appendChild(tooltip);
                this._tooltip = tooltip;
            });
            
            el.addEventListener('mouseleave', function() {
                if (this._tooltip) {
                    this._tooltip.remove();
                    delete this._tooltip;
                }
            });
        });
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    
    mostrarDetallesGira(indice) {
        if (!window.executionResults?.giras?.[indice]) return;
        
        const gira = window.executionResults.giras[indice];
        const detalles = gira.detalles || [];
        
        let html = `
            <div class="modal">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3><i class="fas fa-route"></i> Giras - Equipo ${gira.equipo || indice + 1}</h3>
                    
                    <div class="gira-summary">
                        <p><strong>Número de giras:</strong> ${gira.numGiras || 0}</p>
                        <p><strong>Costo total:</strong> ${gira.costoTotal?.toFixed(2) || '0.00'}</p>
                        <p><strong>Partidos de visita:</strong> ${detalles.reduce((total, d) => total + d.rivales.length, 0)}</p>
                    </div>
        `;
        
        if (detalles.length > 0) {
            html += '<div class="giras-detalladas">';
            detalles.forEach((detalle, idx) => {
                const rivalesTexto = detalle.rivales.map(r => `Eq ${r}`).join(' → ');
                html += `
                    <div class="gira-item">
                        <h4><i class="fas fa-map-marker-alt"></i> Gira ${idx + 1}</h4>
                        <p><strong>Fechas:</strong> ${detalle.inicioFecha} - ${detalle.finFecha}</p>
                        <p><strong>Ruta:</strong> ${rivalesTexto}</p>
                        <p><strong>Costo:</strong> ${detalle.costo?.toFixed(2) || '0.00'}</p>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<p class="no-giras">No se realizaron giras (todos los partidos fueron locales)</p>';
        }
        
        html += '</div></div>';
        
        // Crear y mostrar modal
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);
        
        // Configurar cierre
        const closeBtn = modalContainer.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modalContainer.remove());
        
        // Cerrar al hacer clic fuera
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                modalContainer.remove();
            }
        });
    }
    
    exportarCalendario() {
        if (!window.currentCalendario || !window.currentData) {
            this.mostrarNotificacion('No hay calendario para exportar', 'warning');
            return;
        }
        
        const contenido = this.manejadorArchivos.generarArchivoSalida(
            window.currentData,
            window.currentCalendario,
            window.currentAlgorithm,
            window.ultimoTiempoEjecucion || 0
        );
        
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `calendario_n${window.currentData.n}_${window.currentAlgorithm}_${fecha}.txt`;
        
        this.manejadorArchivos.descargarArchivo(contenido, nombreArchivo);
        this.mostrarNotificacion('Calendario exportado correctamente', 'success');
    }
}

// Crear instancia global
window.ui = new InterfazUsuario();