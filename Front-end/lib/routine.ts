import { Routine } from "@/types/routine";
import { SkinType } from "@/types/product";

// ─── Routines -------------

const routines: Routine[] = [
  {
    id: "r1",
    userId: "u1",
    name: "Rutina básica de mañana",
    description: "Rutina sencilla de 3 pasos para comenzar el día con la piel limpia e hidratada.",
    publishedAt: "2026-03-14T09:20:00.000Z",
    type: "am",
    skinType: SkinType.NORMAL,
    upvotes: ["u2", "u3", "u5"],
    downvotes: ["u6"],
    views: 1240,
    comments: [
      {
        id: "r1c1",
        userId: "u2",
        comment: "Me funciono muy bien para piel sensible en las mananas.",
        createdAt: "2026-03-14T10:30:00.000Z",
        upvotes: ["u1", "u4"],
        downvotes: []
      },
      {
        id: "r1c2",
        userId: "u5",
        comment: "Yo anadiria protector solar al final para completar AM.",
        createdAt: "2026-03-14T12:00:00.000Z",
        upvotes: ["u2"],
        downvotes: []
      }
    ],
    steps: [
      { id: "r1s1", name: "Limpieza suave", order: 0, productId: "12", notes: "Usar con agua tibia, masajear en círculos durante 30 segundos." },
      { id: "r1s2", name: "Hidratación express", order: 1, productId: "5", notes: "Aplicar una cantidad del tamaño de un guisante sobre el rostro limpio." },
      { id: "r1s3", name: "Sérum de refuerzo", order: 2, productId: "15", notes: "Dar toquecitos suaves para favorecer la absorción." }
    ]
  },
  {
    id: "r2",
    userId: "u2",
    name: "Rutina antiaging de noche",
    description: "Rutina nocturna enfocada en regeneración celular y reducción de líneas finas.",
    publishedAt: "2026-03-12T20:45:00.000Z",
    type: "pm",
    skinType: SkinType.SECA,
    upvotes: ["u1", "u4"],
    downvotes: [],
    views: 2156,
    comments: [
      {
        id: "r2c1",
        userId: "u1",
        comment: "Buen orden de activos. Lo haria dias alternos si eres principiante.",
        createdAt: "2026-03-12T22:15:00.000Z",
        upvotes: ["u3", "u6"],
        downvotes: []
      }
    ],
    steps: [
      { id: "r2s1", name: "Limpieza profunda", order: 0, productId: "2", notes: "Masajear sobre piel húmeda para activar el ácido salicílico." },
      { id: "r2s2", name: "Retinol", order: 1, productId: "9", notes: "Aplicar solo 2-3 noches por semana al inicio para acondicionar la piel." },
      { id: "r2s3", name: "Crema barrera", order: 2, productId: "1", notes: "Cerrar la rutina con una capa generosa para hidratar durante la noche." }
    ]
  },
  {
    id: "r3",
    userId: "u4",
    name: "Rutina para piel grasa AM",
    description: "Controla el exceso de sebo y mantiene los poros limpios durante el día.",
    publishedAt: "2026-03-10T07:35:00.000Z",
    type: "am",
    skinType: SkinType.GRASA,
    upvotes: ["u1", "u6", "u5"],
    downvotes: ["u2"],
    views: 1875,
    comments: [
      {
        id: "r3c1",
        userId: "u6",
        comment: "La niacinamida aqui va perfecta antes de hidratar.",
        createdAt: "2026-03-10T08:45:00.000Z",
        upvotes: ["u1"],
        downvotes: []
      }
    ],
    steps: [
      { id: "r3s1", name: "Limpieza purificante", order: 0, productId: "11", notes: "Aclarar con agua fría para cerrar los poros." },
      { id: "r3s2", name: "Sérum regulador", order: 1, productId: "13", notes: "Aplicar 3-4 gotas en toda la cara tras la limpieza." },
      { id: "r3s3", name: "Hidratación ligera", order: 2, productId: "5", notes: "Una fina capa es suficiente; evitar el contorno de ojos." }
    ]
  },
  {
    id: "r4",
    userId: "u5",
    name: "Rutina reparadora de noche",
    description: "Repara y calma la piel sensible o irritada mientras descansas.",
    publishedAt: "2026-03-08T22:10:00.000Z",
    type: "pm",
    skinType: SkinType.SENSIBLE,
    upvotes: ["u3", "u5", "u1"],
    downvotes: [],
    views: 945,
    comments: [
      {
        id: "r4c1",
        userId: "u3",
        comment: "Rutina super calmante, la use despues de exfoliar y me ayudo mucho.",
        createdAt: "2026-03-09T00:30:00.000Z",
        upvotes: ["u5", "u2", "u1"],
        downvotes: []
      }
    ],
    steps: [
      { id: "r4s1", name: "Limpieza delicada", order: 0, productId: "12", notes: "Sin frotar; aclarar con agua tibia." },
      { id: "r4s2", name: "Esencia reparadora", order: 1, productId: "14", notes: "Dar toquecitos con las yemas hasta absorción completa." },
      { id: "r4s3", name: "Bálsamo sellador", order: 2, productId: "6", notes: "Aplicar una capa fina sobre la crema o directamente sobre zonas irritadas." }
    ]
  },
  {
    id: "r5",
    userId: "u6",
    name: "Rutina luminosidad AM",
    description: "Vitamina C y antioxidantes para un tono uniforme y piel radiante durante el día.",
    publishedAt: "2026-03-16T11:05:00.000Z",
    type: "am",
    skinType: SkinType.OPACA,
    upvotes: ["u4", "u2"],
    downvotes: [],
    views: 3420,
    comments: [
      {
        id: "r5c1",
        userId: "u4",
        comment: "Vitamina C + hidratante ligera me dio buen glow durante el dia.",
        createdAt: "2026-03-16T12:20:00.000Z",
        upvotes: ["u2", "u6"],
        downvotes: []
      }
    ],
    steps: [
      { id: "r5s1", name: "Limpieza exfoliante suave", order: 0, productId: "2", notes: "Usar solo 3 veces por semana para evitar irritación." },
      { id: "r5s2", name: "Vitamina C", order: 1, productId: "8", notes: "Aplicar por la mañana antes de la hidratación para máxima protección antioxidante." },
      { id: "r5s3", name: "Hidratación con FPS", order: 2, productId: "10", notes: "Complementar con protector solar encima." }
    ]
  },
  {
    id: "r6",
    userId: "u3",
    name: "Rutina exfoliante de noche",
    description: "Exfolia suavemente y permite que la piel se renueve durante el sueño.",
    publishedAt: "2026-03-06T19:50:00.000Z",
    type: "pm",
    skinType: SkinType.TEXTURIZADA,
    upvotes: ["u2"],
    downvotes: [],
    views: 1650,
    steps: [
      { id: "r6s1", name: "Limpieza", order: 0, productId: "11", notes: "Primer paso para retirar maquillaje y contaminantes del día." },
      { id: "r6s2", name: "Tónico exfoliante", order: 1, productId: "3", notes: "Aplicar con algodón o directamente con las manos tras la limpieza." },
      { id: "r6s3", name: "Hidratación intensa", order: 2, productId: "1", notes: "Hidratar bien después del ácido glicólico para calmar la piel." }
    ]
  },
  {
    id: "r7",
    userId: "u1",
    name: "Rutina coreana de 5 pasos AM",
    description: "Inspirada en el K-beauty para máxima hidratación y efecto glass skin.",
    publishedAt: "2026-03-15T08:15:00.000Z",
    type: "am",
    skinType: SkinType.MIXTA,
    upvotes: ["u2", "u3", "u4", "u5"],
    downvotes: [],
    views: 4782,
    steps: [
      { id: "r7s1", name: "Limpieza acuosa", order: 0, productId: "12", notes: "Primera limpieza suave para retirar residuos nocturnos." },
      { id: "r7s2", name: "Esencia baba caracol", order: 1, productId: "14", notes: "Dar palmaditas suaves para potenciar absorción." },
      { id: "r7s3", name: "Sérum té verde", order: 2, productId: "7", notes: "Aplicar una capa fina y dejar absorber 1 minuto." },
      { id: "r7s4", name: "Hidratación mineral", order: 3, productId: "15", notes: "Mezclar con la crema o aplicar solo para un extra de hidratación." },
      { id: "r7s5", name: "Crema hidratante", order: 4, productId: "10", notes: "Sellar toda la rutina con una capa de crema." }
    ]
  },
  {
    id: "r8",
    userId: "u4",
    name: "Rutina anti-imperfecciones PM",
    description: "Combate el acné y las imperfecciones durante la noche sin resecar la piel.",
    publishedAt: "2026-03-13T21:30:00.000Z",
    type: "pm",
    skinType: SkinType.ACNEICA,
    upvotes: ["u1", "u5"],
    downvotes: ["u6"],
    views: 2340,
    steps: [
      { id: "r8s1", name: "Limpieza purificante", order: 0, productId: "11", notes: "Masajear durante 60 segundos para mayor eficacia." },
      { id: "r8s2", name: "Regulador de sebo", order: 1, productId: "13", notes: "Extender por toda la zona T y mentón." },
      { id: "r8s3", name: "Tónico AHA", order: 2, productId: "3", notes: "Aplicar con algodón evitando el contorno de ojos." },
      { id: "r8s4", name: "Bálsamo reparador", order: 3, productId: "6", notes: "Usar solo en zonas irritadas o con granitos activos." }
    ]
  },
  {
    id: "r9",
    userId: "u2",
    name: "Rutina antiedad avanzada AM",
    description: "Combina antioxidantes y activos antiaging para retrasar los signos de la edad.",
    publishedAt: "2026-03-09T10:40:00.000Z",
    type: "am",
    skinType: SkinType.NORMAL,
    upvotes: ["u4", "u6"],
    downvotes: [],
    views: 1620,
    steps: [
      { id: "r9s1", name: "Limpieza hidratante", order: 0, productId: "12", notes: "Usar temperatura templada para no alterar la barrera cutánea." },
      { id: "r9s2", name: "Sérum antiedad", order: 1, productId: "4", notes: "Aplicar 5-6 gotas con leve masaje ascendente." },
      { id: "r9s3", name: "Vitamina C", order: 2, productId: "8", notes: "Aplicar encima del sérum para potenciar el efecto antioxidante." },
      { id: "r9s4", name: "Crema diaria", order: 3, productId: "1", notes: "Finalizar con la crema hidratante para fijar los activos." }
    ]
  },
  {
    id: "r10",
    userId: "u5",
    name: "Rutina piel seca intensa PM",
    description: "Nutrición profunda para pieles secas o muy secas que necesitan recuperar la barrera lipídica.",
    publishedAt: "2026-03-11T23:05:00.000Z",
    type: "pm",
    skinType: SkinType.SECA,
    upvotes: ["u1", "u3"],
    downvotes: [],
    views: 3105,
    steps: [
      { id: "r10s1", name: "Limpieza sin sulfatos", order: 0, productId: "12", notes: "Aclarar con agua templada, nunca fría ni caliente." },
      { id: "r10s2", name: "Esencia reparadora", order: 1, productId: "14", notes: "Aplicar abundantemente sobre piel semi-húmeda para sellar la hidratación." },
      { id: "r10s3", name: "Sérum mineral", order: 2, productId: "15", notes: "Mezclar con unas gotas de aceite facial si la piel está muy seca." },
      { id: "r10s4", name: "Crema nutritiva", order: 3, productId: "10", notes: "Aplicar en cantidad generosa y dar masaje hasta absorción." },
      { id: "r10s5", name: "Bálsamo sellador", order: 4, productId: "6", notes: "Terminar con una capa fina sobre las zonas más resecas (mejillas, comisuras)." }
    ]
  }
];

export function getRoutines(): Routine[] {
  return routines;
}

export function getRoutineById(id: string): Routine | undefined {
  return routines.find(routine => routine.id === id);
}
