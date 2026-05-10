import { Rutina } from "src/modules/rutinas/entities/rutina.entity";

export const rutinasMock: any[] = [
  {
    userId: "u1",
    name: "Rutina básica de mañana",
    description: "Rutina sencilla de 3 pasos para comenzar el día con la piel limpia e hidratada.",
    publishedAt: "2026-03-14T09:20:00.000Z",
    type: "am",
    skinType: "normal",
    upvotes: ["u2", "u3", "u5"],
    downvotes: ["u6"],
    views: 1240,
    steps: [
      { id: "r1s1", name: "Limpieza suave", order: 0, productId: "12", notes: "Usar con agua tibia, masajear en círculos durante 30 segundos." },
      { id: "r1s2", name: "Hidratación express", order: 1, productId: "5", notes: "Aplicar una cantidad del tamaño de un guisante sobre el rostro limpio." },
      { id: "r1s3", name: "Sérum de refuerzo", order: 2, productId: "15", notes: "Dar toquecitos suaves para favorecer la absorción." }
    ],
    deleted: false
  },
  {
    userId: "u2",
    name: "Rutina antiaging de noche",
    description: "Rutina nocturna enfocada en regeneración celular y reducción de líneas finas.",
    publishedAt: "2026-03-12T20:45:00.000Z",
    type: "pm",
    skinType: "seca",
    upvotes: ["u1", "u4"],
    downvotes: [],
    views: 2156,
    steps: [
      { id: "r2s1", name: "Limpieza profunda", order: 0, productId: "2", notes: "Masajear sobre piel húmeda para activar el ácido salicílico." },
      { id: "r2s2", name: "Retinol", order: 1, productId: "9", notes: "Aplicar solo 2-3 noches por semana al inicio para acondicionar la piel." },
      { id: "r2s3", name: "Crema barrera", order: 2, productId: "1", notes: "Cerrar la rutina con una capa generosa para hidratar durante la noche." }
    ],
    deleted: false
  },
  {
    userId: "u4",
    name: "Rutina para piel grasa AM",
    description: "Controla el exceso de sebo y mantiene los poros limpios durante el día.",
    publishedAt: "2026-03-10T07:35:00.000Z",
    type: "am",
    skinType: "grasa",
    upvotes: ["u1", "u6", "u5"],
    downvotes: ["u2"],
    views: 1875,
    steps: [
      { id: "r3s1", name: "Limpieza purificante", order: 0, productId: "11", notes: "Aclarar con agua fría para cerrar los poros." },
      { id: "r3s2", name: "Sérum regulador", order: 1, productId: "13", notes: "Aplicar 3-4 gotas en toda la cara tras la limpieza." },
      { id: "r3s3", name: "Hidratación ligera", order: 2, productId: "5", notes: "Una fina capa es suficiente; evitar el contorno de ojos." }
    ],
    deleted: false
  },
  {
    userId: "u5",
    name: "Rutina reparadora de noche",
    description: "Repara y calma la piel sensible o irritada mientras descansas.",
    publishedAt: "2026-03-08T22:10:00.000Z",
    type: "pm",
    skinType: "sensible",
    upvotes: ["u3", "u5", "u1"],
    downvotes: [],
    views: 945,
    steps: [
      { id: "r4s1", name: "Limpieza delicada", order: 0, productId: "12", notes: "Sin frotar; aclarar con agua tibia." },
      { id: "r4s2", name: "Esencia reparadora", order: 1, productId: "14", notes: "Dar toquecitos con las yemas hasta absorción completa." },
      { id: "r4s3", name: "Bálsamo sellador", order: 2, productId: "6", notes: "Aplicar una capa fina sobre la crema o directamente sobre zonas irritadas." }
    ],
    deleted: false
  },
  {
    userId: "u6",
    name: "Rutina luminosidad AM",
    description: "Vitamina C y antioxidantes para un tono uniforme y piel radiante durante el día.",
    publishedAt: "2026-03-16T11:05:00.000Z",
    type: "am",
    skinType: "opaca",
    upvotes: ["u4", "u2"],
    downvotes: [],
    views: 3420,
    steps: [
      { id: "r5s1", name: "Limpieza exfoliante suave", order: 0, productId: "2", notes: "Usar solo 3 veces por semana para evitar irritación." },
      { id: "r5s2", name: "Vitamina C", order: 1, productId: "8", notes: "Aplicar por la mañana antes de la hidratación para máxima protección antioxidante." },
      { id: "r5s3", name: "Hidratación con FPS", order: 2, productId: "10", notes: "Complementar con protector solar encima." }
    ],
    deleted: false
  },
  {
    userId: "u3",
    name: "Rutina exfoliante de noche",
    description: "Exfolia suavemente y permite que la piel se renueve durante el sueño.",
    publishedAt: "2026-03-06T19:50:00.000Z",
    type: "pm",
    skinType: "texturizada",
    upvotes: ["u2"],
    downvotes: [],
    views: 1650,
    steps: [
      { id: "r6s1", name: "Limpieza", order: 0, productId: "11", notes: "Primer paso para retirar maquillaje y contaminantes del día." },
      { id: "r6s2", name: "Tónico exfoliante", order: 1, productId: "3", notes: "Aplicar con algodón o directamente con las manos tras la limpieza." },
      { id: "r6s3", name: "Hidratación intensa", order: 2, productId: "1", notes: "Hidratar bien después del ácido glicólico para calmar la piel." }
    ],
    deleted: false
  },
  {
    userId: "u1",
    name: "Rutina coreana de 5 pasos AM",
    description: "Inspirada en el K-beauty para máxima hidratación y efecto glass skin.",
    publishedAt: "2026-03-15T08:15:00.000Z",
    type: "am",
    skinType: "mixta",
    upvotes: ["u2", "u3", "u4", "u5"],
    downvotes: [],
    views: 4782,
    steps: [
      { id: "r7s1", name: "Limpieza acuosa", order: 0, productId: "12", notes: "Primera limpieza suave para retirar residuos nocturnos." },
      { id: "r7s2", name: "Esencia baba caracol", order: 1, productId: "14", notes: "Dar palmaditas suaves para potenciar absorción." },
      { id: "r7s3", name: "Sérum té verde", order: 2, productId: "7", notes: "Aplicar una capa fina y dejar absorber 1 minuto." },
      { id: "r7s4", name: "Hidratación mineral", order: 3, productId: "15", notes: "Mezclar con la crema o aplicar solo para un extra de hidratación." },
      { id: "r7s5", name: "Crema hidratante", order: 4, productId: "10", notes: "Sellar toda la rutina con una capa de crema." }
    ],
    deleted: false
  },
  {
    userId: "u4",
    name: "Rutina anti-imperfecciones PM",
    description: "Combate el acné y las imperfecciones durante la noche sin resecar la piel.",
    publishedAt: "2026-03-13T21:30:00.000Z",
    type: "pm",
    skinType: "acneica",
    upvotes: ["u1", "u5"],
    downvotes: ["u6"],
    views: 2340,
    steps: [
      { id: "r8s1", name: "Limpieza purificante", order: 0, productId: "11", notes: "Masajear durante 60 segundos para mayor eficacia." },
      { id: "r8s2", name: "Regulador de sebo", order: 1, productId: "13", notes: "Extender por toda la zona T y mentón." },
      { id: "r8s3", name: "Tónico AHA", order: 2, productId: "3", notes: "Aplicar con algodón evitando el contorno de ojos." },
      { id: "r8s4", name: "Bálsamo reparador", order: 3, productId: "6", notes: "Usar solo en zonas irritadas o con granitos activos." }
    ],
    deleted: false
  },
  {
    userId: "u2",
    name: "Rutina antiedad avanzada AM",
    description: "Combina antioxidantes y activos antiaging para retrasar los signos de la edad.",
    publishedAt: "2026-03-09T10:40:00.000Z",
    type: "am",
    skinType: "normal",
    upvotes: ["u4", "u6"],
    downvotes: [],
    views: 1620,
    steps: [
      { id: "r9s1", name: "Limpieza hidratante", order: 0, productId: "12", notes: "Usar temperatura templada para no alterar la barrera cutánea." },
      { id: "r9s2", name: "Sérum antiedad", order: 1, productId: "4", notes: "Aplicar 5-6 gotas con leve masaje ascendente." },
      { id: "r9s3", name: "Vitamina C", order: 2, productId: "8", notes: "Aplicar encima del sérum para potenciar el efecto antioxidante." },
      { id: "r9s4", name: "Crema diaria", order: 3, productId: "1", notes: "Finalizar con la crema hidratante para fijar los activos." }
    ],
    deleted: false
  },
  {
    userId: "u5",
    name: "Rutina piel seca intensa PM",
    description: "Nutrición profunda para pieles secas o muy secas que necesitan recuperar la barrera lipídica.",
    publishedAt: "2026-03-11T23:05:00.000Z",
    type: "pm",
    skinType: "seca",
    upvotes: ["u1", "u3"],
    downvotes: [],
    views: 3105,
    steps: [
      { id: "r10s1", name: "Limpieza sin sulfatos", order: 0, productId: "12", notes: "Aclarar con agua templada, nunca fría ni caliente." },
      { id: "r10s2", name: "Esencia reparadora", order: 1, productId: "14", notes: "Aplicar abundantemente sobre piel semi-húmeda para sellar la hidratación." },
      { id: "r10s3", name: "Sérum mineral", order: 2, productId: "15", notes: "Mezclar con unas gotas de aceite facial si la piel está muy seca." },
      { id: "r10s4", name: "Crema nutritiva", order: 3, productId: "10", notes: "Aplicar en cantidad generosa y dar masaje hasta absorción." },
      { id: "r10s5", name: "Bálsamo sellador", order: 4, productId: "6", notes: "Terminar con una capa fina sobre las zonas más resecas (mejillas, comisuras)." }
    ],
     deleted: false
   },
   {
     userId: "u3",
     name: "Rutina revitalizante matutina",
     description: "Despierta la piel con antioxidantes y textura suave para un acabado luminoso.",
     publishedAt: "2026-03-17T08:30:00.000Z",
     type: "am",
     skinType: "texturizada",
     upvotes: ["u1", "u5", "u6"],
     downvotes: [],
     views: 1890,
     steps: [
       { id: "r11s1", name: "Limpieza texturizante", order: 0, productId: "11", notes: "Masajear suavemente para aflojar células muertas." },
       { id: "r11s2", name: "Tónico exfoliante", order: 1, productId: "3", notes: "Aplicar con algodón para refinar la textura." },
       { id: "r11s3", name: "Sérum té verde", order: 2, productId: "7", notes: "Dar palmaditas para sellar hidratación." },
       { id: "r11s4", name: "Hidratación ligera", order: 3, productId: "5", notes: "Una capa fina es suficiente para sellar la rutina." }
     ],
     deleted: false
   },
   {
     userId: "u6",
     name: "Rutina aclarado nocturno",
     description: "Trata manchas y opacidad mientras duermes con vitamina C y ácido hialurónico.",
     publishedAt: "2026-03-18T22:15:00.000Z",
     type: "pm",
     skinType: "opaca",
     upvotes: ["u2", "u4"],
     downvotes: ["u3"],
     views: 2560,
     steps: [
       { id: "r12s1", name: "Limpieza profunda", order: 0, productId: "2", notes: "Masajear durante 60 segundos para activar el ácido salicílico." },
       { id: "r12s2", name: "Vitamina C intensa", order: 1, productId: "8", notes: "Aplicar solo de noche para evitar fotosensibilidad." },
       { id: "r12s3", name: "Sérum reparador", order: 2, productId: "14", notes: "Extender con suaves toques hasta absorción." },
       { id: "r12s4", name: "Crema nutritiva", order: 3, productId: "10", notes: "Finalizar con una capa generosa." }
     ],
     deleted: false
   },
   {
     userId: "u1",
     name: "Rutina minimalista AM",
     description: "Solo 2 pasos para quienes buscan rapidez sin sacrificar el cuidado básico.",
     publishedAt: "2026-03-19T07:45:00.000Z",
     type: "am",
     skinType: "normal",
     upvotes: ["u3", "u5"],
     downvotes: [],
     views: 980,
     steps: [
       { id: "r13s1", name: "Limpieza rápida", order: 0, productId: "12", notes: "Enjuagar con agua tibia en menos de 30 segundos." },
       { id: "r13s2", name: "Hidratación todo en uno", order: 1, productId: "1", notes: "Aplicar y listo para comenzar el día." }
     ],
     deleted: false
   },
   {
     userId: "u2",
     name: "Rutina barrera nocturna",
     description: "Refuerza la barrera cutánea con ceramidas y lípidos esenciales para piel seca.",
     publishedAt: "2026-03-20T21:00:00.000Z",
     type: "pm",
     skinType: "seca",
     upvotes: ["u1", "u4", "u5"],
     downvotes: [],
     views: 3120,
     steps: [
       { id: "r14s1", name: "Limpieza cremosa", order: 0, productId: "12", notes: "No usar agua caliente para preservar lípidos." },
       { id: "r14s2", name: "Sérum ceramidas", order: 1, productId: "4", notes: "Aplicar con masaje ascendente en rostro y cuello." },
       { id: "r14s3", name: "Crema de noche", order: 2, productId: "1", notes: "Capa gruesa para sellar la hidratación." },
       { id: "r14s4", name: "Bálsamo_zones secas", order: 3, productId: "6", notes: "Aplicar en mejillas y contorno de ojos." }
     ],
     deleted: false
   },
   {
     userId: "u4",
     name: "Rutina control grasa extrema AM",
     description: "Matifica y controla el brillo todo el día con activos reguladores de sebo.",
     publishedAt: "2026-03-21T08:00:00.000Z",
     type: "am",
     skinType: "grasa",
     upvotes: ["u3", "u6"],
     downvotes: ["u5"],
     views: 2780,
     steps: [
       { id: "r15s1", name: "Gel purificante", order: 0, productId: "11", notes: "Enjuagar con agua fría para cerrar poros." },
       { id: "r15s2", name: "Niacinamida 10%", order: 1, productId: "13", notes: "3-4 gotas en toda la zona T." },
       { id: "r15s3", name: "Gel hidratante", order: 2, productId: "5", notes: "Textura acuosa que no deja residuos grasos." }
     ],
     deleted: false
   },
   {
     userId: "u5",
     name: "Rutina calmante para piel sensible",
     description: "Minimiza rojeces y molestias con ingredientes hipoalergénicos y térmales.",
     publishedAt: "2026-03-22T09:15:00.000Z",
     type: "am",
     skinType: "sensible",
     upvotes: ["u1", "u2", "u6"],
     downvotes: [],
     views: 4210,
     steps: [
       { id: "r16s1", name: "Limpieza ultra suave", order: 0, productId: "12", notes: "Sin fricción, solo deslizar el producto." },
       { id: "r16s2", name: "Sérum agua térmal", order: 1, productId: "15", notes: "Aplicar con suaves palmaditas." },
       { id: "r16s3", name: "Crema calmante", order: 2, productId: "1", notes: "Capa fina para sellar sin oclusión." }
     ],
     deleted: false
   },
   {
     userId: "u3",
     name: "Rutina exfoliación profunda PM",
     description: "Renueva la piel texturizada con ácidos y esencias reparadoras.",
     publishedAt: "2026-03-23T22:30:00.000Z",
     type: "pm",
     skinType: "texturizada",
     upvotes: ["u2", "u4"],
     downvotes: ["u1"],
     views: 1650,
     steps: [
       { id: "r17s1", name: "Limpieza doble", order: 0, productId: "2", notes: "Primero con agua, luego sin enjuagar." },
       { id: "r17s2", name: "Ácido glicólico 7%", order: 1, productId: "3", notes: "Dejar actuar 2 minutos antes de seguir." },
       { id: "r17s3", name: "Esencia caracol", order: 2, productId: "14", notes: "Sellar la exfoliación con mucina reparadora." },
       { id: "r17s4", name: "Crema regenerativa", order: 3, productId: "10", notes: "Capa gruesa para regenerar durante el sueño." }
     ],
     deleted: false
   },
   {
     userId: "u6",
     name: "Rutina antioxidante completa AM",
     description: "Protege contra la contaminación y radicales libres con antioxidantes potentes.",
     publishedAt: "2026-03-24T08:45:00.000Z",
     type: "am",
     skinType: "opaca",
     upvotes: ["u1", "u3", "u5", "u2"],
     downvotes: [],
     views: 3890,
     steps: [
       { id: "r18s1", name: "Limpieza suave", order: 0, productId: "12", notes: "Masaje circular de 30 segundos." },
       { id: "r18s2", name: "Sérum vitamina C", order: 1, productId: "8", notes: "Aplicar antes de la hidratación." },
       { id: "r18s3", name: "Sérum té verde", order: 2, productId: "7", notes: "Capa adicional de antioxidantes." },
       { id: "r18s4", name: "Hidratación mineral", order: 3, productId: "15", notes: "Fijar todo con esta base hidratante." }
     ],
     deleted: false
   },
   {
     userId: "u1",
     name: "Rutina combinación equilibrada PM",
     description: "Equilibra las zonas mixtas con hidratación selectiva y control de sebo.",
     publishedAt: "2026-03-25T21:15:00.000Z",
     type: "pm",
     skinType: "mixta",
     upvotes: ["u4", "u6"],
     downvotes: [],
     views: 2340,
     steps: [
       { id: "r19s1", name: "Limpieza equilibrada", order: 0, productId: "2", notes: "Enfocarse en zona T y mentón." },
       { id: "r19s2", name: "Niacinamida reguladora", order: 1, productId: "13", notes: "Aplicar en toda la cara, especialmente zona T." },
       { id: "r19s3", name: "Esencia té verde", order: 2, productId: "7", notes: "Hidratar sin peso en las zonas mixtas." },
       { id: "r19s4", name: "Crema ligera", order: 3, productId: "5", notes: "Capa fina en todo el rostro." }
     ],
     deleted: false
   },
   {
     userId: "u2",
     name: "Rutina combo antiedad + acné",
     description: "Trata signos de edad y brotes simultáneamente con retinol y ácido salicílico.",
     publishedAt: "2026-03-26T22:00:00.000Z",
     type: "pm",
     skinType: "acneica",
     upvotes: ["u1", "u3", "u5"],
     downvotes: ["u6"],
     views: 5670,
     steps: [
       { id: "r20s1", name: "Limpieza purificante", order: 0, productId: "11", notes: "Masajear por 60 segundos en zonas con granitos." },
       { id: "r20s2", name: "Retinol gradual", order: 1, productId: "9", notes: "Usar solo 3 noches por semana al inicio." },
       { id: "r20s3", name: "Sérum niacinamida", order: 2, productId: "13", notes: "Ayuda a compensar la resequedad del retinol." },
       { id: "r20s4", name: "Bálsamo reparador", order: 3, productId: "6", notes: "Sellar en zonas irritadas o con acné activo." }
     ],
     deleted: false
   }
 ];
