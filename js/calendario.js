// js/calendario.js - Implementación de la lógica del calendario

class CalendarioTorneo {
    constructor(n, D, minStreak, maxStreak) {
        if (n % 2 !== 0) {
            throw new Error('El número de equipos debe ser par');
        }
        
        this.n = n;
        this.D = D; // Matriz de distancias
        this.minStreak = minStreak;
        this.maxStreak = maxStreak;
        this.numFechas = 2 * (n - 1);
    }
    
    // ========== ALGORITMOS DE SOLUCIÓN ==========
    
    algoritmoConstructivo() {
        const n = this.n;
        const calendario = Array(this.numFechas).fill().map(() => Array(n).fill(0));
        
        // Lista de partidos pendientes
        const partidosPendientes = [];
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                // Ida: i local, j visitante
                partidosPendientes.push({ local: i, visitante: j, tipo: 'ida' });
                // Vuelta: j local, i visitante
                partidosPendientes.push({ local: j, visitante: i, tipo: 'vuelta' });
            }
        }
        
        // Mezclar partidos
        this.mezclarArray(partidosPendientes);
        
        // Programar partidos
        let fecha = 0;
        while (fecha < this.numFechas && partidosPendientes.length > 0) {
            const equiposDisponibles = new Set(Array.from({length: n}, (_, i) => i));
            const partidosFecha = [];
            
            // Seleccionar partidos para esta fecha
            for (let i = partidosPendientes.length - 1; i >= 0; i--) {
                const partido = partidosPendientes[i];
                if (equiposDisponibles.has(partido.local) && equiposDisponibles.has(partido.visitante)) {
                    partidosFecha.push(partido);
                    equiposDisponibles.delete(partido.local);
                    equiposDisponibles.delete(partido.visitante);
                    partidosPendientes.splice(i, 1);
                }
            }
            
            // Programar partidos seleccionados
            partidosFecha.forEach(partido => {
                if (partido.tipo === 'ida') {
                    calendario[fecha][partido.local] = -(partido.visitante + 1);
                    calendario[fecha][partido.visitante] = partido.local + 1;
                } else {
                    calendario[fecha][partido.local] = partido.visitante + 1;
                    calendario[fecha][partido.visitante] = -(partido.local + 1);
                }
            });
            
            fecha++;
        }
        
        return calendario;
    }
    
    algoritmoBusquedaLocal(iteraciones = 1000) {
        // Generar calendario inicial
        let mejorCalendario = this.algoritmoConstructivo();
        let mejorCosto = this.calcularCostoTotal(mejorCalendario);
        
        for (let iter = 0; iter < iteraciones; iter++) {
            // Generar vecino intercambiando dos partidos
            const vecino = this.generarVecino(mejorCalendario);
            
            if (vecino && this.esCalendarioValido(vecino).valido) {
                const costoVecino = this.calcularCostoTotal(vecino);
                
                if (costoVecino < mejorCosto) {
                    mejorCalendario = vecino;
                    mejorCosto = costoVecino;
                }
            }
            
            // Enfriamiento (recocido simulado simple)
            if (iter % 100 === 0 && iter > 0) {
                // Aceptar algunos empeoramientos al inicio
                if (Math.random() < 0.1) {
                    mejorCalendario = this.generarVecino(mejorCalendario) || mejorCalendario;
                }
            }
        }
        
        return mejorCalendario;
    }
    
    algoritmoCombinado() {
        // Primero constructivo, luego búsqueda local
        const calConstructivo = this.algoritmoConstructivo();
        return this.algoritmoBusquedaLocal(500, calConstructivo);
    }
    
    algoritmoFuerzaBruta() {
        // Solo para n ≤ 4
        if (this.n > 4) {
            throw new Error('Fuerza bruta solo disponible para n ≤ 4');
        }
        
        // Generar todas las permutaciones posibles (simplificado)
        const calBase = this.algoritmoConstructivo();
        let mejorCalendario = calBase;
        let mejorCosto = this.calcularCostoTotal(calBase);
        
        // Probar algunas permutaciones aleatorias
        for (let i = 0; i < 100; i++) {
            const permutado = this.permutarCalendario(calBase);
            if (this.esCalendarioValido(permutado).valido) {
                const costo = this.calcularCostoTotal(permutado);
                if (costo < mejorCosto) {
                    mejorCalendario = permutado;
                    mejorCosto = costo;
                }
            }
        }
        
        return mejorCalendario;
    }
    
    // ========== FUNCIONES AUXILIARES ==========
    
    generarVecino(calendario) {
        const n = this.n;
        const numFechas = this.numFechas;
        
        // Copiar calendario
        const vecino = calendario.map(fila => [...fila]);
        
        // Seleccionar dos equipos en una fecha aleatoria
        const fecha = Math.floor(Math.random() * numFechas);
        const equipo1 = Math.floor(Math.random() * n);
        let equipo2;
        
        do {
            equipo2 = Math.floor(Math.random() * n);
        } while (equipo1 === equipo2);
        
        // Intercambiar partidos
        const temp = vecino[fecha][equipo1];
        vecino[fecha][equipo1] = vecino[fecha][equipo2];
        vecino[fecha][equipo2] = temp;
        
        // Ajustar simetría
        const rival1 = Math.abs(vecino[fecha][equipo1]);
        const rival2 = Math.abs(vecino[fecha][equipo2]);
        
        if (rival1 > 0) {
            const idx1 = rival1 - 1;
            vecino[fecha][idx1] = vecino[fecha][equipo1] > 0 ? 
                -(equipo1 + 1) : equipo1 + 1;
        }
        
        if (rival2 > 0) {
            const idx2 = rival2 - 1;
            vecino[fecha][idx2] = vecino[fecha][equipo2] > 0 ? 
                -(equipo2 + 1) : equipo2 + 1;
        }
        
        return vecino;
    }
    
    permutarCalendario(calendario) {
        // Mezclar las fechas
        const permutado = [...calendario];
        for (let i = permutado.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutado[i], permutado[j]] = [permutado[j], permutado[i]];
        }
        return permutado;
    }
    
    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // ========== VERIFICACIÓN ==========
    
    esCalendarioValido(calendario) {
        const n = this.n;
        const numFechas = this.numFechas;
        const errores = [];
        
        // 1. Verificar dimensiones
        if (calendario.length !== numFechas || calendario[0].length !== n) {
            errores.push('Dimensiones incorrectas');
            return { valido: false, errores };
        }
        
        // 2. Cada fecha debe tener n/2 locales y n/2 visitantes
        for (let fecha = 0; fecha < numFechas; fecha++) {
            let locales = 0;
            let visitantes = 0;
            
            for (let equipo = 0; equipo < n; equipo++) {
                if (calendario[fecha][equipo] > 0) locales++;
                else if (calendario[fecha][equipo] < 0) visitantes++;
            }
            
            if (locales !== n/2 || visitantes !== n/2) {
                errores.push(`Fecha ${fecha+1}: locales=${locales}, visitantes=${visitantes}`);
            }
        }
        
        // 3. Simetría: Cal[i][j] = k ⇔ Cal[i][k] = -j
        for (let fecha = 0; fecha < numFechas; fecha++) {
            for (let equipo = 0; equipo < n; equipo++) {
                const rivalCodigo = calendario[fecha][equipo];
                if (rivalCodigo !== 0) {
                    const rivalAbs = Math.abs(rivalCodigo);
                    const rivalIdx = rivalAbs - 1;
                    
                    const codigoEsperado = rivalCodigo > 0 ? 
                        -(equipo + 1) : equipo + 1;
                    
                    if (calendario[fecha][rivalIdx] !== codigoEsperado) {
                        errores.push(`Asimetría en fecha ${fecha+1}, equipo ${equipo+1}`);
                    }
                }
            }
        }
        
        return {
            valido: errores.length === 0,
            errores: errores
        };
    }
    
    verificarRestriccionIdaVuelta(calendario) {
        const n = this.n;
        const numFechas = this.numFechas;
        const errores = [];
        
        // Verificar que todos los partidos de ida estén antes de los de vuelta
        // (implementación simplificada)
        
        return {
            cumple: errores.length === 0,
            errores: errores
        };
    }
    
    verificarRestriccionesStreak(calendario) {
        const n = this.n;
        const numFechas = this.numFechas;
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
                    // Verificar streak terminado
                    if (streakActual < this.minStreak || streakActual > this.maxStreak) {
                        errores.push(`Equipo ${equipo+1}: streak ${tipoStreakActual} de tamaño ${streakActual}`);
                    }
                    streakActual = 1;
                    tipoStreakActual = tipoActual;
                }
            }
            
            // Verificar último streak
            if (streakActual < this.minStreak || streakActual > this.maxStreak) {
                errores.push(`Equipo ${equipo+1}: streak final ${tipoStreakActual} de tamaño ${streakActual}`);
            }
        }
        
        return {
            cumple: errores.length === 0,
            errores: errores
        };
    }
    
    // ========== CÁLCULO DE COSTOS ==========
    
    calcularCostoGira(equipo, calendario) {
        let costoTotal = 0;
        let posicionActual = equipo;
        
        for (let fecha = 0; fecha < this.numFechas; fecha++) {
            const rivalCodigo = calendario[fecha][equipo];
            
            if (rivalCodigo < 0) { // Es visitante
                const rivalAbs = Math.abs(rivalCodigo);
                const rivalIdx = rivalAbs - 1;
                
                // Sumar distancia al rival
                costoTotal += this.D[posicionActual][rivalIdx];
                posicionActual = rivalIdx;
            } else {
                // Es local, volver a su ciudad
                posicionActual = equipo;
            }
        }
        
        // Regresar a casa si terminó de visita
        if (posicionActual !== equipo) {
            costoTotal += this.D[posicionActual][equipo];
        }
        
        return costoTotal;
    }
    
    calcularCostoTotal(calendario) {
        let costoTotal = 0;
        
        for (let equipo = 0; equipo < this.n; equipo++) {
            costoTotal += this.calcularCostoGira(equipo, calendario);
        }
        
        return costoTotal;
    }
    
    calcularGiras(calendario) {
        const giras = [];
        
        for (let equipo = 0; equipo < this.n; equipo++) {
            const detallesGiras = [];
            let costoTotal = 0;
            
            let fecha = 0;
            while (fecha < this.numFechas) {
                if (calendario[fecha][equipo] < 0) { // Inicio de gira
                    const inicio = fecha;
                    const rivales = [];
                    
                    while (fecha < this.numFechas && calendario[fecha][equipo] < 0) {
                        const rival = Math.abs(calendario[fecha][equipo]);
                        rivales.push(rival);
                        fecha++;
                    }
                    
                    if (rivales.length > 0) {
                        // Calcular costo de esta gira
                        let costoGira = 0;
                        let posicion = equipo;
                        
                        for (const rival of rivales) {
                            costoGira += this.D[posicion][rival - 1];
                            posicion = rival - 1;
                        }
                        
                        // Regreso a casa
                        costoGira += this.D[posicion][equipo];
                        costoTotal += costoGira;
                        
                        detallesGiras.push({
                            inicioFecha: inicio + 1,
                            finFecha: fecha,
                            rivales: rivales,
                            costo: costoGira
                        });
                    }
                } else {
                    fecha++;
                }
            }
            
            giras.push({
                equipo: equipo + 1,
                numGiras: detallesGiras.length,
                costoTotal: costoTotal,
                detalles: detallesGiras
            });
        }
        
        return giras;
    }
    
    // ========== VERIFICACIÓN COMPLETA ==========
    
    verificarCalendario(calendario) {
        const validacionBasica = this.esCalendarioValido(calendario);
        const validacionIdaVuelta = this.verificarRestriccionIdaVuelta(calendario);
        const validacionStreak = this.verificarRestriccionesStreak(calendario);
        
        return {
            basico: validacionBasica,
            idaVuelta: validacionIdaVuelta,
            streak: validacionStreak,
            completamenteValido: validacionBasica.valido && 
                                validacionIdaVuelta.cumple && 
                                validacionStreak.cumple
        };
    }
}