import { RoutineDto } from '../../common/dtos/routine.dto';
import { SkinType } from '../../common/enums/product.enum';

export const MOCK_ROUTINES: RoutineDto[] = [
  {
    id: 'r1',
    userId: 'u1',
    name: 'Morning Hydration Routine',
    description: 'A gentle morning routine focused on hydration and protection',
    type: 'morning',
    skinType: SkinType.MIXTA,
    steps: [
      {
        id: 'step1',
        name: 'Cleanse',
        order: 1,
        productId: '12',
        notes: 'Use lukewarm water',
      },
      {
        id: 'step2',
        name: 'Hydrate',
        order: 2,
        productId: '15',
        notes: 'Apply in upward strokes',
      },
      {
        id: 'step3',
        name: 'Moisturize',
        order: 3,
        productId: '1',
        notes: 'Pat gently into skin',
      },
    ],
    views: 234,
  },
  {
    id: 'r2',
    userId: 'u2',
    name: 'Night Anti-Aging Routine',
    description: 'Rich night routine for anti-aging and repair',
    type: 'night',
    skinType: SkinType.SECA,
    steps: [
      {
        id: 'step1',
        name: 'Cleanse',
        order: 1,
        productId: '11',
        notes: 'Double cleanse with oil',
      },
      {
        id: 'step2',
        name: 'Serum',
        order: 2,
        productId: '4',
        notes: 'Wait 2 minutes before next step',
      },
      {
        id: 'step3',
        name: 'Treatment',
        order: 3,
        productId: '9',
        notes: 'Use 2-3x per week',
      },
      {
        id: 'step4',
        name: 'Moisturize',
        order: 4,
        productId: '10',
        notes: 'Apply generous layer',
      },
    ],
    views: 456,
  },
  {
    id: 'r3',
    userId: 'u4',
    name: 'Oil Control Routine',
    description: 'Balanced routine for oily and acne-prone skin',
    type: 'morning',
    skinType: SkinType.GRASA,
    steps: [
      {
        id: 'step1',
        name: 'Cleanse',
        order: 1,
        productId: '11',
        notes: 'Gentle but thorough',
      },
      {
        id: 'step2',
        name: 'Exfoliate',
        order: 2,
        productId: '2',
        notes: '2-3 times per week',
      },
      {
        id: 'step3',
        name: 'Balance',
        order: 3,
        productId: '13',
        notes: 'Controls sebum',
      },
    ],
    views: 345,
  },
];
