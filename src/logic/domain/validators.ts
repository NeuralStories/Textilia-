import { z } from 'zod';

// Constantes globales por defecto basadas en las especificaciones del Excel
export const ConstantesSchema = z.object({
  anadido_cierre: z.number().nonnegative().default(0.06),
  descuento_altura: z.number().nonnegative().default(0.05),
  restar_cm_riel: z.number().nonnegative().default(0.01),
  ancho_tela_caidas: z.number().positive().default(1.4),
});

export type Constantes = z.infer<typeof ConstantesSchema>;

// Input base compartido entre Medicion y Caidas
export const InputSchema = z.object({
  num_hojas: z.union([z.literal(1), z.literal(2)]), // Solo se permiten 1 o 2 hojas según Excel
  ancho: z.number().nonnegative(),
  alto: z.number().nonnegative(),
  fruncido: z.number().nonnegative(),
  bajo_y_cresta: z.number().nonnegative(),
  precio_tela: z.number().nonnegative(),
  precio_confeccion: z.number().nonnegative(),
  precio_instalacion: z.number().nonnegative(),
  margen: z.number().nonnegative(),
});

export type Input = z.infer<typeof InputSchema>;

// Opcional: Instancia de constantes por defecto para facilitar uso
export const constantesPorDefecto = ConstantesSchema.parse({});
