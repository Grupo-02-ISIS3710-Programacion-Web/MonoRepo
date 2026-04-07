import { CommentDto } from '../../common/dtos/product.dto';

export const MOCK_COMMENTS: CommentDto[] = [
  {
    id: 'c1',
    userId: 'u1',
    comment: 'This product changed my life! My skin is finally hydrated.',
    createdAt: new Date().toISOString(),
    upvotes: ['u2', 'u3'],
    downvotes: [],
  },
  {
    id: 'c2',
    userId: 'u2',
    comment: 'Great serum but a bit pricey for the amount you get.',
    createdAt: new Date().toISOString(),
    upvotes: ['u1'],
    downvotes: [],
  },
  {
    id: 'c3',
    userId: 'u3',
    comment: 'Perfect for sensitive skin. No irritation at all.',
    createdAt: new Date().toISOString(),
    upvotes: ['u4', 'u5', 'u6'],
    downvotes: [],
  },
];
