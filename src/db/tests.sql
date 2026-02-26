-- 6. TESTS UNITARIOS (SQL)

DO $$
DECLARE
  -- Input de prueba (Relación)
  input_rel jsonb := '{
    "ancho_hueco": 1.37,
    "fruncido": 2.0,
    "num_hojas": 1,
    "precio_tela": 15.50,
    "precio_confeccion": 10.00,
    "precio_instalacion": 25.00,
    "margen": 0.30
  }';
  
  res_rel jsonb;
  
  -- Input de prueba (Cuadrante)
  input_cuad jsonb := '{
    "tipo_medicion": "1_hoja",
    "ancho_hueco": 1.58,
    "altura": 2.50,
    "descuento_altura": 0.10,
    "fruncido": 2.0,
    "num_hojas": 1
  }';
  
  res_cuad jsonb;
  
BEGIN
  ---------------------------------------------------
  -- TEST 1: RELACIÓN
  ---------------------------------------------------
  res_rel := calcular_relacion(input_rel);
  
  -- medida_de_hoja = 1.37 * 2.0 = 2.74
  IF (res_rel->>'medida_de_hoja')::numeric != 2.74 THEN
    RAISE EXCEPTION 'Fallo Relación: medida_de_hoja esperado 2.74, obtenido %', res_rel->>'medida_de_hoja';
  END IF;
  
  -- mts_de_tela = 2.74 * 1 = 2.74
  IF (res_rel->>'mts_de_tela')::numeric != 2.74 THEN
    RAISE EXCEPTION 'Fallo Relación: mts_de_tela esperado 2.74, obtenido %', res_rel->>'mts_de_tela';
  END IF;
  
  -- coste_tela = 2.74 * 15.50 = 42.47
  IF (res_rel->>'coste_tela')::numeric != 42.47 THEN
    RAISE EXCEPTION 'Fallo Relación: coste_tela esperado 42.47, obtenido %', res_rel->>'coste_tela';
  END IF;
  
  -- precio_hueco = 25.00 + 42.47 + (2.74 * 10.00) = 25.00 + 42.47 + 27.40 = 94.87
  IF (res_rel->>'precio_hueco')::numeric != 94.87 THEN
    RAISE EXCEPTION 'Fallo Relación: precio_hueco esperado 94.87, obtenido %', res_rel->>'precio_hueco';
  END IF;
  
  -- beneficio = 94.87 * 0.30 = 28.461 -> Supabase numeric mantiene precisión, verificamos exactitud
  IF (res_rel->>'beneficio')::numeric != 94.87 * 0.30 THEN
    RAISE EXCEPTION 'Fallo Relación: beneficio incorrecto';
  END IF;

  RAISE NOTICE '✅ Test Relación PASADO';

  ---------------------------------------------------
  -- TEST 2: CUADRANTE (1 Hoja)
  ---------------------------------------------------
  res_cuad := calcular_cuadrante(input_cuad);
  
  -- ancho_estandar = FLOOR(1.58 / 0.25) * 0.25 = FLOOR(6.32) * 0.25 = 6 * 0.25 = 1.50
  IF (res_cuad->>'ancho_estandar')::numeric != 1.50 THEN
    RAISE EXCEPTION 'Fallo Cuadrante: ancho_estandar esperado 1.50, obtenido %', res_cuad->>'ancho_estandar';
  END IF;
  
  -- ancho_corte = 1.50 * 2.0 = 3.00
  IF (res_cuad->>'ancho_corte')::numeric != 3.00 THEN
    RAISE EXCEPTION 'Fallo Cuadrante: ancho_corte esperado 3.00, obtenido %', res_cuad->>'ancho_corte';
  END IF;
  
  -- alto_final = 2.50 - 0.10 = 2.40
  -- alto_corte = ROUND(2.40 / 0.03) * 0.03 = ROUND(80) * 0.03 = 80 * 0.03 = 2.40
  IF (res_cuad->>'alto_corte')::numeric != 2.40 THEN
    RAISE EXCEPTION 'Fallo Cuadrante: alto_corte esperado 2.40, obtenido %', res_cuad->>'alto_corte';
  END IF;

  RAISE NOTICE '✅ Test Cuadrante PASADO';

  ---------------------------------------------------
  -- TEST 3: ERROR CONTROLADO
  ---------------------------------------------------
  BEGIN
    PERFORM calcular_cuadrante('{"tipo_medicion": "2_hojas"}'::jsonb);
    RAISE EXCEPTION 'Fallo Error: Debería haber fallado con tipo_medicion incorrecto';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Tipo de medición no soportado%' THEN
       RAISE NOTICE '✅ Test Error Controlado PASADO';
    ELSE
       RAISE EXCEPTION 'Fallo Error: Mensaje inesperado: %', SQLERRM;
    END IF;
  END;

END $$;
