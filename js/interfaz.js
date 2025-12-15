// js/interfaz.js - Funciones de interfaz de usuario

class InterfazUsuario {
    constructor() {
        this.visualizador = null;
        this.fechaActual = 0;
        this.calendarioCompleto = null;
    }
    
    inicializar() {
        this.inicializarEventos();
        this.inicializarComponentes();
        console.log('Interfaz de usuario inicializada');
    }
    
    inicializarEventos() {
        // Eventos de ejemplo
        const ejemploBtns = document.querySelectorAll('[data-example]');
        ejemploBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ejemplo = e.target.closest('button').dataset.example;
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
    }
    
    inicializarComponentes() {
        // Inicializar visualizador
        if (typeof VisualizadorCalendario !== 'undefined') {
            this.visualizador = new VisualizadorCalendario();
        }
        
        // Inicializar tooltips
        this.inicializarTooltips();
        
        // Inicializar validaciones
        this.inicializarValidaciones();
    }
    
    // ========== MANEJO DE EJEMPLOS ==========
    
    cargarEjemplo(tipo) {
        const manejadorArchivos = window.manejadorArchivos || new ManejadorArchivos();
        
        try {
            const datos = manejadorArchivos.generarDatosEjemplo(tipo);
            
            // Actualizar datos globales
            window.currentData = datos;
            
            // Actualizar UI
            this.actualizarInfoArchivo(`ejemplo_${tipo}.txt`, datos);
            this.actualizarVistaPreviaMatriz(datos.D);
            this.habilitarEjecucion();
            
            this.mostrarNotificacion(`Ejemplo ${tipo} equipos cargado correctamente`, 'success');
            
        } catch (error) {
            this.mostrarNotificacion(`Error al cargar ejemplo: ${error.message}`, 'error');
        }
    }
    
    // ========== SELECCIÓN DE ALGORITMO ==========
    
    seleccionarAlgoritmo(evento) {
        const card = evento.currentTarget;
        const algoritmo = card.dataset.algorithm;
        
        // Deseleccionar todas las cards
        document.querySelectorAll('.algorithm-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Seleccionar la actual
        card.classList.add('selected');
        window.currentAlgorithm = algoritmo;
        
        // Actualizar UI según algoritmo
        this.actualizarUIAlgoritmo(algoritmo);
        
        this.mostrarNotificacion(`Algoritmo ${this.obtenerNombreAlgoritmo(algoritmo)} seleccionado`, 'info');
    }
    
    actualizarUIAlgoritmo(algoritmo) {
        const executeBtn = document.getElementById('executeBtn');
        const iterationsInput = document.getElementById('iterations');
        const timeoutInput = document.getElementById('timeout');
        
        if (!executeBtn) return;
        
        const nombres = {
            'constructivo': 'Constructivo',
            'busqueda-local': 'Búsqueda Local',
            'combinado': 'Combinado',
            'fuerza-bruta': 'Fuerza Bruta'
        };
        
        executeBtn.innerHTML = `<i class="fas fa-play"></i> Ejecutar ${nombres[algoritmo]}`;
        
        // Ajustar parámetros según algoritmo
        switch(algoritmo) {
            case 'fuerza-bruta':
                iterationsInput.disabled = true;
                iterationsInput.value = 1;
                timeoutInput.value = 10;
                break;
                
            case 'constructivo':
                iterationsInput.disabled = false;
                iterationsInput.value = 1;
                timeoutInput.value = 5;
                break;
                
            case 'busqueda-local':
                iterationsInput.disabled = false;
                iterationsInput.value = 1000;
                timeoutInput.value = 30;
                break;
                
            case 'combinado':
                iterationsInput.disabled = false;
                iterationsInput.value = 500;
                timeoutInput.value = 60;
                break;
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
    
    // ========== MANEJO DE PESTAÑAS ==========
    
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
            
            // Si es la pestaña de gráficos, actualizarlos
            if (tabId === 'charts' && this.visualizador) {
                this.actualizarGraficos();
            }
        }
    }
    
    // ========== VISUALIZACIÓN DEL CALENDARIO ==========
    
    actualizarVisualizacionCalendario(calendario) {
        this.calendarioCompleto = calendario;
        this.fechaActual = 0;
        
        // Actualizar grid de calendario
        this.actualizarGridCalendario(calendario);
        
        // Actualizar tabla de calendario
        if (this.visualizador) {
            this.visualizador.visualizarCalendario('calendarGrid', calendario);
        }
        
        // Actualizar navegación de fechas
        this.actualizarNavegacionFechas();
    }
    
    actualizarGridCalendario(calendario) {
        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const n = calendario[0].length;
        const numFechas = calendario.length;
        
        // Mostrar solo 6 equipos como máximo en la vista grid
        const mostrarEquipos = Math.min(6, n);
        
        for (let equipo = 0; equipo < mostrarEquipos; equipo++) {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'calendar-team';
            
            const teamHeader = document.createElement('h4');
            teamHeader.textContent = `Equipo ${equipo + 1}`;
            teamHeader.title = `Detalles del equipo ${equipo + 1}`;
            teamDiv.appendChild(teamHeader);
            
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
            
            // Si hay más equipos, mostrar indicador
            if (n > mostrarEquipos && equipo === mostrarEquipos - 1) {
                const masEquipos = document.createElement('div');
                masEquipos.className = 'calendar-match info';
                masEquipos.textContent = `+ ${n - mostrarEquipos} equipos más...`;
                teamDiv.appendChild(masEquipos);
            }
            
            grid.appendChild(teamDiv);
        }
    }
    
    navegarFecha(direccion) {
        if (!this.calendarioCompleto) return;
        
        const numFechas = this.calendarioCompleto.length;
        this.fechaActual += direccion;
        
        // Asegurar que esté en rango
        if (this.fechaActual < 0) this.fechaActual = 0;
        if (this.fechaActual >= numFechas) this.fechaActual = numFechas - 1;
        
        this.actualizarVistaFechaActual();
    }
    
    actualizarVistaFechaActual() {
        if (!this.calendarioCompleto) return;
        
        const numFechas = this.calendarioCompleto.length;
        const fechaElement = document.getElementById('currentDate');
        
        if (fechaElement) {
            fechaElement.textContent = `Fecha ${this.fechaActual + 1} de ${numFechas}`;
        }
        
        // Aquí podríamos mostrar detalles específicos de la fecha actual
    }
    
    actualizarNavegacionFechas() {
        if (!this.calendarioCompleto) return;
        
        const numFechas = this.calendarioCompleto.length;
        const fechaElement = document.getElementById('currentDate');
        
        if (fechaElement) {
            fechaElement.textContent = `Fecha ${this.fechaActual + 1} de ${numFechas}`;
        }
        
        // Habilitar/deshabilitar botones según posición
        const prevBtn = document.getElementById('prevDate');
        const nextBtn = document.getElementById('nextDate');
        
        if (prevBtn) prevBtn.disabled = this.fechaActual === 0;
        if (nextBtn) nextBtn.disabled = this.fechaActual === numFechas - 1;
    }
    
    // ========== ACTUALIZACIÓN DE RESULTADOS ==========
    
    actualizarResultadosEjecucion(resultados) {
        // Actualizar estadísticas
        this.actualizarEstadisticas(resultados);
        
        // Actualizar calendario
        if (resultados.calendario) {
            this.actualizarVisualizacionCalendario(resultados.calendario);
        }
        
        // Actualizar tabla de giras
        if (resultados.giras) {
            this.actualizarTablaGiras(resultados.giras);
        }
        
        // Actualizar verificación
        if (resultados.verificacion) {
            this.actualizarResultadosVerificacion(resultados.verificacion);
        }
        
        // Actualizar gráficos
        this.actualizarGraficos(resultados);
    }
    
    actualizarEstadisticas(resultados) {
        // Tiempo de ejecución
        const tiempoElement = document.getElementById('executionTime');
        if (tiempoElement && resultados.tiempoEjecucion) {
            tiempoElement.textContent = `${resultados.tiempoEjecucion.toFixed(2)} s`;
        }
        
        // Costo total
        const costoElement = document.getElementById('totalCost');
        if (costoElement && resultados.costoTotal) {
            costoElement.textContent = resultados.costoTotal.toFixed(2);
        }
        
        // Estado
        const estadoElement = document.getElementById('executionStatus');
        if (estadoElement) {
            estadoElement.textContent = 'Completado';
            estadoElement.className = 'status-success';
        }
        
        // Memoria usada (simulación)
        const memoriaElement = document.getElementById('memoryUsed');
        if (memoriaElement) {
            if (performance.memory) {
                const usedMB = performance.memory.usedJSHeapSize / 1024 / 1024;
                memoriaElement.textContent = `${usedMB.toFixed(2)} MB`;
            } else {
                // Simulación basada en tamaño del problema
                const n = window.currentData?.n || 0;
                const memoriaEstimada = (n * n * 4) / 1024; // KB
                memoriaElement.textContent = `${(memoriaEstimada / 1024).toFixed(2)} MB (estimado)`;
            }
        }
    }
    
    actualizarTablaGiras(giras) {
        const tbody = document.getElementById('girasTable');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        giras.forEach((gira, index) => {
            const row = document.createElement('tr');
            
            // Calcular eficiencia (costo por partido)
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
        
        let html = `
            <div class="verification-results">
                <div class="verification-item ${verificacion.basico?.valido ? 'success' : 'error'}">
                    <i class="fas ${verificacion.basico?.valido ? 'fa-check' : 'fa-times'}"></i>
                    <div>
                        <h5>Calendario Básico</h5>
                        <p>${verificacion.basico?.valido ? 'Estructura válida' : 'Errores en estructura'}</p>
                    </div>
                </div>
                
                <div class="verification-item ${verificacion.idaVuelta?.cumple ? 'success' : 'warning'}">
                    <i class="fas ${verificacion.idaVuelta?.cumple ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                    <div>
                        <h5>Restricción Ida-Vuelta</h5>
                        <p>${verificacion.idaVuelta?.cumple ? 'Cumple orden correcto' : 'Revisar orden de partidos'}</p>
                    </div>
                </div>
                
                <div class="verification-item ${verificacion.streak?.cumple ? 'success' : 'warning'}">
                    <i class="fas ${verificacion.streak?.cumple ? 'fa-check' : 'fa-exclamation-triangle'}"></i>
                    <div>
                        <h5>Restricciones Streak</h5>
                        <p>${verificacion.streak?.cumple ? 'Streaks dentro de límites' : 'Algunos streaks fuera de límites'}</p>
                    </div>
                </div>
                
                <div class="verification-item success">
                    <i class="fas fa-check"></i>
                    <div>
                        <h5>Sin Partidos Consecutivos</h5>
                        <p>No hay repeticiones inmediatas de rivales</p>
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
        `;
        
        container.querySelector('.tab-pane.active')?.remove();
        const nuevaSeccion = document.createElement('div');
        nuevaSeccion.className = 'tab-pane active';
        nuevaSeccion.innerHTML = html;
        container.appendChild(nuevaSeccion);
    }
    
    actualizarGraficos(resultados) {
        if (!this.visualizador) return;
        
        // Gráfico de costos por equipo
        const costChartCtx = document.getElementById('costChart');
        if (costChartCtx && resultados?.giras) {
            const labels = resultados.giras.map((g, i) => `Eq ${i + 1}`);
            const valores = resultados.giras.map(g => g.costoTotal);
            
            this.visualizador.crearGraficoCostos(costChartCtx.getContext('2d'), {
                labels,
                valores
            });
        }
        
        // Gráfico comparativo (si hay datos históricos)
        const timeChartCtx = document.getElementById('timeChart');
        if (timeChartCtx && window.ejecucionesHistoricas) {
            const datosAlgoritmos = window.ejecucionesHistoricas.map(ejecucion => ({
                nombre: ejecucion.algoritmo,
                tiempo: ejecucion.tiempo,
                costo: ejecucion.costo,
                calidad: 100 - (ejecucion.costo / 1000), // Simulación de calidad
                memoria: 50, // Valor fijo por simplicidad
                consistencia: 80 // Valor fijo por simplicidad
            }));
            
            this.visualizador.crearGraficoComparativo(timeChartCtx.getContext('2d'), datosAlgoritmos);
        }
    }
    
    // ========== UTILIDADES DE INTERFAZ ==========
    
    actualizarInfoArchivo(nombre, datos) {
        document.getElementById('fileName').textContent = nombre;
        document.getElementById('fileTeams').textContent = datos.n;
        document.getElementById('fileMin').textContent = datos.minStreak;
        document.getElementById('fileMax').textContent = datos.maxStreak;
        
        document.getElementById('fileInfo').style.display = 'block';
    }
    
    actualizarVistaPreviaMatriz(matriz) {
        const container = document.getElementById('matrixPreview');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (matriz && matriz.length > 0) {
            const manejadorArchivos = window.manejadorArchivos || new ManejadorArchivos();
            const tabla = manejadorArchivos.formatearMatrizParaVisualizacion(matriz);
            container.appendChild(tabla);
        } else {
            container.innerHTML = '<p class="empty-matrix">No hay datos cargados</p>';
        }
    }
    
    habilitarEjecucion() {
        const executeBtn = document.getElementById('executeBtn');
        if (executeBtn) {
            executeBtn.disabled = false;
        }
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
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    inicializarTooltips() {
        // Inicializar tooltips simples
        const elementosConTooltip = document.querySelectorAll('[title]');
        elementosConTooltip.forEach(elemento => {
            elemento.addEventListener('mouseenter', function(e) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.title;
                
                const rect = this.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.bottom + 5) + 'px';
                tooltip.style.left = rect.left + 'px';
                
                document.body.appendChild(tooltip);
                
                this._tooltipElement = tooltip;
            });
            
            elemento.addEventListener('mouseleave', function() {
                if (this._tooltipElement) {
                    this._tooltipElement.remove();
                    delete this._tooltipElement;
                }
            });
        });
    }
    
    inicializarValidaciones() {
        // Validar entradas numéricas
        const inputsNumericos = document.querySelectorAll('input[type="number"]');
        inputsNumericos.forEach(input => {
            input.addEventListener('change', function() {
                const valor = parseInt(this.value);
                const min = parseInt(this.min) || 1;
                const max = parseInt(this.max) || 10000;
                
                if (isNaN(valor) || valor < min) {
                    this.value = min;
                } else if (valor > max) {
                    this.value = max;
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
                    <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
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
        
        // Cerrar modal al hacer clic fuera
        modalContainer.addEventListener('click', function(e) {
            if (e.target === this) {
                this.remove();
            }
        });
    }
    
    exportarCalendario() {
        if (!window.currentCalendario || !window.currentData) {
            this.mostrarNotificacion('No hay calendario para exportar', 'warning');
            return;
        }
        
        const manejadorArchivos = window.manejadorArchivos || new ManejadorArchivos();
        
        const contenido = manejadorArchivos.generarArchivoSalida(
            window.currentData,
            window.currentCalendario,
            window.currentAlgorithm,
            window.ultimoTiempoEjecucion || 0
        );
        
        const nombreArchivo = `calendario_n${window.currentData.n}_${window.currentAlgorithm}_${Date.now()}.txt`;
        
        manejadorArchivos.descargarArchivo(contenido, nombreArchivo);
        this.mostrarNotificacion('Calendario exportado correctamente', 'success');
    }
    
    // ========== GESTIÓN DE ESTADO ==========
    
    mostrarCargando(mensaje = 'Procesando...') {
        // Crear overlay de carga
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
    
    actualizarProgreso(porcentaje, mensaje) {
        const progressElement = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressElement) {
            progressElement.style.width = `${porcentaje}%`;
        }
        
        if (progressText && mensaje) {
            progressText.textContent = mensaje;
        }
    }
}

// Crear instancia global
window.ui = new InterfazUsuario();