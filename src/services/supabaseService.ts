import { createClient } from '@supabase/supabase-js';
import { Input } from '../logic/domain/validators';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Servicio centralizado para interactuar con Supabase.
 * Aisla la base de datos de los cálculos.
 */
export const supabaseService = {

    // --- MEDICIÓN ---
    /**
     * Guarda inputs puros de medición. Los cálculos se harán en cliente al leer.
     */
    async guardarMedicion(obraId: string, inputs: Input[]) {
        try {
            // En una app real, adaptaríamos 'inputs' al schema exacto de la DB (snake_case, ids, etc.)
            // Aquí simulamos la inserción de data pura.
            const authUserId = (await supabase.auth.getUser()).data.user?.id;

            const payload = inputs.map(input => ({
                obra_id: obraId,
                user_id: authUserId,
                // Guardamos solo los inputs, no los resultados (coste, beneficio, etc)
                num_hojas: input.num_hojas,
                ancho: input.ancho,
                alto: input.alto,
                fruncido: input.fruncido,
                bajo_y_cresta: input.bajo_y_cresta,
                precio_tela: input.precio_tela,
                precio_confeccion: input.precio_confeccion,
                precio_instalacion: input.precio_instalacion,
                margen: input.margen
            }));

            const { data, error } = await supabase
                .from('mediciones')
                .insert(payload)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Error en guardarMedicion:", err);
            return { success: false, error: err };
        }
    },

    async obtenerMediciones(obraId: string) {
        try {
            const { data, error } = await supabase
                .from('mediciones')
                .select('*')
                .eq('obra_id', obraId);

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Error en obtenerMediciones:", err);
            return { success: false, error: err };
        }
    },

    // --- CAÍDAS ---
    async guardarCaidas(obraId: string, inputs: Input[]) {
        try {
            const authUserId = (await supabase.auth.getUser()).data.user?.id;

            const payload = inputs.map(input => ({
                obra_id: obraId,
                user_id: authUserId,
                num_hojas: input.num_hojas,
                ancho: input.ancho,
                alto: input.alto,
                fruncido: input.fruncido,
                bajo_y_cresta: input.bajo_y_cresta,
                precio_tela: input.precio_tela,
                precio_confeccion: input.precio_confeccion,
                precio_instalacion: input.precio_instalacion,
                margen: input.margen
            }));

            // Supongamos que hay una tabla específica, si no, se unifica con un flag
            const { data, error } = await supabase
                .from('caidas')
                .insert(payload)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Error en guardarCaidas:", err);
            return { success: false, error: err };
        }
    },

    async obtenerCaidas(obraId: string) {
        try {
            const { data, error } = await supabase
                .from('caidas')
                .select('*')
                .eq('obra_id', obraId);

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Error en obtenerCaidas:", err);
            return { success: false, error: err };
        }
    },

    // --- OBRAS (Helpers generales) ---
    async listarObras() {
        try {
            const { data, error } = await supabase
                .from('obras')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Error en listarObras:", err);
            return { success: false, error: err };
        }
    },

    async obtenerObra(obraId: string) {
        try {
            const { data, error } = await supabase
                .from('obras')
                .select('*')
                .eq('id', obraId)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Error en obtenerObra:", err);
            return { success: false, error: err };
        }
    }
};
