import { ConstantesSchema, InputSchema, Input, Constantes } from './validators';

// Tipos de retorno
export interface ResultadoCalculo {
    original: Input;

    // Relación
    medida_hoja: number;
    coste_tela: number;
    coste_confeccion: number;
    precio_hueco: number;
    beneficio: number;
    total: number;

    // Corte (Para Cuadrante)
    ancho_est: number;
    ancho_corte: number;
    alto_final: number;
    alto_corte: number;

    // Rieles
    medida_riel: number;
    soportes: number;

    // Específico de caídas (si aplica)
    num_caidas?: number;
    mts_tela?: number;
}

export class CalculadoraTextilia {
    private constantes: Constantes;

    constructor(constantesInput: Partial<Constantes> = {}) {
        // Valida y aplica defaults
        this.constantes = ConstantesSchema.parse(constantesInput);
    }

    // Helpers estáticos replicando Excel
    public static ROUNDUP = (val: number, dec: number = 4): number => {
        const factor = Math.pow(10, dec);
        return Math.ceil(val * factor) / factor;
    };

    public static ROUND = (val: number, dec: number = 0): number => {
        const factor = Math.pow(10, dec);
        return Math.round(val * factor) / factor;
    };

    /**
     * Cálculo estándar por medición (1 o 2 hojas)
     */
    public porMedicion(inputPuro: unknown): ResultadoCalculo {
        const input = InputSchema.parse(inputPuro);
        const c = this.constantes;

        const {
            num_hojas, ancho, alto, fruncido, precio_tela,
            precio_confeccion, precio_instalacion, margen
        } = input;

        // --- RELACIÓN ---
        const medida_hoja = ancho * fruncido;
        const coste_tela = CalculadoraTextilia.ROUNDUP(medida_hoja * precio_tela, 2);
        const coste_confeccion = CalculadoraTextilia.ROUNDUP(medida_hoja * precio_confeccion, 2);

        const precio_hueco = coste_tela + coste_confeccion + precio_instalacion;
        const beneficio = CalculadoraTextilia.ROUNDUP(precio_hueco * margen, 2);
        const total = precio_hueco + beneficio;

        // --- CONFECCIÓN (Uso interno/informativo) ---
        // 1 hoja = medida_hoja + anadido_cierre
        // 2 hojas = (medida_hoja / 2) + anadido_cierre
        const medida_confeccion = num_hojas === 1
            ? medida_hoja + c.anadido_cierre
            : (medida_hoja / 2) + c.anadido_cierre;

        // --- CORTE ---
        const ancho_est = Math.floor(ancho / 0.25) * 0.25;
        const ancho_corte = num_hojas === 1
            ? ancho_est * fruncido
            : (ancho_est / 2) * fruncido;

        const alto_final = alto - c.descuento_altura;
        const alto_corte = CalculadoraTextilia.ROUND(alto_final / 0.03, 0) * 0.03;

        // --- RIELES ---
        const medida_riel = ancho - c.restar_cm_riel;
        const soportes = CalculadoraTextilia.ROUNDUP(ancho / 0.5, 0);

        return {
            original: input,
            medida_hoja,
            coste_tela,
            coste_confeccion,
            precio_hueco,
            beneficio,
            total,
            ancho_est,
            ancho_corte,
            alto_final,
            alto_corte,
            medida_riel,
            soportes
        };
    }

    /**
     * Cálculo específico para caídas
     */
    public porCaidas(inputPuro: unknown): ResultadoCalculo {
        const input = InputSchema.parse(inputPuro);
        const c = this.constantes;

        const {
            ancho, alto, fruncido, bajo_y_cresta, precio_tela,
            precio_confeccion, precio_instalacion, margen
        } = input;

        // --- CAÍDAS RELACIÓN ---
        const ancho_hueco = ancho * fruncido;
        const num_caidas = CalculadoraTextilia.ROUNDUP(ancho_hueco / c.ancho_tela_caidas, 4);
        const mts_tela = (alto + bajo_y_cresta) * CalculadoraTextilia.ROUND(num_caidas, 0);

        // En caídas, el coste de tela y confección se basa en mts_tela, no en medida_hoja
        const coste_tela = CalculadoraTextilia.ROUNDUP(mts_tela * precio_tela, 2);
        const coste_confeccion = CalculadoraTextilia.ROUNDUP(mts_tela * precio_confeccion, 2);

        const precio_hueco = coste_tela + coste_confeccion + precio_instalacion;
        const beneficio = CalculadoraTextilia.ROUNDUP(precio_hueco * margen, 2);
        const total = precio_hueco + beneficio;

        // --- CORTE (Adaptado) ---
        const ancho_est = Math.floor(ancho / 0.25) * 0.25;
        const ancho_corte = ancho_est * fruncido; // Simplificado para caídas, ajusta si hay reglas específicas

        const alto_final = alto - c.descuento_altura;
        const alto_corte = CalculadoraTextilia.ROUND(alto_final / 0.03, 0) * 0.03;

        // --- RIELES ---
        const medida_riel = ancho - c.restar_cm_riel;
        const soportes = CalculadoraTextilia.ROUNDUP(ancho / 0.5, 0);

        return {
            original: input,
            medida_hoja: ancho_hueco, // En caídas, medida_hoja suele equivaler a ancho_hueco total
            coste_tela,
            coste_confeccion,
            precio_hueco,
            beneficio,
            total,
            ancho_est,
            ancho_corte,
            alto_final,
            alto_corte,
            medida_riel,
            soportes,
            num_caidas,
            mts_tela
        };
    }
}
