import { fireEvent, render, screen } from '@testing-library/react'
import CommentsSection from '../../community/CommentsSection'
import { Comment } from '@/types/Comment'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}))

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  getUserById: () => ({
    id: 'u1',
    name: 'Sofia',
    avatarUrl: 'https://example.com/u1.png',
  }),
}))

describe('community/CommentsSection voting', () => {
  const initialComments: Comment[] = [
    {
      id: 'c1',
      userId: 'u2',
      comment: 'Great routine',
      upvotes: [],
      downvotes: [],
    },
  ]

  it('toggles comment votes and updates counters', () => {
    render(
      <CommentsSection
        targetId="r1"
        targetType="routine"
        initialComments={initialComments}
        currentUserId="u1"
        isLoggedIn={true}
        translationNamespace="RoutineDetail"
      />
    )

    const upvoteButton = screen.getByRole('button', { name: 'RoutineDetail.upvote' })
    const downvoteButton = screen.getByRole('button', { name: 'RoutineDetail.downvote' })

    expect(upvoteButton).toHaveTextContent('0')
    expect(downvoteButton).toHaveTextContent('0')

    fireEvent.click(upvoteButton)
    expect(screen.getByRole('button', { name: 'RoutineDetail.upvote' })).toHaveTextContent('1')
    expect(screen.getByRole('button', { name: 'RoutineDetail.downvote' })).toHaveTextContent('0')

    fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.upvote' }))
    expect(screen.getByRole('button', { name: 'RoutineDetail.upvote' })).toHaveTextContent('0')

    fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.downvote' }))
    expect(screen.getByRole('button', { name: 'RoutineDetail.downvote' })).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.upvote' }))
    expect(screen.getByRole('button', { name: 'RoutineDetail.upvote' })).toHaveTextContent('1')
    expect(screen.getByRole('button', { name: 'RoutineDetail.downvote' })).toHaveTextContent('0')
  })
})
