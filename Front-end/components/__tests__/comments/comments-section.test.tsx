import { fireEvent, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import CommentsSection from '../../comments/CommentsSection'
import { Comment } from '@/types/Comment'

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
    },
}))

jest.mock('@/components/comments/CommentCard', () => ({
    __esModule: true,
    default: ({ comment, onVote }: any) => (
        <div>
            <p>{comment.comment}</p>
            <button aria-label={`up-${comment.id}`} onClick={() => onVote?.(comment.id, 'up')}>
                up:{comment.upvotes.length}
            </button>
            <button aria-label={`down-${comment.id}`} onClick={() => onVote?.(comment.id, 'down')}>
                down:{comment.downvotes.length}
            </button>
        </div>
    ),
}))

describe('comments/CommentsSection', () => {
    const initialComments: Comment[] = [
        {
            id: 'c1',
            userId: 'u2',
            comment: 'Initial comment',
            upvotes: [],
            downvotes: [],
        },
    ]

    it('adds a new comment and shows success toast', () => {
        render(
            <CommentsSection
                targetId="r1"
                targetType="routine"
                initialComments={initialComments}
            />
        )

        fireEvent.change(screen.getByPlaceholderText('RoutineDetail.commentPlaceholder'), {
            target: { value: 'New local comment' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.postComment' }))

        expect(screen.getByText('RoutineDetail.commentsTitle (2)')).toBeInTheDocument()
        expect(screen.getByText('New local comment')).toBeInTheDocument()
        expect(toast.success).toHaveBeenCalledWith('RoutineDetail.commentPosted')
    })

    it('toggles votes through child callback', () => {
        render(
            <CommentsSection
                targetId="r1"
                targetType="routine"
                initialComments={initialComments}
            />
        )

        const upvoteButton = screen.getByRole('button', { name: 'up-c1' })

        expect(upvoteButton).toHaveTextContent('up:0')

        fireEvent.click(upvoteButton)

        expect(screen.getByRole('button', { name: 'up-c1' })).toHaveTextContent('up:1')
    })
})
