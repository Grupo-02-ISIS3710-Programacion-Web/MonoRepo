import { fireEvent, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import CommentsSection from '../../community/CommentsSection'
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
        </div>
    ),
}))

describe('community/CommentsSection', () => {
    const initialComments: Comment[] = [
        {
            id: 'c1',
            userId: 'u2',
            comment: 'Initial comment',
            upvotes: [],
            downvotes: [],
        },
    ]

    it('adds a comment and notifies success', () => {
        render(
            <CommentsSection
                targetId="r1"
                targetType="routine"
                initialComments={initialComments}
            />
        )

        fireEvent.change(screen.getByPlaceholderText('RoutineDetail.commentPlaceholder'), {
            target: { value: 'Another comment' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'RoutineDetail.postComment' }))

        expect(screen.getByText('RoutineDetail.commentsTitle (2)')).toBeInTheDocument()
        expect(screen.getByText('Another comment')).toBeInTheDocument()
        expect(toast.success).toHaveBeenCalledWith('RoutineDetail.commentPosted')
    })
})
