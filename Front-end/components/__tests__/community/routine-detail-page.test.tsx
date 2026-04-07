import { fireEvent, render, screen } from '@testing-library/react'
import RoutineDetailPage from '../../community/RoutineDetailPage'
import { getRoutineById } from '@/lib/routine'
import { getProductById, getUserById } from '@/lib/api'
import { SkinType } from '@/types/product'

jest.mock('@/lib/routine', () => ({
    getRoutineById: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
    getProductById: jest.fn(),
    getUserById: jest.fn(),
}))

jest.mock('@/components/comments/CommentsSection', () => ({
    __esModule: true,
    default: () => <div>Mocked comments section</div>,
}))

jest.mock('@/i18n/navigation', () => ({
    Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

describe('community/RoutineDetailPage', () => {
    beforeEach(() => {
        ; (getProductById as jest.Mock).mockReturnValue({
            id: 'p1',
            name: 'Hydra Cream',
            brand: 'Brand A',
            image_url: ['https://example.com/p1.png'],
        })

            ; (getUserById as jest.Mock).mockReturnValue({
                id: 'u1',
                name: 'Sarah J.',
                avatarUrl: 'https://example.com/u1.png',
            })
    })

    it('renders not found state when routine does not exist', () => {
        ; (getRoutineById as jest.Mock).mockReturnValue(undefined)

        render(<RoutineDetailPage routineId="missing" />)

        expect(screen.getByText('RoutineDetail.notFoundTitle')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'RoutineDetail.backToDiscussions' })).toHaveAttribute('href', '/community')
    })

    it('renders routine data, votes and steps', () => {
        ; (getRoutineById as jest.Mock).mockReturnValue({
            id: 'r1',
            userId: 'u1',
            name: 'Night Repair',
            description: 'Routine description',
            type: 'pm',
            skinType: SkinType.SECA,
            publishedAt: '2026-03-16T11:05:00.000Z',
            upvotes: ['u2'],
            downvotes: [],
            comments: [{ id: 'c1' }],
            steps: [
                { id: 's2', name: 'Step 2', order: 1, productId: 'p1', notes: 'Second note' },
                { id: 's1', name: 'Step 1', order: 0, productId: 'p1', notes: 'First note' },
            ],
        })

        render(<RoutineDetailPage routineId="r1" />)

        expect(screen.getAllByText('Night Repair').length).toBeGreaterThan(0)
        expect(screen.getByText('First note')).toBeInTheDocument()
        expect(screen.getByText('Second note')).toBeInTheDocument()
        expect(screen.getByText('Mocked comments section')).toBeInTheDocument()

        const upvoteButton = screen.getByRole('button', { name: 'RoutineDetail.upvote' })
        expect(upvoteButton).toHaveTextContent('1')

        fireEvent.click(upvoteButton)

        expect(screen.getByRole('button', { name: 'RoutineDetail.upvote' })).toHaveTextContent('2')
    })

    it('toggles up/down votes in routine detail', () => {
        ; (getRoutineById as jest.Mock).mockReturnValue({
            id: 'r2',
            userId: 'u1',
            name: 'AM Balance',
            description: 'Routine description',
            type: 'am',
            skinType: SkinType.MIXTA,
            publishedAt: '2026-03-16T11:05:00.000Z',
            upvotes: [],
            downvotes: [],
            comments: [],
            steps: [],
        })

        render(<RoutineDetailPage routineId="r2" />)

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
