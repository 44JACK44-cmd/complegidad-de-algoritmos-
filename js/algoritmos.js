// js/algoritmos.js - Implementación de algoritmos de optimización

class AlgoritmoOptimizacion {
    constructor(calendarioBase) {
        this.calendario = calendarioBase;
        this.n = calendarioBase[0].length;
        this.numFechas = calendarioBase.length;
        this.historialCostos = [];
        this.mejorSolucion = null;
        this.mejorCosto = Infinity;
    }
    
    // ========== ALGORITMOS DE MEJORA ==========
    
    busquedaLocal(iteraciones = 1000, temperaturaInicial = 1000) {
        console.log('Iniciando búsqueda local...');
        
        let mejorCalendario = this.calendario;
        let mejorCosto = this.calcularCostoConPenalizacion(mejorCalendario);
        let temperatura = temperaturaInicial;
        const factorEnfriamiento = 0.95;
        
        this.historialCostos = [mejorCosto];
        this.mejorSolucion = mejorCalendario;
        this.mejorCosto = mejorCosto;
        
        for (let iter = 0; iter < iteraciones; iter++) {
            // Generar vecino
            const vecino = this.generarVecinoAvanzado(mejorCalendario);
            const costoVecino = this.calcularCostoConPenalizacion(vecino);
            
            // Criterio de aceptación (recocido simulado)
            const delta = costoVecino - mejorCosto;
            
            if (delta < 0) {
                // Mejor solución encontrada
                mejorCalendario = vecino;
                mejorCosto = costoVecino;
                
                if (costoVecino < this.mejorCosto) {
                    this.mejorSolucion = vecino;
                    this.mejorCosto = costoVecino;
                }
            } else if (Math.random() < Math.exp(-delta / temperatura)) {
                // Aceptar solución peor con cierta probabilidad
                mejorCalendario = vecino;
                mejorCosto = costoVecino;
            }
            
            // Enfriar temperatura
            temperatura *= factorEnfriamiento;
            
            // Registrar historial
            this.historialCostos.push(mejorCosto);
            
            // Mostrar progreso cada 100 iteraciones
            if (iter % 100 === 0) {
                console.log(`Iteración ${iter}: Costo = ${mejorCosto.toFixed(2)}, Temp = ${temperatura.toFixed(2)}`);
            }
            
            // Condición de parada por temperatura
            if (temperatura < 0.1) {
                console.log(`Temperatura mínima alcanzada en iteración ${iter}`);
                break;
            }
        }
        
        console.log(`Búsqueda local completada. Mejor costo: ${this.mejorCosto.toFixed(2)}`);
        return this.mejorSolucion;
    }
    
    algoritmoGenetico(poblacionSize = 50, generaciones = 100) {
        console.log('Iniciando algoritmo genético...');
        
        // Crear población inicial
        let poblacion = this.crearPoblacionInicial(poblacionSize);
        
        this.mejorCosto = Infinity;
        this.mejorSolucion = null;
        this.historialCostos = [];
        
        for (let gen = 0; gen < generaciones; gen++) {
            // Evaluar población
            const evaluaciones = poblacion.map(individuo => ({
                individuo,
                costo: this.calcularCostoConPenalizacion(individuo)
            }));
            
            // Ordenar por costo (menor es mejor)
            evaluaciones.sort((a, b) => a.costo - b.costo);
            
            // Actualizar mejor solución
            if (evaluaciones[0].costo < this.mejorCosto) {
                this.mejorCosto = evaluaciones[0].costo;
                this.mejorSolucion = evaluaciones[0].individuo;
            }
            
            // Seleccionar padres (torneo)
            const padres = this.seleccionarPadres(evaluaciones);
            
            // Crear nueva generación
            const nuevaGeneracion = [];
            
            // Mantener elite
            const eliteSize = Math.floor(poblacionSize * 0.1);
            for (let i = 0; i < eliteSize; i++) {
                nuevaGeneracion.push(evaluaciones[i].individuo);
            }
            
            // Cruzar para completar población
            while (nuevaGeneracion.length < poblacionSize) {
                const padre1 = padres[Math.floor(Math.random() * padres.length)];
                const padre2 = padres[Math.floor(Math.random() * padres.length)];
                
                const hijo = this.cruzar(padre1.individuo, padre2.individuo);
                const hijoMutado = this.mutar(hijo);
                
                nuevaGeneracion.push(hijoMutado);
            }
            
            poblacion = nuevaGeneracion;
            
            // Registrar historial
            this.historialCostos.push(this.mejorCosto);
            
            // Mostrar progreso
            if (gen % 10 === 0) {
                console.log(`Generación ${gen}: Mejor costo = ${this.mejorCosto.toFixed(2)}`);
            }
        }
        
        console.log(`Algoritmo genético completado. Mejor costo: ${this.mejorCosto.toFixed(2)}`);
        return this.mejorSolucion;
    }
    
    busquedaTabu(maxIteraciones = 500, tamanoListaTabu = 20) {
        console.log('Iniciando búsqueda tabú...');
        
        let mejorCalendario = this.calendario;
        let mejorCosto = this.calcularCostoConPenalizacion(mejorCalendario);
        let solucionActual = mejorCalendario;
        let costoActual = mejorCosto;
        
        const listaTabu = [];
        this.historialCostos = [mejorCosto];
        
        for (let iter = 0; iter < maxIteraciones; iter++) {
            // Generar vecindario
            const vecinos = this.generarVecindario(solucionActual, 20);
            
            // Evaluar vecinos (excluyendo movimientos tabú)
            let mejorVecino = null;
            let mejorCostoVecino = Infinity;
            let mejorMovimiento = null;
            
            for (const vecino of vecinos) {
                const movimiento = this.identificarMovimiento(solucionActual, vecino);
                const costoVecino = this.calcularCostoConPenalizacion(vecino);
                
                // Verificar si el movimiento está en lista tabú
                const esTabu = listaTabu.some(item => 
                    this.movimientosIguales(item, movimiento)
                );
                
                if (!esTabu && costoVecino < mejorCostoVecino) {
                    mejorVecino = vecino;
                    mejorCostoVecino = costoVecino;
                    mejorMovimiento = movimiento;
                }
            }
            
            if (!mejorVecino) {
                console.log('No se encontraron movimientos no tabú');
                break;
            }
            
            // Actualizar solución actual
            solucionActual = mejorVecino;
            costoActual = mejorCostoVecino;
            
            // Actualizar mejor solución global
            if (costoActual < mejorCosto) {
                mejorCalendario = solucionActual;
                mejorCosto = costoActual;
                this.mejorSolucion = mejorCalendario;
                this.mejorCosto = mejorCosto;
            }
            
            // Agregar movimiento a lista tabú
            listaTabu.push(mejorMovimiento);
            if (listaTabu.length > tamanoListaTabu) {
                listaTabu.shift();
            }
            
            // Registrar historial
            this.historialCostos.push(mejorCosto);
            
            // Mostrar progreso
            if (iter % 50 === 0) {
                console.log(`Iteración ${iter}: Costo = ${mejorCosto.toFixed(2)}`);
            }
        }
        
        console.log(`Búsqueda tabú completada. Mejor costo: ${mejorCosto.toFixed(2)}`);
        return mejorCalendario;
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    calcularCostoConPenalizacion(calendario) {
        // Calcular costo base (giras)
        let costoTotal = 0;
        const n = calendario[0].length;
        
        for (let equipo = 0; equipo < n; equipo++) {
            costoTotal += this.calcularCostoGira(calendario, equipo);
        }
        
        // Penalizar violaciones de restricciones
        const violacionesStreak = this.contarViolacionesStreak(calendario);
        const violacionesRepeticion = this.contarRepeticionesConsecutivas(calendario);
        
        const penalizacion = violacionesStreak * 1000 + violacionesRepeticion * 500;
        
        return costoTotal + penalizacion;
    }
    
    calcularCostoGira(calendario, equipo) {
        let costoTotal = 0;
        const D = window.currentData?.D || [];
        let posicionActual = equipo;
        
        for (let fecha = 0; fecha < this.numFechas; fecha++) {
            const rivalCodigo = calendario[fecha][equipo];
            
            if (rivalCodigo < 0) { // Es visitante
                const rivalAbs = Math.abs(rivalCodigo);
                const rivalIdx = rivalAbs - 1;
                
                if (D[posicionActual] && D[posicionActual][rivalIdx]) {
                    costoTotal += D[posicionActual][rivalIdx];
                }
                posicionActual = rivalIdx;
            } else if (calendario[fecha][equipo] > 0) {
                // Es local, volver a su ciudad
                if (D[posicionActual] && D[posicionActual][equipo]) {
                    costoTotal += D[posicionActual][equipo];
                }
                posicionActual = equipo;
            }
        }
        
        // Regresar a casa si terminó de visita
        if (posicionActual !== equipo && D[posicionActual] && D[posicionActual][equipo]) {
            costoTotal += D[posicionActual][equipo];
        }
        
        return costoTotal;
    }
    
    contarViolacionesStreak(calendario) {
        if (!window.currentData) return 0;
        
        const { minStreak, maxStreak } = window.currentData;
        const n = calendario[0].length;
        let violaciones = 0;
        
        for (let equipo = 0; equipo < n; equipo++) {
            let streakActual = 0;
            let tipoStreakActual = null;
            
            for (let fecha = 0; fecha < this.numFechas; fecha++) {
                const esLocal = calendario[fecha][equipo] > 0;
                const tipoActual = esLocal ? 'L' : 'V';
                
                if (fecha === 0) {
                    streakActual = 1;
                    tipoStreakActual = tipoActual;
                } else if (tipoActual === tipoStreakActual) {
                    streakActual++;
                } else {
                    if (streakActual < minStreak || streakActual > maxStreak) {
                        violaciones++;
                    }
                    streakActual = 1;
                    tipoStreakActual = tipoActual;
                }
            }
            
            // Verificar último streak
            if (streakActual < minStreak || streakActual > maxStreak) {
                violaciones++;
            }
        }
        
        return violaciones;
    }
    
    contarRepeticionesConsecutivas(calendario) {
        const n = calendario[0].length;
        let repeticiones = 0;
        
        for (let equipo = 0; equipo < n; equipo++) {
            let ultimoRival = null;
            
            for (let fecha = 0; fecha < this.numFechas; fecha++) {
                const rival = Math.abs(calendario[fecha][equipo]);
                
                if (ultimoRival === rival) {
                    repeticiones++;
                }
                
                ultimoRival = rival;
            }
        }
        
        return repeticiones;
    }
    
    generarVecinoAvanzado(calendario) {
        const vecino = calendario.map(fila => [...fila]);
        const n = this.n;
        
        // Elegir tipo de movimiento aleatorio
        const tipoMovimiento = Math.floor(Math.random() * 3);
        
        switch (tipoMovimiento) {
            case 0: // Intercambiar dos equipos en una fecha
                this.intercambiarEquipos(vecino);
                break;
                
            case 1: // Intercambiar dos fechas completas
                this.intercambiarFechas(vecino);
                break;
                
            case 2: // Invertir localía en un partido
                this.invertirLocalia(vecino);
                break;
        }
        
        return vecino;
    }
    
    intercambiarEquipos(calendario) {
        const fecha = Math.floor(Math.random() * this.numFechas);
        const equipo1 = Math.floor(Math.random() * this.n);
        let equipo2;
        
        do {
            equipo2 = Math.floor(Math.random() * this.n);
        } while (equipo1 === equipo2);
        
        const temp = calendario[fecha][equipo1];
        calendario[fecha][equipo1] = calendario[fecha][equipo2];
        calendario[fecha][equipo2] = temp;
        
        // Ajustar simetría
        const rival1 = Math.abs(calendario[fecha][equipo1]);
        const rival2 = Math.abs(calendario[fecha][equipo2]);
        
        if (rival1 > 0) {
            const idx1 = rival1 - 1;
            calendario[fecha][idx1] = calendario[fecha][equipo1] > 0 ? 
                -(equipo1 + 1) : equipo1 + 1;
        }
        
        if (rival2 > 0) {
            const idx2 = rival2 - 1;
            calendario[fecha][idx2] = calendario[fecha][equipo2] > 0 ? 
                -(equipo2 + 1) : equipo2 + 1;
        }
    }
    
    intercambiarFechas(calendario) {
        const fecha1 = Math.floor(Math.random() * this.numFechas);
        const fecha2 = Math.floor(Math.random() * this.numFechas);
        
        if (fecha1 !== fecha2) {
            [calendario[fecha1], calendario[fecha2]] = [calendario[fecha2], calendario[fecha1]];
        }
    }
    
    invertirLocalia(calendario) {
        const fecha = Math.floor(Math.random() * this.numFechas);
        const equipo = Math.floor(Math.random() * this.n);
        
        const rivalCodigo = calendario[fecha][equipo];
        if (rivalCodigo !== 0) {
            const rivalIdx = Math.abs(rivalCodigo) - 1;
            
            // Invertir localía
            calendario[fecha][equipo] = -rivalCodigo;
            calendario[fecha][rivalIdx] = -calendario[fecha][rivalIdx];
        }
    }
    
    // ========== ALGORITMO GENÉTICO ==========
    
    crearPoblacionInicial(size) {
        const poblacion = [];
        
        // Incluir la solución base
        poblacion.push(this.calendario);
        
        // Generar soluciones aleatorias
        for (let i = 1; i < size; i++) {
            poblacion.push(this.generarSolucionAleatoria());
        }
        
        return poblacion;
    }
    
    generarSolucionAleatoria() {
        // Generar calendario aleatorio válido
        const n = this.n;
        const numFechas = this.numFechas;
        const calendario = Array(numFechas).fill().map(() => Array(n).fill(0));
        
        // Lista de todos los partidos (ida y vuelta)
        const partidos = [];
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                partidos.push([i, j, 'ida']);
                partidos.push([j, i, 'vuelta']);
            }
        }
        
        // Mezclar partidos
        this.mezclarArray(partidos);
        
        // Asignar partidos a fechas
        for (let fecha = 0; fecha < numFechas; fecha++) {
            const equiposUsados = new Set();
            
            for (const [local, visitante, tipo] of partidos) {
                if (!equiposUsados.has(local) && !equiposUsados.has(visitante)) {
                    if (tipo === 'ida') {
                        calendario[fecha][local] = -(visitante + 1);
                        calendario[fecha][visitante] = local + 1;
                    } else {
                        calendario[fecha][local] = visitante + 1;
                        calendario[fecha][visitante] = -(local + 1);
                    }
                    
                    equiposUsados.add(local);
                    equiposUsados.add(visitante);
                    
                    // Eliminar este partido de la lista
                    const index = partidos.findIndex(p => 
                        p[0] === local && p[1] === visitante && p[2] === tipo
                    );
                    if (index > -1) partidos.splice(index, 1);
                }
            }
        }
        
        return calendario;
    }
    
    seleccionarPadres(evaluaciones, torneoSize = 3) {
        const padres = [];
        
        while (padres.length < evaluaciones.length / 2) {
            // Selección por torneo
            const torneo = [];
            for (let i = 0; i < torneoSize; i++) {
                const idx = Math.floor(Math.random() * evaluaciones.length);
                torneo.push(evaluaciones[idx]);
            }
            
            torneo.sort((a, b) => a.costo - b.costo);
            padres.push(torneo[0]);
        }
        
        return padres;
    }
    
    cruzar(padre1, padre2) {
        // Cruce por uniforme
        const hijo = padre1.map((fila, fechaIdx) => {
            // 50% de probabilidad de tomar de cada padre
            return Math.random() < 0.5 ? [...fila] : [...padre2[fechaIdx]];
        });
        
        return hijo;
    }
    
    mutar(individuo, probabilidad = 0.1) {
        const mutado = individuo.map(fila => [...fila]);
        
        for (let fecha = 0; fecha < this.numFechas; fecha++) {
            if (Math.random() < probabilidad) {
                // Realizar mutación en esta fecha
                const equipo1 = Math.floor(Math.random() * this.n);
                const equipo2 = Math.floor(Math.random() * this.n);
                
                if (equipo1 !== equipo2) {
                    const temp = mutado[fecha][equipo1];
                    mutado[fecha][equipo1] = mutado[fecha][equipo2];
                    mutado[fecha][equipo2] = temp;
                    
                    // Ajustar simetría
                    const rival1 = Math.abs(mutado[fecha][equipo1]);
                    const rival2 = Math.abs(mutado[fecha][equipo2]);
                    
                    if (rival1 > 0) {
                        const idx1 = rival1 - 1;
                        mutado[fecha][idx1] = mutado[fecha][equipo1] > 0 ? 
                            -(equipo1 + 1) : equipo1 + 1;
                    }
                    
                    if (rival2 > 0) {
                        const idx2 = rival2 - 1;
                        mutado[fecha][idx2] = mutado[fecha][equipo2] > 0 ? 
                            -(equipo2 + 1) : equipo2 + 1;
                    }
                }
            }
        }
        
        return mutado;
    }
    
    // ========== BÚSQUEDA TABÚ ==========
    
    generarVecindario(solucion, tamano) {
        const vecindario = [];
        
        for (let i = 0; i < tamano; i++) {
            vecindario.push(this.generarVecinoAvanzado(solucion));
        }
        
        return vecindario;
    }
    
    identificarMovimiento(solucionAnterior, solucionNueva) {
        // Identificar qué cambio se realizó
        for (let fecha = 0; fecha < this.numFechas; fecha++) {
            for (let equipo = 0; equipo < this.n; equipo++) {
                if (solucionAnterior[fecha][equipo] !== solucionNueva[fecha][equipo]) {
                    return {
                        tipo: 'intercambio',
                        fecha,
                        equipo,
                        valorAnterior: solucionAnterior[fecha][equipo],
                        valorNuevo: solucionNueva[fecha][equipo]
                    };
                }
            }
        }
        
        return { tipo: 'desconocido' };
    }
    
    movimientosIguales(mov1, mov2) {
        return mov1.fecha === mov2.fecha && 
               mov1.equipo === mov2.equipo &&
               mov1.tipo === mov2.tipo;
    }
    
    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // ========== UTILIDADES ==========
    
    obtenerHistorialCostos() {
        return this.historialCostos;
    }
    
    obtenerMejorCosto() {
        return this.mejorCosto;
    }
    
    obtenerMejorSolucion() {
        return this.mejorSolucion;
    }
}

// Exportar para uso global
window.AlgoritmoOptimizacion = AlgoritmoOptimizacion;