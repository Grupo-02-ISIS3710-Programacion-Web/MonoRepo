import { fireEvent, render, screen } from '@testing-library/react'
import { getUserById } from '@/lib/api'
import CommentCard from '../../community/CommentCard'

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

describe('community/CommentCard', () => {
    const mockedGetUserById = getUserById as jest.Mock

    beforeEach(() => {
        mockedGetUserById.mockReset()
    })

    it('renders content and triggers up/down vote callbacks', () => {
        mockedGetUserById.mockReturnValue({
            id: 'u2',
            name: 'Alex R.',
            avatarUrl: 'https://example.com/avatar.png',
        })

        const onVote = jest.fn()

        render(
            <CommentCard
                comment={{
                    id: 'cc1',
                    userId: 'u2',
                    comment: 'Community comment',
                    upvotes: ['u1'],
                    downvotes: [],
                }}
                onVote={onVote}
            />
        )

        expect(screen.getByText('Community comment')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.upvote' }))
        fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.downvote' }))

        expect(onVote).toHaveBeenNthCalledWith(1, 'cc1', 'up')
        expect(onVote).toHaveBeenNthCalledWith(2, 'cc1', 'down')
    })
})
