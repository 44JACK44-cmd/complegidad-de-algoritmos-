// js/visualizacion.js - Funciones de visualización

class VisualizadorCalendario {
    constructor() {
        this.charts = {};
    }
    
    // Crear gráfico de costos por equipo
    crearGraficoCostos(ctx, datos) {
        if (this.charts.costos) {
            this.charts.costos.destroy();
        }
        
        this.charts.costos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.labels,
                datasets: [{
                    label: 'Costo por Equipo',
                    data: datos.valores,
                    backgroundColor: this.generarColores(datos.valores.length),
                    borderColor: '#2c3e50',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Equipo ${context.label}: ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Costo'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Equipos'
                        }
                    }
                }
            }
        });
    }
    
    // Crear gráfico comparativo de algoritmos
    crearGraficoComparativo(ctx, datos) {
        if (this.charts.comparativo) {
            this.charts.comparativo.destroy();
        }
        
        this.charts.comparativo = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Tiempo', 'Costo', 'Calidad', 'Memoria', 'Consistencia'],
                datasets: datos.map((algo, index) => ({
                    label: algo.nombre,
                    data: [algo.tiempo, algo.costo, algo.calidad, algo.memoria, algo.consistencia],
                    backgroundColor: this.generarColorTransparente(index),
                    borderColor: this.generarColor(index),
                    borderWidth: 2
                }))
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
    
    // Generar colores para gráficos
    generarColores(n) {
        const colores = [];
        const hueStep = 360 / n;
        
        for (let i = 0; i < n; i++) {
            const hue = i * hueStep;
            colores.push(`hsl(${hue}, 70%, 60%)`);
        }
        
        return colores;
    }
    
    generarColor(index) {
        const colores = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
        return colores[index % colores.length];
    }
    
    generarColorTransparente(index) {
        const color = this.generarColor(index);
        return color.replace('rgb', 'rgba').replace(')', ', 0.2)');
    }
    
    // Visualizar matriz de distancias
    visualizarMatriz(containerId, matriz) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        const table = document.createElement('table');
        table.className = 'matrix-visualization';
        
        // Encabezado
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Celda vacía
        
        for (let j = 0; j < matriz[0].length; j++) {
            const th = document.createElement('th');
            th.textContent = `Eq ${j + 1}`;
            headerRow.appendChild(th);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Cuerpo
        const tbody = document.createElement('tbody');
        
        for (let i = 0; i < matriz.length; i++) {
            const row = document.createElement('tr');
            
            // Encabezado de fila
            const rowHeader = document.createElement('th');
            rowHeader.textContent = `Eq ${i + 1}`;
            row.appendChild(rowHeader);
            
            // Valores
            for (let j = 0; j < matriz[i].length; j++) {
                const cell = document.createElement('td');
                cell.textContent = matriz[i][j];
                
                // Resaltar diagonal
                if (i === j) {
                    cell.className = 'diagonal';
                }
                
                // Color por valor
                const maxVal = Math.max(...matriz.flat());
                const opacity = matriz[i][j] / maxVal;
                cell.style.backgroundColor = `rgba(52, 152, 219, ${0.2 + opacity * 0.6})`;
                
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        container.appendChild(table);
    }
    
    // Visualizar calendario como tabla
    visualizarCalendario(containerId, calendario) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        const n = calendario[0].length;
        const numFechas = calendario.length;
        
        // Crear tabla
        const table = document.createElement('table');
        table.className = 'calendar-table';
        
        // Encabezado
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Celda vacía
        
        for (let fecha = 0; fecha < numFechas; fecha++) {
            const th = document.createElement('th');
            th.textContent = `F${fecha + 1}`;
            headerRow.appendChild(th);
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Cuerpo
        const tbody = document.createElement('tbody');
        
        for (let equipo = 0; equipo < n; equipo++) {
            const row = document.createElement('tr');
            
            // Encabezado de equipo
            const rowHeader = document.createElement('th');
            rowHeader.textContent = `Eq ${equipo + 1}`;
            row.appendChild(rowHeader);
            
            // Partidos
            for (let fecha = 0; fecha < numFechas; fecha++) {
                const cell = document.createElement('td');
                const valor = calendario[fecha][equipo];
                
                if (valor > 0) {
                    cell.textContent = `vs ${valor}`;
                    cell.className = 'home-match';
                    cell.title = `Local vs Equipo ${valor}`;
                } else if (valor < 0) {
                    cell.textContent = `@ ${Math.abs(valor)}`;
                    cell.className = 'away-match';
                    cell.title = `Visitante vs Equipo ${Math.abs(valor)}`;
                }
                
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        container.appendChild(table);
    }
    
    // Crear gráfico de evolución de costos
    crearGraficoEvolucion(ctx, historialCostos) {
        if (this.charts.evolucion) {
            this.charts.evolucion.destroy();
        }
        
        this.charts.evolucion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historialCostos.map((_, i) => i + 1),
                datasets: [{
                    label: 'Costo',
                    data: historialCostos,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución del Costo'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }
}

// Exportar para uso global
window.VisualizadorCalendario = VisualizadorCalendario;