// js/analisis.js - Script para la página de análisis

document.addEventListener('DOMContentLoaded', function() {
    inicializarGraficos();
    cargarDatosAnalisis();
    configurarEventos();
});

function inicializarGraficos() {
    // Datos de tiempo de ejecución
    const tiempoCtx = document.getElementById('timeChart')?.getContext('2d');
    if (tiempoCtx) {
        new Chart(tiempoCtx, {
            type: 'bar',
            data: {
                labels: ['Constructivo', 'Búsqueda Local', 'Combinado', 'Fuerza Bruta'],
                datasets: [{
                    label: 'Tiempo (s)',
                    data: [0.5, 25.3, 42.8, 8.7],
                    backgroundColor: [
                        'rgba(39, 174, 96, 0.7)',
                        'rgba(243, 156, 18, 0.7)',
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(231, 76, 60, 0.7)'
                    ],
                    borderColor: [
                        'rgb(39, 174, 96)',
                        'rgb(243, 156, 18)',
                        'rgb(52, 152, 219)',
                        'rgb(231, 76, 60)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tiempo (segundos)'
                        }
                    }
                }
            }
        });
    }
    
    // Datos de uso de memoria
    const memoriaCtx = document.getElementById('memoryChart')?.getContext('2d');
    if (memoriaCtx) {
        new Chart(memoriaCtx, {
            type: 'radar',
            data: {
                labels: ['Tiempo', 'Memoria', 'Calidad', 'Consistencia', 'Escalabilidad'],
                datasets: [
                    {
                        label: 'Constructivo',
                        data: [95, 90, 75, 70, 85],
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        borderColor: 'rgb(39, 174, 96)',
                        borderWidth: 2
                    },
                    {
                        label: 'Búsqueda Local',
                        data: [60, 75, 85, 80, 65],
                        backgroundColor: 'rgba(243, 156, 18, 0.2)',
                        borderColor: 'rgb(243, 156, 18)',
                        borderWidth: 2
                    },
                    {
                        label: 'Combinado',
                        data: [75, 80, 92, 90, 80],
                        backgroundColor: 'rgba(52, 152, 219, 0.2)',
                        borderColor: 'rgb(52, 152, 219)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Gráfico de consistencia
    const consistenciaCtx = document.getElementById('consistencyChart')?.getContext('2d');
    if (consistenciaCtx) {
        new Chart(consistenciaCtx, {
            type: 'line',
            data: {
                labels: ['4', '6', '8', '10', '12'],
                datasets: [
                    {
                        label: 'Constructivo',
                        data: [78, 76, 75, 74, 72],
                        borderColor: 'rgb(39, 174, 96)',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Búsqueda Local',
                        data: [88, 86, 85, 83, 80],
                        borderColor: 'rgb(243, 156, 18)',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Combinado',
                        data: [95, 93, 92, 90, 88],
                        borderColor: 'rgb(52, 152, 219)',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 70,
                        title: {
                            display: true,
                            text: 'Calidad (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Número de equipos (n)'
                        }
                    }
                }
            }
        });
    }
}

function cargarDatosAnalisis() {
    const datos = [
        {
            algoritmo: 'Constructivo',
            tiempo: '0.5',
            memoria: '2.3',
            costo: '12540.5',
            iteraciones: '1',
            exito: '85'
        },
        {
            algoritmo: 'Búsqueda Local',
            tiempo: '25.3',
            memoria: '8.7',
            costo: '10432.8',
            iteraciones: '1000',
            exito: '95'
        },
        {
            algoritmo: 'Combinado',
            tiempo: '42.8',
            memoria: '10.2',
            costo: '9876.3',
            iteraciones: '500',
            exito: '98'
        },
        {
            algoritmo: 'Fuerza Bruta',
            tiempo: '8.7',
            memoria: '4.5',
            costo: '9567.2',
            iteraciones: '-',
            exito: '100'
        }
    ];
    
    const tbody = document.getElementById('performanceData');
    if (tbody) {
        tbody.innerHTML = '';
        
        datos.forEach(dato => {
            const fila = document.createElement('tr');
            
            // Resaltar mejor resultado en cada categoría
            const esMejorCosto = dato.costo === '9567.2';
            const esMejorTiempo = dato.tiempo === '0.5';
            const esMejorMemoria = dato.memoria === '2.3';
            
            fila.innerHTML = `
                <td><strong>${dato.algoritmo}</strong></td>
                <td class="${esMejorTiempo ? 'best-result' : ''}">${dato.tiempo}s</td>
                <td class="${esMejorMemoria ? 'best-result' : ''}">${dato.memoria} MB</td>
                <td class="${esMejorCosto ? 'best-result' : ''}">${dato.costo}</td>
                <td>${dato.iteraciones}</td>
                <td><span class="success-rate">${dato.exito}%</span></td>
            `;
            
            tbody.appendChild(fila);
        });
    }
}

function configurarEventos() {
    // Eventos para la navegación suave
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
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
    
    // Eventos para tooltips
    const metricBars = document.querySelectorAll('.metric-bar');
    metricBars.forEach(bar => {
        bar.addEventListener('mouseenter', function() {
            const percentage = this.querySelector('.bar-fill').style.width;
            const tooltip = document.createElement('div');
            tooltip.className = 'metric-tooltip';
            tooltip.textContent = `Eficiencia: ${percentage}`;
            
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - 40) + 'px';
            tooltip.style.left = (rect.left + rect.width/2) + 'px';
            tooltip.style.transform = 'translateX(-50%)';
            
            document.body.appendChild(tooltip);
            this._tooltip = tooltip;
        });
        
        bar.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
}

// Estilos adicionales para la página de análisis
const estilosAnalisis = `
    .complexity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    
    .complexity-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border: 1px solid #e0e0e0;
        border-radius: var(--border-radius);
        padding: 1.5rem;
        transition: transform 0.3s ease;
    }
    
    .complexity-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .complexity-card h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .complexity-item {
        margin-bottom: 0.75rem;
    }
    
    .complexity-label {
        font-weight: 600;
        color: var(--dark-color);
        display: inline-block;
        width: 100px;
    }
    
    .complexity-value {
        background-color: #05080aff;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-family: monospace;
        font-weight: 600;
        color: var(--secondary-color);
    }
    
    .complexity-item ul {
        margin: 0.5rem 0 0 1.5rem;
        font-size: 0.9rem;
    }
    
    .complexity-item li {
        margin-bottom: 0.25rem;
        color: var(--gray-color);
    }
    
    .performance-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .chart-container {
        background-color: white;
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    
    .performance-table {
        margin-top: 2rem;
    }
    
    .performance-table h3 {
        margin-bottom: 1rem;
        color: var(--primary-color);
    }
    
    .quality-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    
    .metric-card {
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: var(--border-radius);
        overflow: hidden;
    }
    
    .metric-header {
        background: linear-gradient(135deg, var(--primary-color), #1a252f);
        color: white;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .metric-body {
        padding: 1.5rem;
    }
    
    .metric-bar {
        margin-bottom: 1rem;
    }
    
    .bar-label {
        font-weight: 600;
        color: var(--dark-color);
        margin-bottom: 0.25rem;
    }
    
    .bar-container {
        height: 24px;
        background-color: #e9ecef;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
    }
    
    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success-color), #27ae60);
        border-radius: 12px;
        transition: width 1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 0.85rem;
    }
    
    .consistency-chart {
        height: 200px;
    }
    
    .constraints-table {
        width: 100%;
        font-size: 0.9rem;
    }
    
    .constraints-table th,
    .constraints-table td {
        padding: 0.75rem;
        text-align: center;
    }
    
    .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    
    .badge.success {
        background-color: #d4edda;
        color: #155724;
    }
    
    .conclusions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }
    
    .conclusion-card {
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: var(--border-radius);
        padding: 1.5rem;
        transition: transform 0.3s ease;
    }
    
    .conclusion-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    
    .conclusion-icon {
        font-size: 2rem;
        color: var(--secondary-color);
        margin-bottom: 1rem;
    }
    
    .conclusion-card h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .conclusion-card ul {
        margin: 1rem 0 0 1.5rem;
        font-size: 0.9rem;
    }
    
    .conclusion-card li {
        margin-bottom: 0.5rem;
        color: var(--gray-color);
    }
    
    .recommendations {
        margin-top: 2.5rem;
        padding: 1.5rem;
        background-color: #f8f9fa;
        border-radius: var(--border-radius);
    }
    
    .recommendations h3 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .recommendation-table {
        overflow-x: auto;
    }
    
    .best-result {
        background-color: #e8f4fc;
        font-weight: bold;
        color: var(--secondary-color);
    }
    
    .success-rate {
        background-color: #d4edda;
        color: #155724;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-weight: 600;
    }
    
    .metric-tooltip {
        background-color: var(--dark-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius);
        font-size: 0.85rem;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 768px) {
        .complexity-grid,
        .quality-metrics,
        .conclusions-grid {
            grid-template-columns: 1fr;
        }
        
        .performance-charts {
            grid-template-columns: 1fr;
        }
        
        .chart-container {
            padding: 1rem;
        }
    }
`;

// Agregar estilos a la página
const styleSheet = document.createElement('style');
styleSheet.textContent = estilosAnalisis;
document.head.appendChild(styleSheet);