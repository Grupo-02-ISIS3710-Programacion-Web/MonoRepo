import { SkinType } from '@/types/product'
import { Routine } from '../../types/routine'

export const mockRoutines: Routine[] = [
  {
    id: 'r1',
    userId: 'u1',
    name: 'Morning Basic',
    description: 'Simple AM routine',
    type: 'AM',
    skinType: SkinType.NORMAL,
    steps: [
      { id: 's1', name: 'Step 1', order: 1, productId: 'p1' },
      { id: 's2', name: 'Step 2', order: 2, productId: 'p3' },
    ],
  },
  {
    id: 'r2',
    userId: 'u1',
    name: 'Night Repair',
    description: 'Simple PM routine',
    type: 'PM',
    skinType: SkinType.NORMAL,
    steps: [{ id: 's3', name: 'Step 3', order: 1, productId: 'p2' }],
  },
]
