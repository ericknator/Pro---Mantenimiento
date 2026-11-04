
/**
 * Utilidades de calendario para alertas preventivas.
 *
 * Regla acordada:
 * - Domingo: no laborable.
 * - Sábado: laborable.
 * - Feriados: definidos mediante un calendario externo.
 *
 * Las fechas de feriados deben utilizar YYYY-MM-DD.
 */

export function esDiaHabil(
    fecha: Date,
    feriados: ReadonlySet<string> = new Set()
): boolean {
    if (fecha.getDay() === 0) {
        return false;
    }

    return !feriados.has(formatearFechaLocal(fecha));
}

export function restarDiasHabiles(
    fecha: Date,
    cantidad: number,
    feriados: ReadonlySet<string> = new Set()
): Date {
    if (!Number.isInteger(cantidad) || cantidad < 0) {
        throw new Error('La cantidad de días hábiles debe ser un entero no negativo.');
    }

    const resultado = new Date(fecha.getTime());
    let diasDescontados = 0;

    while (diasDescontados < cantidad) {
        resultado.setDate(resultado.getDate() - 1);

        if (esDiaHabil(resultado, feriados)) {
            diasDescontados++;
        }
    }

    return resultado;
}

export function formatearFechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
}
