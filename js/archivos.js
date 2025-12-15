// js/archivos.js - Manejo de archivos y entrada/salida

class ManejadorArchivos {
    constructor() {
        this.ultimoArchivo = null;
    }
    
    // ========== LECTURA DE ARCHIVOS ==========
    
    async leerArchivoEntrada(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const contenido = event.target.result;
                    const datos = this.parsearArchivoEntrada(contenido);
                    this.ultimoArchivo = {
                        nombre: file.name,
                        datos: datos,
                        contenido: contenido
                    };
                    resolve(datos);
                } catch (error) {
                    reject(new Error(`Error al procesar archivo: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    }
    
    parsearArchivoEntrada(contenido) {
        const lineas = contenido.split('\n')
            .map(linea => linea.trim())
            .filter(linea => linea !== '');
        
        if (lineas.length < 3) {
            throw new Error('Archivo incompleto. Se esperan al menos 3 líneas.');
        }
        
        // Leer n (número de equipos)
        const n = parseInt(lineas[0]);
        if (isNaN(n) || n <= 0) {
            throw new Error('Primera línea debe contener un número positivo de equipos');
        }
        if (n % 2 !== 0) {
            throw new Error('El número de equipos debe ser par');
        }
        
        // Leer Min
        const minStreak = parseInt(lineas[1]);
        if (isNaN(minStreak) || minStreak <= 0) {
            throw new Error('Segunda línea debe contener un entero positivo (Min)');
        }
        
        // Leer Max
        const maxStreak = parseInt(lineas[2]);
        if (isNaN(maxStreak) || maxStreak <= 0) {
            throw new Error('Tercera línea debe contener un entero positivo (Max)');
        }
        if (maxStreak < minStreak) {
            throw new Error('Max debe ser mayor o igual a Min');
        }
        
        // Verificar que hay suficientes líneas para la matriz
        if (lineas.length < 3 + n) {
            throw new Error(`Se esperaban ${n} filas para la matriz de distancias`);
        }
        
        // Leer matriz de distancias
        const D = [];
        for (let i = 0; i < n; i++) {
            const filaStr = lineas[3 + i];
            const valores = filaStr.split(/\s+/).map(val => {
                const num = parseInt(val);
                if (isNaN(num)) {
                    throw new Error(`Valor no numérico en fila ${i + 4}: "${val}"`);
                }
                return num;
            });
            
            if (valores.length !== n) {
                throw new Error(`Fila ${i + 4} tiene ${valores.length} elementos, esperados ${n}`);
            }
            
            D.push(valores);
        }
        
        // Verificar que la matriz es simétrica y tiene ceros en la diagonal
        for (let i = 0; i < n; i++) {
            if (D[i][i] !== 0) {
                throw new Error(`La diagonal de la matriz debe contener ceros (D[${i}][${i}] = ${D[i][i]})`);
            }
            
            for (let j = i + 1; j < n; j++) {
                if (D[i][j] !== D[j][i]) {
                    throw new Error(`La matriz no es simétrica: D[${i}][${j}] = ${D[i][j]}, D[${j}][${i}] = ${D[j][i]}`);
                }
                if (D[i][j] < 0) {
                    throw new Error(`Las distancias deben ser no negativas: D[${i}][${j}] = ${D[i][j]}`);
                }
            }
        }
        
        return {
            n,
            minStreak,
            maxStreak,
            D,
            numFechas: 2 * (n - 1)
        };
    }
    
    // ========== GENERACIÓN DE ARCHIVOS DE SALIDA ==========
    
    generarArchivoSalida(datosEntrada, calendario, algoritmo, tiempoEjecucion) {
        const { n, minStreak, maxStreak } = datosEntrada;
        
        let contenido = `${n}\n`;
        contenido += `${minStreak}\n`;
        contenido += `${maxStreak}\n`;
        
        // Agregar cada fecha del calendario
        calendario.forEach((fecha, idx) => {
            contenido += fecha.join(' ') + '\n';
        });
        
        // Agregar metadatos como comentario
        contenido += `\n# Generado: ${new Date().toISOString()}\n`;
        contenido += `# Algoritmo: ${algoritmo}\n`;
        contenido += `# Tiempo de ejecución: ${tiempoEjecucion.toFixed(2)}s\n`;
        
        return contenido;
    }
    
    descargarArchivo(contenido, nombreArchivo) {
        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombreArchivo;
        enlace.style.display = 'none';
        
        document.body.appendChild(enlace);
        enlace.click();
        
        setTimeout(() => {
            document.body.removeChild(enlace);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    // ========== GENERACIÓN DE ARCHIVOS DE EJEMPLO ==========
    
    generarDatosEjemplo(nEquipos) {
        let n, minStreak, maxStreak, D;
        
        switch(nEquipos) {
            case 4:
                n = 4;
                minStreak = 1;
                maxStreak = 3;
                D = [
                    [0, 745, 665, 929],
                    [745, 0, 80, 337],
                    [665, 80, 0, 380],
                    [929, 337, 380, 0]
                ];
                break;
                
            case 6:
                n = 6;
                minStreak = 1;
                maxStreak = 3;
                D = this.generarMatrizDistancias(n);
                break;
                
            case 8:
                n = 8;
                minStreak = 1;
                maxStreak = 3;
                D = this.generarMatrizDistancias(n);
                break;
                
            case 'random':
                n = Math.floor(Math.random() * 5) * 2 + 4; // 4, 6, 8, 10, 12
                minStreak = Math.max(1, Math.floor(Math.random() * 3) + 1);
                maxStreak = minStreak + Math.floor(Math.random() * 3) + 1;
                D = this.generarMatrizDistancias(n);
                break;
                
            default:
                throw new Error(`Ejemplo no soportado: ${nEquipos}`);
        }
        
        return { n, minStreak, maxStreak, D };
    }
    
    generarMatrizDistancias(n) {
        const D = [];
        
        for (let i = 0; i < n; i++) {
            const fila = [];
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    fila.push(0);
                } else if (j < i) {
                    // Usar valor simétrico ya calculado
                    fila.push(D[j][i]);
                } else {
                    // Generar distancia aleatoria entre 100 y 1000
                    fila.push(Math.floor(Math.random() * 900) + 100);
                }
            }
            D.push(fila);
        }
        
        return D;
    }
    
    // ========== VALIDACIÓN DE CALENDARIO ==========
    
    validarCalendarioSalida(calendario, datosEntrada) {
        const { n, minStreak, maxStreak } = datosEntrada;
        const numFechas = 2 * (n - 1);
        const errores = [];
        
        // 1. Verificar dimensiones
        if (!Array.isArray(calendario) || calendario.length !== numFechas) {
            errores.push(`El calendario debe tener ${numFechas} fechas, tiene ${calendario.length}`);
            return { valido: false, errores };
        }
        
        for (let i = 0; i < numFechas; i++) {
            if (!Array.isArray(calendario[i]) || calendario[i].length !== n) {
                errores.push(`Fecha ${i + 1} no tiene ${n} equipos`);
                return { valido: false, errores };
            }
        }
        
        // 2. Verificar que cada fecha tiene n/2 locales y n/2 visitantes
        for (let fecha = 0; fecha < numFechas; fecha++) {
            let locales = 0;
            let visitantes = 0;
            
            for (let equipo = 0; equipo < n; equipo++) {
                const valor = calendario[fecha][equipo];
                
                if (valor > 0) {
                    locales++;
                } else if (valor < 0) {
                    visitantes++;
                } else {
                    errores.push(`Fecha ${fecha + 1}, equipo ${equipo + 1}: valor 0 no permitido`);
                }
            }
            
            if (locales !== n / 2) {
                errores.push(`Fecha ${fecha + 1}: tiene ${locales} locales, esperados ${n / 2}`);
            }
            
            if (visitantes !== n / 2) {
                errores.push(`Fecha ${fecha + 1}: tiene ${visitantes} visitantes, esperados ${n / 2}`);
            }
        }
        
        // 3. Verificar simetría
        for (let fecha = 0; fecha < numFechas; fecha++) {
            for (let equipo = 0; equipo < n; equipo++) {
                const rivalCodigo = calendario[fecha][equipo];
                const rivalAbs = Math.abs(rivalCodigo);
                
                if (rivalAbs < 1 || rivalAbs > n) {
                    errores.push(`Fecha ${fecha + 1}, equipo ${equipo + 1}: rival inválido ${rivalCodigo}`);
                    continue;
                }
                
                const rivalIdx = rivalAbs - 1;
                const codigoEsperado = rivalCodigo > 0 ? -(equipo + 1) : equipo + 1;
                
                if (calendario[fecha][rivalIdx] !== codigoEsperado) {
                    errores.push(`Fecha ${fecha + 1}: asimetría entre equipo ${equipo + 1} y ${rivalAbs}`);
                }
            }
        }
        
        // 4. Verificar restricción ida-vuelta (simplificada)
        // Aquí debería implementarse la verificación completa
        
        // 5. Verificar restricciones de streak
        const resultadoStreak = this.verificarStreaks(calendario, minStreak, maxStreak);
        if (!resultadoStreak.valido) {
            errores.push(...resultadoStreak.errores);
        }
        
        return {
            valido: errores.length === 0,
            errores: errores
        };
    }
    
    verificarStreaks(calendario, minStreak, maxStreak) {
        const n = calendario[0].length;
        const numFechas = calendario.length;
        const errores = [];
        
        for (let equipo = 0; equipo < n; equipo++) {
            let streakActual = 0;
            let tipoStreakActual = null;
            
            for (let fecha = 0; fecha < numFechas; fecha++) {
                const esLocal = calendario[fecha][equipo] > 0;
                const tipoActual = esLocal ? 'L' : 'V';
                
                if (fecha === 0) {
                    streakActual = 1;
                    tipoStreakActual = tipoActual;
                } else if (tipoActual === tipoStreakActual) {
                    streakActual++;
                } else {
                    if (streakActual < minStreak || streakActual > maxStreak) {
                        errores.push(`Equipo ${equipo + 1}: streak ${tipoStreakActual} de tamaño ${streakActual} fuera de rango [${minStreak}, ${maxStreak}]`);
                    }
                    streakActual = 1;
                    tipoStreakActual = tipoActual;
                }
            }
            
            // Verificar último streak
            if (streakActual < minStreak || streakActual > maxStreak) {
                errores.push(`Equipo ${equipo + 1}: streak final ${tipoStreakActual} de tamaño ${streakActual} fuera de rango [${minStreak}, ${maxStreak}]`);
            }
        }
        
        return {
            valido: errores.length === 0,
            errores: errores
        };
    }
    
    // ========== UTILIDADES ==========
    
    formatearMatrizParaVisualizacion(matriz, maxFilas = 6, maxColumnas = 6) {
        const n = matriz.length;
        const mostrarFilas = Math.min(maxFilas, n);
        const mostrarColumnas = Math.min(maxColumnas, n);
        
        const tabla = document.createElement('table');
        tabla.className = 'matrix-preview-table';
        
        // Encabezados de columnas
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Celda vacía
        
        for (let j = 0; j < mostrarColumnas; j++) {
            const th = document.createElement('th');
            th.textContent = `Eq ${j + 1}`;
            headerRow.appendChild(th);
        }
        
        if (n > mostrarColumnas) {
            const th = document.createElement('th');
            th.textContent = '...';
            th.className = 'ellipsis';
            headerRow.appendChild(th);
        }
        
        thead.appendChild(headerRow);
        tabla.appendChild(thead);
        
        // Cuerpo
        const tbody = document.createElement('tbody');
        
        for (let i = 0; i < mostrarFilas; i++) {
            const row = document.createElement('tr');
            
            // Encabezado de fila
            const rowHeader = document.createElement('th');
            rowHeader.textContent = `Eq ${i + 1}`;
            row.appendChild(rowHeader);
            
            // Valores
            for (let j = 0; j < mostrarColumnas; j++) {
                const cell = document.createElement('td');
                cell.textContent = matriz[i][j];
                cell.title = `D[${i + 1}][${j + 1}] = ${matriz[i][j]}`;
                row.appendChild(cell);
            }
            
            if (n > mostrarColumnas) {
                const cell = document.createElement('td');
                cell.textContent = '...';
                cell.className = 'ellipsis';
                row.appendChild(cell);
            }
            
            tbody.appendChild(row);
        }
        
        if (n > mostrarFilas) {
            const ellipsisRow = document.createElement('tr');
            const ellipsisCell = document.createElement('td');
            ellipsisCell.colSpan = mostrarColumnas + 2;
            ellipsisCell.textContent = '⋮';
            ellipsisCell.className = 'ellipsis';
            ellipsisCell.style.textAlign = 'center';
            ellipsisRow.appendChild(ellipsisCell);
            tbody.appendChild(ellipsisRow);
        }
        
        tabla.appendChild(tbody);
        return tabla;
    }
    
    obtenerUltimoArchivo() {
        return this.ultimoArchivo;
    }
    
    limpiarUltimoArchivo() {
        this.ultimoArchivo = null;
    }
}

// Exportar para uso global
window.ManejadorArchivos = ManejadorArchivos;