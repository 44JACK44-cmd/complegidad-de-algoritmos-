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
        
        // Lista de partidos pendientes (todos los pares ida-vuelta)
        const partidosPendientes = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) {
                    partidosPendientes.push({
                        local: i,
                        visitante: j,
                        tipo: i < j ? 'ida' : 'vuelta'
                    });
                }
            }
        }
        
        // Ordenar aleatoriamente
        this.mezclarArray(partidosPendientes);
        
        // Programar partidos
        let fecha = 0;
        const equiposUsadosPorFecha = new Set();
        
        while (fecha < this.numFechas && partidosPendientes.length > 0) {
            equiposUsadosPorFecha.clear();
            
            // Intentar asignar partidos para esta fecha
            for (let i = partidosPendientes.length - 1; i >= 0; i--) {
                const partido = partidosPendientes[i];
                
                if (!equiposUsadosPorFecha.has(partido.local) && 
                    !equiposUsadosPorFecha.has(partido.visitante)) {
                    
                    // Asignar partido
                    if (partido.tipo === 'ida') {
                        calendario[fecha][partido.local] = -(partido.visitante + 1);
                        calendario[fecha][partido.visitante] = partido.local + 1;
                    } else {
                        calendario[fecha][partido.local] = partido.visitante + 1;
                        calendario[fecha][partido.visitante] = -(partido.local + 1);
                    }
                    
                    equiposUsadosPorFecha.add(partido.local);
                    equiposUsadosPorFecha.add(partido.visitante);
                    partidosPendientes.splice(i, 1);
                    
                    // Si ya tenemos n/2 partidos, pasar a siguiente fecha
                    if (equiposUsadosPorFecha.size === n) {
                        break;
                    }
                }
            }
            
            fecha++;
        }
        
        // Completar calendario si quedaron fechas vacías
        for (let f = 0; f < this.numFechas; f++) {
            for (let e = 0; e < n; e++) {
                if (calendario[f][e] === 0) {
                    // Encontrar un equipo disponible para jugar
                    for (let r = 0; r < n; r++) {
                        if (r !== e && calendario[f][r] === 0) {
                            // Asignar partido aleatorio
                            const esLocal = Math.random() > 0.5;
                            if (esLocal) {
                                calendario[f][e] = -(r + 1);
                                calendario[f][r] = e + 1;
                            } else {
                                calendario[f][e] = r + 1;
                                calendario[f][r] = -(e + 1);
                            }
                            break;
                        }
                    }
                }
            }
        }
        
        return calendario;
    }
    
    algoritmoBusquedaLocal(calendarioInicial = null, iteraciones = 500) {
        // Usar calendario inicial o generar uno
        let mejorCalendario = calendarioInicial || this.algoritmoConstructivo();
        let mejorCosto = this.calcularCostoTotal(mejorCalendario);
        
        console.log(`Costo inicial: ${mejorCosto}`);
        
        // Optimización por recocido simulado
        let temperatura = 100;
        const factorEnfriamiento = 0.95;
        
        for (let iter = 0; iter < iteraciones; iter++) {
            // Generar vecino
            const vecino = this.generarVecino(mejorCalendario);
            
            // Verificar que sea válido
            const validez = this.esCalendarioValido(vecino);
            if (!validez.valido) continue;
            
            const costoVecino = this.calcularCostoTotal(vecino);
            const delta = costoVecino - mejorCosto;
            
            // Aceptar si es mejor o con probabilidad según temperatura
            if (delta < 0 || Math.random() < Math.exp(-delta / temperatura)) {
                mejorCalendario = vecino;
                mejorCosto = costoVecino;
            }
            
            // Enfriar
            temperatura *= factorEnfriamiento;
            
            // Mostrar progreso
            if (iter % 100 === 0) {
                console.log(`Iteración ${iter}: costo = ${mejorCosto.toFixed(2)}, temp = ${temperatura.toFixed(2)}`);
            }
            
            // Parar si temperatura es muy baja
            if (temperatura < 0.1) break;
        }
        
        console.log(`Costo final: ${mejorCosto.toFixed(2)}`);
        return mejorCalendario;
    }
    
    algoritmoCombinado() {
        // Paso 1: Generar solución constructiva
        const solConstructiva = this.algoritmoConstructivo();
        
        // Paso 2: Mejorar con búsqueda local
        const solMejorada = this.algoritmoBusquedaLocal(solConstructiva, 300);
        
        return solMejorada;
    }
    
    algoritmoFuerzaBruta() {
        // Solo para n ≤ 4
        if (this.n > 4) {
            throw new Error('Fuerza bruta solo disponible para n ≤ 4');
        }
        
        // Generar todas las permutaciones posibles de fechas
        const solBase = this.algoritmoConstructivo();
        let mejorCalendario = solBase;
        let mejorCosto = this.calcularCostoTotal(solBase);
        
        // Función para permutar un calendario
        const permutarCalendario = (calendario) => {
            const permutado = JSON.parse(JSON.stringify(calendario));
            
            // Intercambiar algunas fechas aleatoriamente
            for (let i = 0; i < 10; i++) {
                const f1 = Math.floor(Math.random() * this.numFechas);
                const f2 = Math.floor(Math.random() * this.numFechas);
                [permutado[f1], permutado[f2]] = [permutado[f2], permutado[f1]];
            }
            
            return permutado;
        };
        
        // Probar múltiples permutaciones
        for (let i = 0; i < 100; i++) {
            const permutado = permutarCalendario(solBase);
            const validez = this.esCalendarioValido(permutado);
            
            if (validez.valido) {
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
        const vecino = JSON.parse(JSON.stringify(calendario));
        const n = this.n;
        
        // Elegir tipo de operación
        const operacion = Math.floor(Math.random() * 3);
        
        switch(operacion) {
            case 0: // Intercambiar dos equipos en una fecha
                this.intercambiarEquiposEnFecha(vecino);
                break;
                
            case 1: // Intercambiar dos fechas
                this.intercambiarFechas(vecino);
                break;
                
            case 2: // Invertir localía de un partido
                this.invertirLocalia(vecino);
                break;
        }
        
        return vecino;
    }
    
    intercambiarEquiposEnFecha(calendario) {
        const fecha = Math.floor(Math.random() * this.numFechas);
        let equipo1, equipo2;
        
        do {
            equipo1 = Math.floor(Math.random() * this.n);
            equipo2 = Math.floor(Math.random() * this.n);
        } while (equipo1 === equipo2);
        
        // Intercambiar los valores
        const temp = calendario[fecha][equipo1];
        calendario[fecha][equipo1] = calendario[fecha][equipo2];
        calendario[fecha][equipo2] = temp;
        
        // Corregir simetría
        this.corregirSimetriaFecha(calendario, fecha);
    }
    
    intercambiarFechas(calendario) {
        const fecha1 = Math.floor(Math.random() * this.numFechas);
        let fecha2;
        
        do {
            fecha2 = Math.floor(Math.random() * this.numFechas);
        } while (fecha1 === fecha2);
        
        [calendario[fecha1], calendario[fecha2]] = [calendario[fecha2], calendario[fecha1]];
    }
    
    invertirLocalia(calendario) {
        const fecha = Math.floor(Math.random() * this.numFechas);
        let equipo;
        
        do {
            equipo = Math.floor(Math.random() * this.n);
        } while (calendario[fecha][equipo] === 0);
        
        const rivalCodigo = calendario[fecha][equipo];
        const rivalIdx = Math.abs(rivalCodigo) - 1;
        
        // Invertir signos
        calendario[fecha][equipo] = -rivalCodigo;
        calendario[fecha][rivalIdx] = -calendario[fecha][rivalIdx];
    }
    
    corregirSimetriaFecha(calendario, fecha) {
        const n = this.n;
        
        for (let equipo = 0; equipo < n; equipo++) {
            const valor = calendario[fecha][equipo];
            if (valor !== 0) {
                const rival = Math.abs(valor) - 1;
                const signoCorrecto = valor > 0 ? -(equipo + 1) : equipo + 1;
                calendario[fecha][rival] = signoCorrecto;
            }
        }
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
            return { valido: false, errores: ['Dimensiones incorrectas'] };
        }
        
        // 2. Verificar cada fecha
        for (let fecha = 0; fecha < numFechas; fecha++) {
            let locales = 0;
            let visitantes = 0;
            const equiposJugando = new Set();
            
            for (let equipo = 0; equipo < n; equipo++) {
                const valor = calendario[fecha][equipo];
                
                // Verificar valor no sea 0
                if (valor === 0) {
                    errores.push(`Fecha ${fecha+1}, equipo ${equipo+1}: valor 0`);
                    continue;
                }
                
                // Verificar rango
                if (Math.abs(valor) < 1 || Math.abs(valor) > n) {
                    errores.push(`Fecha ${fecha+1}, equipo ${equipo+1}: valor ${valor} fuera de rango`);
                }
                
                // Contar locales/visitantes
                if (valor > 0) {
                    locales++;
                    equiposJugando.add(equipo);
                    equiposJugando.add(Math.abs(valor) - 1);
                } else {
                    visitantes++;
                    equiposJugando.add(equipo);
                    equiposJugando.add(Math.abs(valor) - 1);
                }
            }
            
            // Verificar conteos
            if (locales !== n/2) {
                errores.push(`Fecha ${fecha+1}: ${locales} locales, esperados ${n/2}`);
            }
            if (visitantes !== n/2) {
                errores.push(`Fecha ${fecha+1}: ${visitantes} visitantes, esperados ${n/2}`);
            }
            if (equiposJugando.size !== n) {
                errores.push(`Fecha ${fecha+1}: no todos los equipos juegan`);
            }
        }
        
        // 3. Verificar simetría
        for (let fecha = 0; fecha < numFechas; fecha++) {
            for (let equipo = 0; equipo < n; equipo++) {
                const rivalCodigo = calendario[fecha][equipo];
                if (rivalCodigo !== 0) {
                    const rivalAbs = Math.abs(rivalCodigo);
                    const rivalIdx = rivalAbs - 1;
                    const codigoEsperado = rivalCodigo > 0 ? -(equipo + 1) : equipo + 1;
                    
                    if (calendario[fecha][rivalIdx] !== codigoEsperado) {
                        errores.push(`Fecha ${fecha+1}: asimetría entre equipo ${equipo+1} y ${rivalAbs}`);
                    }
                }
            }
        }
        
        return {
            valido: errores.length === 0,
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
                        errores.push(`Equipo ${equipo+1}: streak ${tipoStreakActual} de tamaño ${streakActual} fuera de rango [${this.minStreak}, ${this.maxStreak}]`);
                    }
                    streakActual = 1;
                    tipoStreakActual = tipoActual;
                }
            }
            
            // Verificar último streak
            if (streakActual < this.minStreak || streakActual > this.maxStreak) {
                errores.push(`Equipo ${equipo+1}: streak final ${tipoStreakActual} de tamaño ${streakActual} fuera de rango [${this.minStreak}, ${this.maxStreak}]`);
            }
        }
        
        return {
            cumple: errores.length === 0,
            errores: errores
        };
    }
    
    verificarRepeticionesConsecutivas(calendario) {
        const n = this.n;
        const numFechas = this.numFechas;
        const errores = [];
        
        for (let equipo = 0; equipo < n; equipo++) {
            for (let fecha = 1; fecha < numFechas; fecha++) {
                const rivalActual = Math.abs(calendario[fecha][equipo]);
                const rivalAnterior = Math.abs(calendario[fecha-1][equipo]);
                
                if (rivalActual === rivalAnterior) {
                    errores.push(`Equipo ${equipo+1}: repite rival ${rivalActual} en fechas ${fecha} y ${fecha+1}`);
                }
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
                const rivalIdx = Math.abs(rivalCodigo) - 1;
                costoTotal += this.D[posicionActual][rivalIdx];
                posicionActual = rivalIdx;
            } else if (rivalCodigo > 0) {
                // Es local, regresar a casa si estaba de visita
                if (posicionActual !== equipo) {
                    costoTotal += this.D[posicionActual][equipo];
                    posicionActual = equipo;
                }
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
        const validacionStreak = this.verificarRestriccionesStreak(calendario);
        const validacionRepeticiones = this.verificarRepeticionesConsecutivas(calendario);
        
        return {
            basico: validacionBasica,
            streak: validacionStreak,
            repeticiones: validacionRepeticiones,
            completamenteValido: validacionBasica.valido && 
                                validacionStreak.cumple && 
                                validacionRepeticiones.cumple
        };
    }
}