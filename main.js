// main.js - Punto de entrada principal
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initFileUpload();
    initAlgorithmSelection();
    initTabs();
    initExecutionControls();
    initCharts();
    
    // Cargar ejemplo por defecto
    loadExampleData('4');
    
    console.log('Aplicación de Calendarios Deportivos iniciada');
});

// Variables globales
let currentCalendario = null;
let currentData = null;
let currentAlgorithm = 'constructivo';
let executionResults = null;

// Inicializar carga de archivos
function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    
    // Click en el botón
    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Selección de archivo
    fileInput.addEventListener('change', handleFileSelect);
    
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
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

// Manejar selección de archivo
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Procesar archivo
async function handleFile(file) {
    try {
        const content = await file.text();
        const data = parseInputFile(content);
        
        if (data) {
            currentData = data;
            updateFileInfo(file.name, data);
            updateMatrixPreview(data.D);
            enableExecuteButton();
            showNotification('Archivo cargado correctamente', 'success');
        }
    } catch (error) {
        showNotification(`Error al cargar archivo: ${error.message}`, 'error');
    }
}

// Parsear archivo de entrada
function parseInputFile(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 3) {
        throw new Error('Archivo incompleto');
    }
    
    const n = parseInt(lines[0]);
    const minStreak = parseInt(lines[1]);
    const maxStreak = parseInt(lines[2]);
    
    if (isNaN(n) || n % 2 !== 0) {
        throw new Error('Número de equipos debe ser par');
    }
    
    if (lines.length < 3 + n) {
        throw new Error(`Se esperaban ${n} filas para la matriz de distancias`);
    }
    
    const D = [];
    for (let i = 0; i < n; i++) {
        const row = lines[3 + i].trim().split(/\s+/).map(Number);
        if (row.length !== n) {
            throw new Error(`Fila ${i+1} tiene ${row.length} elementos, esperados ${n}`);
        }
        D.push(row);
    }
    
    return { n, minStreak, maxStreak, D };
}

// Actualizar información del archivo
function updateFileInfo(filename, data) {
    document.getElementById('fileName').textContent = filename;
    document.getElementById('fileTeams').textContent = data.n;
    document.getElementById('fileMin').textContent = data.minStreak;
    document.getElementById('fileMax').textContent = data.maxStreak;
    
    document.getElementById('fileInfo').style.display = 'block';
}

// Vista previa de matriz
function updateMatrixPreview(matrix) {
    const container = document.getElementById('matrixPreview');
    container.innerHTML = '';
    
    const n = matrix.length;
    const showRows = Math.min(6, n);
    const showCols = Math.min(6, n);
    
    // Crear tabla
    const table = document.createElement('table');
    table.className = 'matrix-table';
    
    for (let i = 0; i < showRows; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < showCols; j++) {
            const cell = document.createElement('td');
            cell.textContent = matrix[i][j];
            cell.title = `D[${i+1}][${j+1}] = ${matrix[i][j]}`;
            row.appendChild(cell);
        }
        
        if (n > showCols) {
            const ellipsis = document.createElement('td');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            row.appendChild(ellipsis);
        }
        
        table.appendChild(row);
    }
    
    if (n > showRows) {
        const ellipsisRow = document.createElement('tr');
        const ellipsisCell = document.createElement('td');
        ellipsisCell.colSpan = showCols + 1;
        ellipsisCell.textContent = '⋮';
        ellipsisCell.className = 'ellipsis';
        ellipsisRow.appendChild(ellipsisCell);
        table.appendChild(ellipsisRow);
    }
    
    container.appendChild(table);
}

// Selección de algoritmo
function initAlgorithmSelection() {
    const algorithmCards = document.querySelectorAll('.algorithm-card');
    
    algorithmCards.forEach(card => {
        card.addEventListener('click', function() {
            // Deseleccionar todas
            algorithmCards.forEach(c => c.classList.remove('selected'));
            
            // Seleccionar esta
            this.classList.add('selected');
            currentAlgorithm = this.dataset.algorithm;
            
            // Actualizar UI según algoritmo
            updateAlgorithmUI(currentAlgorithm);
        });
    });
}

function updateAlgorithmUI(algorithm) {
    const executeBtn = document.getElementById('executeBtn');
    const iterationsInput = document.getElementById('iterations');
    
    switch(algorithm) {
        case 'fuerza-bruta':
            executeBtn.innerHTML = '<i class="fas fa-cogs"></i> Ejecutar Fuerza Bruta';
            iterationsInput.disabled = true;
            break;
        case 'constructivo':
            executeBtn.innerHTML = '<i class="fas fa-bolt"></i> Ejecutar Constructivo';
            iterationsInput.disabled = false;
            break;
        case 'busqueda-local':
            executeBtn.innerHTML = '<i class="fas fa-search"></i> Ejecutar Búsqueda Local';
            iterationsInput.disabled = false;
            break;
        case 'combinado':
            executeBtn.innerHTML = '<i class="fas fa-layer-group"></i> Ejecutar Combinado';
            iterationsInput.disabled = false;
            break;
    }
}

// Ejecutar algoritmo
function initExecutionControls() {
    const executeBtn = document.getElementById('executeBtn');
    
    executeBtn.addEventListener('click', async function() {
        if (!currentData) {
            showNotification('Primero carga los datos', 'warning');
            return;
        }
        
        // Deshabilitar botón durante ejecución
        executeBtn.disabled = true;
        executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ejecutando...';
        
        // Actualizar estado
        updateExecutionStatus('Ejecutando...', 'executing');
        
        try {
            // Medir tiempo
            const startTime = performance.now();
            
            // Ejecutar algoritmo seleccionado
            const result = await executeAlgorithm(currentAlgorithm, currentData);
            
            const endTime = performance.now();
            const executionTime = (endTime - startTime) / 1000;
            
            // Actualizar resultados
            executionResults = result;
            currentCalendario = result.calendario;
            
            // Actualizar UI
            updateExecutionStats(executionTime, result.costoTotal);
            updateCalendarDisplay(result.calendario);
            updateGirasTable(result.giras);
            updateVerificationResults(result.verificacion);
            updateCharts(result);
            
            // Habilitar exportación
            enableExportButtons();
            
            showNotification('Algoritmo ejecutado correctamente', 'success');
            
        } catch (error) {
            showNotification(`Error en ejecución: ${error.message}`, 'error');
            updateExecutionStatus('Error', 'error');
        } finally {
            // Restaurar botón
            executeBtn.disabled = false;
            executeBtn.innerHTML = '<i class="fas fa-play"></i> Ejecutar Algoritmo';
        }
    });
}

// Ejecutar algoritmo específico
async function executeAlgorithm(algorithm, data) {
    const { n, D, minStreak, maxStreak } = data;
    
    // Crear instancia del calendario
    const calendario = new CalendarioTorneo(n, D, minStreak, maxStreak);
    
    let resultado;
    
    switch(algorithm) {
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
    
    // Verificar resultado
    const verificacion = calendario.verificarCalendario(resultado);
    const giras = calendario.calcularGiras(resultado);
    const costoTotal = calendario.calcularCostoTotal(resultado);
    
    return {
        calendario: resultado,
        verificacion,
        giras,
        costoTotal,
        algoritmo: algorithm
    };
}

// Actualizar estadísticas de ejecución
function updateExecutionStats(time, cost) {
    document.getElementById('executionTime').textContent = `${time.toFixed(2)} s`;
    document.getElementById('totalCost').textContent = cost.toFixed(2);
    document.getElementById('memoryUsed').textContent = `${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`;
    updateExecutionStatus('Completado', 'success');
}

function updateExecutionStatus(text, type) {
    const statusElement = document.getElementById('executionStatus');
    statusElement.textContent = text;
    statusElement.className = `status-${type}`;
}

// Mostrar calendario
function updateCalendarDisplay(calendario) {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const numFechas = calendario.length;
    const numEquipos = calendario[0].length;
    
    // Crear encabezado de equipos
    for (let equipo = 0; equipo < numEquipos; equipo++) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'calendar-team';
        
        const teamHeader = document.createElement('h4');
        teamHeader.textContent = `Equipo ${equipo + 1}`;
        teamDiv.appendChild(teamHeader);
        
        for (let fecha = 0; fecha < numFechas; fecha++) {
            const match = calendario[fecha][equipo];
            const matchDiv = document.createElement('div');
            matchDiv.className = `calendar-match ${match > 0 ? 'home' : 'away'}`;
            
            const vs = Math.abs(match);
            const tipo = match > 0 ? '🏠 vs' : '✈️ @';
            matchDiv.textContent = `Fecha ${fecha + 1}: ${tipo} ${vs}`;
            matchDiv.title = `Fecha ${fecha + 1}: ${match > 0 ? 'Local' : 'Visitante'} vs Equipo ${vs}`;
            
            teamDiv.appendChild(matchDiv);
        }
        
        grid.appendChild(teamDiv);
    }
}

// Mostrar tabla de giras
function updateGirasTable(giras) {
    const tbody = document.getElementById('girasTable');
    tbody.innerHTML = '';
    
    giras.forEach((gira, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>Equipo ${index + 1}</strong></td>
            <td>${gira.numGiras}</td>
            <td>${gira.costoTotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm" onclick="showGiraDetails(${index})">
                    <i class="fas fa-info-circle"></i> Detalles
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Sistema de pestañas
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Desactivar todas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activar actual
            this.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Gráficos
function initCharts() {
    // Inicializar Chart.js si está disponible
    if (typeof Chart !== 'undefined') {
        window.costChart = new Chart(document.getElementById('costChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Costo por Equipo',
                    data: [],
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        window.timeChart = new Chart(document.getElementById('timeChart'), {
            type: 'pie',
            data: {
                labels: ['Constructivo', 'Búsqueda Local', 'Combinado'],
                datasets: [{
                    data: [1, 1, 1],
                    backgroundColor: ['#27ae60', '#f39c12', '#3498db']
                }]
            }
        });
    }
}

function updateCharts(results) {
    if (!window.costChart) return;
    
    // Actualizar gráfico de costos
    const costs = results.giras.map(g => g.costoTotal);
    const labels = results.giras.map((_, i) => `Eq ${i + 1}`);
    
    window.costChart.data.labels = labels;
    window.costChart.data.datasets[0].data = costs;
    window.costChart.update();
}

// Notificaciones
function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Habilitar/deshabilitar botones
function enableExecuteButton() {
    document.getElementById('executeBtn').disabled = false;
}

function enableExportButtons() {
    document.getElementById('exportCalendar').disabled = false;
}

// Cargar datos de ejemplo
function loadExampleData(exampleType) {
    let data;
    
    switch(exampleType) {
        case '4':
            data = {
                n: 4,
                minStreak: 1,
                maxStreak: 3,
                D: [
                    [0, 745, 665, 929],
                    [745, 0, 80, 337],
                    [665, 80, 0, 380],
                    [929, 337, 380, 0]
                ]
            };
            break;
        case '6':
            data = generarDatosAleatorios(6);
            break;
        case '8':
            data = generarDatosAleatorios(8);
            break;
        case 'random':
            const n = Math.floor(Math.random() * 5) * 2 + 4; // 4, 6, 8, 10, 12
            data = generarDatosAleatorios(n);
            break;
    }
    
    currentData = data;
    updateFileInfo(`ejemplo_${exampleType}.txt`, data);
    updateMatrixPreview(data.D);
    enableExecuteButton();
    showNotification(`Ejemplo ${exampleType} equipos cargado`, 'success');
}

function generarDatosAleatorios(n) {
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
}

// Función para mostrar detalles de gira
window.showGiraDetails = function(equipoIndex) {
    if (!executionResults || !executionResults.giras[equipoIndex]) return;
    
    const gira = executionResults.giras[equipoIndex];
    const detalles = gira.detalles || [];
    
    let mensaje = `<h3>Detalles de Giras - Equipo ${equipoIndex + 1}</h3>`;
    mensaje += `<p><strong>Costo total:</strong> ${gira.costoTotal.toFixed(2)}</p>`;
    mensaje += `<p><strong>Número de giras:</strong> ${gira.numGiras}</p>`;
    
    if (detalles.length > 0) {
        mensaje += '<ul>';
        detalles.forEach((detalle, idx) => {
            mensaje += `<li>Gira ${idx + 1}: ${detalle.rivales.join(', ')} (Costo: ${detalle.costo.toFixed(2)})</li>`;
        });
        mensaje += '</ul>';
    }
    
    // Mostrar modal o alerta
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            ${mensaje}
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').onclick = () => modal.remove();
};

// Exportar calendario
document.getElementById('exportCalendar').addEventListener('click', function() {
    if (!currentCalendario || !currentData) {
        showNotification('No hay calendario para exportar', 'warning');
        return;
    }
    
    const contenido = generarArchivoSalida(currentData, currentCalendario);
    descargarArchivo(contenido, 'calendario_salida.txt');
    showNotification('Calendario exportado', 'success');
});

function generarArchivoSalida(data, calendario) {
    let contenido = `${data.n}\n`;
    contenido += `${data.minStreak}\n`;
    contenido += `${data.maxStreak}\n`;
    
    calendario.forEach(fecha => {
        contenido += fecha.join(' ') + '\n';
    });
    
    return contenido;
}

function descargarArchivo(contenido, nombre) {
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}