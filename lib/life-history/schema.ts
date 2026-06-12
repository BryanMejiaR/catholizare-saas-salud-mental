export type LifeHistoryField =
  | {
      id: string;
      label: string;
      type: "text" | "textarea" | "date" | "number" | "email" | "tel";
    }
  | {
      id: string;
      label: string;
      type: "checkbox_group";
      options: string[];
      otherFieldId?: string;
      otherLabel?: string;
    };

export type LifeHistorySection = {
  id: string;
  title: string;
  fields: LifeHistoryField[];
};

export const LIFE_HISTORY_SECTIONS: LifeHistorySection[] = [
  {
    id: "informacion_personal",
    title: "I. Informacion personal",
    fields: [
      { id: "fecha", label: "Fecha:", type: "date" },
      { id: "nombre_completo", label: "NOMBRE COMPLETO:", type: "text" },
      { id: "edad", label: "EDAD:", type: "number" },
      { id: "lugar_fecha_nacimiento", label: "LUGAR Y FECHA DE NACIMIENTO:", type: "text" },
      { id: "sexo", label: "SEXO:", type: "text" },
      { id: "estado_civil", label: "ESTADO CIVIL:", type: "text" },
      { id: "numero_hijos", label: "No. HIJOS:", type: "number" },
      { id: "religion", label: "RELIGIÓN:", type: "text" },
      { id: "escolaridad", label: "ESCOLARIDAD:", type: "text" },
      { id: "ocupacion_actual", label: "OCUPACIÓN ACTUAL:", type: "text" },
      { id: "domicilio", label: "DOMICILIO:", type: "text" },
      { id: "celular", label: "CELULAR:", type: "tel" },
      { id: "correo", label: "CORREO:", type: "email" },
      {
        id: "contactos_emergencia",
        label: "CONTACTOS DE EMERGENCIA (Anota nombre, parentesco y celular):",
        type: "textarea"
      },
      {
        id: "como_se_entero",
        label: "¿CÓMO SE ENTERO DEL SERVICIO?",
        type: "checkbox_group",
        options: ["AMIGOS/FAMILIA", "PAGINA WEB", "REFERIDO", "FACEBOOK", "INSTAGRAM", "OTROS"],
        otherFieldId: "como_se_entero_detalle",
        otherLabel: "¿Por quién? / ¿Cuáles?"
      },
      {
        id: "consumo_sustancias",
        label: "CONSUMO DE SUSTANCIAS   (Si es necesesario, puedes señalar más de una)",
        type: "checkbox_group",
        options: [
          "ALCOHOL",
          "VAPEADOR",
          "MARIHUANA",
          "HONGOS",
          "NICOTINA",
          "COCAÍNA",
          "LSD",
          "CRISTAL",
          "CAFEÍNA",
          "OTROS:"
        ],
        otherFieldId: "consumo_sustancias_cuales",
        otherLabel: "¿CUÁLES?"
      },
      {
        id: "consumo_sustancias_frecuencia",
        label: "Describa ¿cúando y con qué frecuencia consume las sustancias que señalo anteriormente?",
        type: "textarea"
      }
    ]
  },
  {
    id: "area_medica",
    title: "II 1 Área médica",
    fields: [
      {
        id: "enfermedad_importante",
        label: "Actualmente, ¿tienes alguna enfermedad o padecimiento importante? ¿Cuáles?",
        type: "textarea"
      },
      { id: "medicamento", label: "¿Consumes algún tipo de medicamento? ¿Cuáles?", type: "textarea" },
      {
        id: "antecedentes_familiares_salud_mental",
        label: "¿Hay antecedentes familiares de depresión, ansiedad, suicidio o trastornos mentales?:",
        type: "textarea"
      },
      {
        id: "trastorno_alimentacion",
        label: "¿Padeces o has padecido algún Trastorno de Alimentación? Descríbelo:",
        type: "textarea"
      },
      { id: "problemas_dormir", label: "¿Tienes o has tenido problemas para dormir? Explícalo:", type: "textarea" },
      {
        id: "familiar_salud_mental",
        label: "¿Tienes algun familiar con problemas de Salud Mental? Descríbelo:",
        type: "textarea"
      },
      {
        id: "antecedentes_enfermedades_cronicas",
        label:
          "¿Cuáles son tus antecedentes familiares en relación con enfermedades crónicas? (por ejemplo: diabetes, hipertensión, cáncer, otras) Descríbelo:",
        type: "textarea"
      },
      { id: "violencia_actual", label: "¿Te encuentras viviendo situaciones de violencia? Descríbelo:", type: "textarea" },
      { id: "deseos_morir", label: "¿Has tenido o tiene deseos de morir?¿Cuándo?", type: "textarea" },
      {
        id: "psicoterapia_previa",
        label: "¿Ha estado antes en psicoterapia? ¿Qué tipo y por cuánto tiempo?:",
        type: "textarea"
      },
      {
        id: "diagnosticos_previos",
        label: "¿Ha recibido diagnósticos psicológicos o psiquiátricos?:",
        type: "textarea"
      },
      { id: "con_quien_vives_actualmente_area_medica", label: "Actualmente ¿Con quién vives?", type: "textarea" },
      {
        id: "sensaciones_actuales",
        label: "Del siguiente listado que sensación presentas actualmente:",
        type: "checkbox_group",
        options: [
          "Tensión",
          "Taquicardia",
          "Fracaso",
          "Inseguridad",
          "Ansiedad",
          "Presión",
          "Celos",
          "Nerviosismo",
          "Flojera",
          "Culpa",
          "Miedo",
          "Problemas de Pareja",
          "Sudor",
          "Irritabilidad",
          "Sueño",
          "Dificultades Sexuales",
          "Mareo",
          "Cansancio",
          "Desconfianza",
          "Presión en el pecho",
          "Otros"
        ],
        otherFieldId: "sensaciones_actuales_otros",
        otherLabel: "Describalos aquí:"
      },
      {
        id: "sensaciones_frecuencia",
        label: "Describa ¿en qué momento y con qué frecuencia tiene las sensaciónes que señalo anteriormente?",
        type: "textarea"
      }
    ]
  },
  {
    id: "contexto_actual",
    title: "II. 1. Datos de Identificación y Contexto Actual",
    fields: [
      { id: "con_quien_vive", label: "¿Con quién vive actualmente? (personas, relación, edades):", type: "textarea" },
      { id: "dia_tipico", label: "¿Cómo describiría su día a día típico?:", type: "textarea" },
      { id: "actividades_agradables", label: "¿Qué actividades le resultan agradables o satisfactorias?:", type: "textarea" },
      {
        id: "energia_motivacion",
        label: "¿Cómo describiría su nivel actual de energía y motivación?:",
        type: "textarea"
      },
      { id: "cambio_reciente", label: "¿Hay algo importante que haya cambiado recientemente en su vida?:", type: "textarea" }
    ]
  },
  {
    id: "motivo_consulta",
    title: "III. 2. Motivo de Consulta y Demanda Terapéutica",
    fields: [
      { id: "que_trajo_consulta", label: "¿Qué lo trajo a consulta en este momento?:", type: "textarea" },
      {
        id: "resumen_malestar",
        label: "Si tuviera que resumir su malestar en una frase, ¿qué diría?:",
        type: "textarea"
      },
      { id: "desde_cuando", label: "¿Desde cuándo siente estos síntomas o dificultades?:", type: "textarea" },
      {
        id: "intentos_previos",
        label: "¿Qué cosas ha intentado hacer para sentirse mejor? ¿Qué ha funcionado o no?:",
        type: "textarea"
      },
      {
        id: "expectativa_terapia",
        label:
          "¿Qué espera lograr con la terapia, qué sería diferente? Sea especifico, conductas, sentimientos, relaciones:",
        type: "textarea"
      }
    ]
  },
  {
    id: "problema_actual",
    title: "IV. 3. Descripción Detallada del Problema Actual",
    fields: [
      {
        id: "estado_animo",
        label: "¿Cómo describiría su estado de ánimo últimamente (especifique el tiempo en que se ha sentido así)?:",
        type: "textarea"
      },
      { id: "pensamientos_malestar", label: "¿Qué pensamientos suele tener cuando se siente así?:", type: "textarea" },
      { id: "comportamientos_malestar", label: "¿Qué comportamientos nota en usted cuando se siente mal?:", type: "textarea" },
      { id: "reacciones_fisicas", label: "¿Qué reacciones físicas acompañan esos momentos?:", type: "textarea" },
      {
        id: "activadores_malestar",
        label: "¿Qué situaciones o personas tienden a activar su malestar con mayor frecuencia?:",
        type: "textarea"
      },
      { id: "antes_despues", label: "¿Qué suele pasar justo antes y después de sentirse así?:", type: "textarea" },
      {
        id: "consecuencias_problema",
        label: "¿Qué consecuencias tiene este problema en su trabajo, familia, pareja, amigos o espiritualidad?:",
        type: "textarea"
      },
      {
        id: "autopercepcion",
        label: "¿Cómo afecta su autopercepción o su sentido de valor personal?:",
        type: "textarea"
      },
      {
        id: "que_pensarian_otros",
        label: "¿Qué cree que otras personas pensarían si supieran lo que está viviendo?:",
        type: "textarea"
      }
    ]
  },
  {
    id: "historia_personal",
    title: "VII. 6. Historia persona, familiar y social",
    fields: [
      {
        id: "infancia",
        label: "¿Cómo fue su infancia? ¿Qué recuerda de la relación con sus padres o cuidadores?",
        type: "textarea"
      },
      {
        id: "violencia_abuso_negligencia",
        label: "¿Hubo situaciones de violencia, abuso, negligencia o excesiva exigencia?",
        type: "textarea"
      },
      {
        id: "expresar_emociones",
        label: "¿Cómo aprendió a expresar o controlar sus emociones cuando era niño/a?",
        type: "textarea"
      },
      {
        id: "relaciones_escuela",
        label: "¿Cómo fueron sus relaciones con amigos y figuras de autoridad durante la escuela?",
        type: "textarea"
      },
      { id: "logro_fracaso_amor", label: "¿Qué papel jugaban el logro, el fracaso o el amor en su familia?", type: "textarea" },
      {
        id: "momentos_formativos",
        label: "¿Qué momentos de su vida considera más formativos o difíciles?",
        type: "textarea"
      },
      {
        id: "fuentes_apoyo",
        label: "¿Cuáles han sido sus principales fuentes de apoyo o consuelo en distintas etapas?",
        type: "textarea"
      },
      { id: "fe_espiritualidad", label: "¿Qué lugar ocupa la fe o la espiritualidad en su vida hoy?", type: "textarea" }
    ]
  },
  {
    id: "funcionamiento_actual",
    title: "VIII. 7. Funcionamiento actual",
    fields: [
      {
        id: "relaciones_actuales",
        label: "¿Cómo describiría sus relaciones actuales (pareja, familia, amigos)?",
        type: "textarea"
      },
      { id: "diferente_relaciones", label: "¿Qué le gustaría que fuera diferente en ellas?", type: "textarea" },
      { id: "manejo_conflictos", label: "¿Cómo maneja los conflictos o el estrés?", type: "textarea" },
      {
        id: "estrategias_ansiedad",
        label: "¿Qué estrategias usa para sentirse mejor o controlar la ansiedad?",
        type: "textarea"
      },
      { id: "satisfaccion_vida", label: "¿Qué tan satisfecho se siente con su vida en general?", type: "textarea" }
    ]
  },
  {
    id: "factores_precipitantes",
    title: "XI 8. Factores precipitantes y mantenedores",
    fields: [
      {
        id: "acontecimiento_previo",
        label: "¿Recuerda algún acontecimiento o cambio que haya precedido el inicio o empeoramiento del problema?",
        type: "textarea"
      },
      { id: "mantiene_malestar", label: "¿Qué cosas hacen que el malestar se mantenga o se reactive?", type: "textarea" },
      { id: "si_no_hiciera_nada", label: "¿Qué cree que pasaría si no hiciera nada respecto a esto?", type: "textarea" },
      {
        id: "mantiene_patrones",
        label: "¿Qué cree que mantiene estos patrones a pesar de querer cambiarlos?",
        type: "textarea"
      }
    ]
  },
  {
    id: "creencias_centrales",
    title: "X 9. Crencias centrales y esquemas personales",
    fields: [
      { id: "cuando_algo_sale_mal", label: "Cuando algo sale mal, ¿qué suele pensar de usted mismo?", type: "textarea" },
      {
        id: "yo_soy",
        label: "Si tuviera que completar la frase \"Yo soy una persona que…\" ¿qué pondría?",
        type: "textarea"
      },
      {
        id: "teme_descubran",
        label: "¿Qué cosas teme profundamente que los demás descubran de usted?",
        type: "textarea"
      },
      {
        id: "ser_querido_aceptado",
        label: "¿Qué cree que tiene que hacer para ser querido, aceptado o valorado?",
        type: "textarea"
      },
      { id: "si_no_cumple", label: "¿Qué teme que suceda si no cumple con esas exigencias?", type: "textarea" },
      {
        id: "historia_repetida",
        label: "¿Qué partes de su historia parecen repetirse en su vida actual?",
        type: "textarea"
      }
    ]
  },
  {
    id: "fortalezas_recursos",
    title: "XI 10. Fortalezas y recursos",
    fields: [
      {
        id: "cualidades_habilidades",
        label: "¿Qué cualidades o habilidades personales le han ayudado a superar dificultades antes?",
        type: "textarea"
      },
      {
        id: "personas_grupos_apoyo",
        label: "¿Qué personas, grupos o actividades le dan apoyo o sentido?",
        type: "textarea"
      },
      {
        id: "valores_creencias",
        label: "¿Qué valores o creencias personales considera más importantes?",
        type: "textarea"
      },
      {
        id: "esperanza_alivio",
        label: "¿Qué cosas pequeñas le dan esperanza o alivio actualmente?",
        type: "textarea"
      }
    ]
  },
  {
    id: "objetivos_terapeuticos",
    title: "XII 11. Objetivos terapéuticos (Modelo Padesky)",
    fields: [
      { id: "sentirse_mejor", label: "¿Qué significa para usted \"sentirse mejor\"?", type: "textarea" },
      {
        id: "senales_mejora",
        label: "¿Qué cosas concretas serían señales de que está mejorando?",
        type: "textarea"
      },
      {
        id: "cambios_lograr",
        label: "¿Qué cambios de comportamiento o pensamientos le gustaría lograr?",
        type: "textarea"
      },
      { id: "ventajas_desventajas", label: "¿Qué ventajas y desventajas percibe en cambiar?", type: "textarea" },
      {
        id: "recursos_para_lograrlo",
        label: "¿Qué recursos internos o externos podrían ayudarle a lograrlo?",
        type: "textarea"
      }
    ]
  },
  {
    id: "planificacion_tratamiento",
    title: "XIII 13. Planificación del tratamiento",
    fields: [
      {
        id: "obstaculos_asistencia",
        label:
          "¿Qué obstáculos prácticos podrían dificultar su asistencia a terapia? (tiempo, dinero, distancia al consultorio, horarios laborales, cuidado de dependientes, transporte, etc.)",
        type: "textarea"
      },
      {
        id: "como_se_siente_terapeuta",
        label:
          "¿Cómo se siente hablando conmigo sobre estos temas? ¿Hay algo que necesite de mí como terapeuta para sentirse más cómodo/a?",
        type: "textarea"
      },
      {
        id: "preferencia_intervenciones",
        label:
          "¿Tiene alguna preferencia sobre el tipo de intervenciones o técnicas terapéuticas? (por ejemplo: ejercicios prácticos, conversación reflexiva, tareas escritas, etc.)",
        type: "textarea"
      },
      { id: "dia_horario_citas", label: "72. ¿Qué día y horario funcionaría mejor para sus citas?", type: "textarea" }
    ]
  }
];

export type LifeHistoryAnswers = Record<string, string | string[]>;
