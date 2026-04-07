import { fireEvent, render, screen } from '@testing-library/react'
import { getUserById } from '@/lib/api'
import CommentCard from '../../comments/CommentCard'

jest.mock('react-markdown', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}))

jest.mock('remark-gfm', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
    getUserById: jest.fn(),
}))

describe('comments/CommentCard', () => {
    const mockedGetUserById = getUserById as jest.Mock

    beforeEach(() => {
        mockedGetUserById.mockReset()
    })

    it('renders author info and calls vote handlers', () => {
        mockedGetUserById.mockReturnValue({
            id: 'u2',
            name: 'Alex R.',
            avatarUrl: 'https://example.com/avatar.png',
        })

        const onVote = jest.fn()

        render(
            <CommentCard
                comment={{
                    id: 'c1',
                    userId: 'u2',
                    comment: 'Great routine',
                    createdAt: '2026-03-14T10:30:00.000Z',
                    upvotes: ['u1'],
                    downvotes: [],
                }}
                onVote={onVote}
            />
        )

        expect(screen.getByText('Alex R.')).toBeInTheDocument()
        expect(screen.getByText('Great routine')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.upvote' }))
        fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.downvote' }))

        expect(onVote).toHaveBeenNthCalledWith(1, 'c1', 'up')
        expect(onVote).toHaveBeenNthCalledWith(2, 'c1', 'down')
    })

    it('falls back to translated user name when user is missing', () => {
        mockedGetUserById.mockReturnValue(undefined)

        render(
            <CommentCard
                comment={{
                    id: 'c2',
                    userId: 'unknown',
                    comment: 'Fallback user',
                    upvotes: [],
                    downvotes: [],
                }}
            />
        )

        expect(screen.getByText('RoutineDetail.userFallback')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'RoutineDetail.userFallback' })).toBeInTheDocument()
    })
})
