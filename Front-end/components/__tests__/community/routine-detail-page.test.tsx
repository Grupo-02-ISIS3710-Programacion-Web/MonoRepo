import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import RoutineDetailPage from '../../community/RoutineDetailPage'
import { getProductById, getUserById } from '@/lib/api'
import { fetchRoutineById, fetchUserById, incrementRoutineView } from '@/lib/api-client'
import { SkinType } from '@/types/product'

jest.mock('@/lib/api-client', () => ({
    fetchRoutineById: jest.fn(),
    fetchUserById: jest.fn(),
    incrementRoutineView: jest.fn(() => Promise.resolve()),
    upvoteRoutine: jest.fn(() => Promise.resolve()),
    downvoteRoutine: jest.fn(() => Promise.resolve()),
    removeUpvote: jest.fn(() => Promise.resolve()),
    removeDownvote: jest.fn(() => Promise.resolve()),
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

jest.mock('@/lib/hooks/use-auth-session', () => ({
    useAuthSession: () => ({ user: { id: 'u2' }, isLoggedIn: true, isReady: true }),
}))

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'es',
}))

jest.mock('@/lib/hooks/use-locale-date-formatter', () => ({
    useLocaleDateFormatter: () => ({
        format: (date: Date) => date.toLocaleDateString(),
    }),
}))

describe('community/RoutineDetailPage', () => {
    beforeEach(() => {
        ;(getProductById as jest.Mock).mockReturnValue({
            id: 'p1',
            name: 'Hydra Cream',
            brand: 'Brand A',
            image_url: ['https://example.com/p1.png'],
        })

        ;(getUserById as jest.Mock).mockReturnValue({
            id: 'u1',
            name: 'Sarah J.',
            avatarUrl: 'https://example.com/u1.png',
        })

        ;(fetchUserById as jest.Mock).mockResolvedValue({
            id: 'u1',
            name: 'Sarah J.',
            avatarUrl: 'https://example.com/u1.png',
        })
    })

    it('renders not found state when routine does not exist', async () => {
        ;(fetchRoutineById as jest.Mock).mockResolvedValue(undefined)

        render(<RoutineDetailPage routineId="missing" />)

        await waitFor(() => {
            expect(screen.getByText('notFoundTitle')).toBeInTheDocument()
        })
        expect(screen.getByRole('link', { name: 'backToDiscussions' })).toHaveAttribute('href', '/community')
    })

    it('renders routine data, votes and steps', async () => {
        ;(fetchRoutineById as jest.Mock).mockResolvedValue({
            id: 'r1',
            userId: 'u1',
            name: 'Night Repair',
            description: 'Routine description',
            type: 'pm',
            skinType: SkinType.SECA,
            publishedAt: '2026-03-16T11:05:00.000Z',
            upvotes: ['u3'],
            downvotes: [],
            comments: [{ id: 'c1' }],
            steps: [
                { id: 's2', name: 'Step 2', order: 1, productId: 'p1', notes: 'Second note' },
                { id: 's1', name: 'Step 1', order: 0, productId: 'p1', notes: 'First note' },
            ],
        })

        render(<RoutineDetailPage routineId="r1" />)

        await waitFor(() => {
            expect(screen.getAllByText('Night Repair').length).toBeGreaterThan(0)
        })
        expect(screen.getByText('First note')).toBeInTheDocument()
        expect(screen.getByText('Second note')).toBeInTheDocument()
        expect(screen.getByText('Mocked comments section')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'upvote' })).toHaveTextContent('1')
        })

        fireEvent.click(screen.getByRole('button', { name: 'upvote' }))

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'upvote' })).toHaveTextContent('2')
        })
    })

    it('toggles up/down votes in routine detail', async () => {
        ;(fetchRoutineById as jest.Mock).mockResolvedValue({
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

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'upvote' })).toHaveTextContent('0')
        })
        const upvoteButton = screen.getByRole('button', { name: 'upvote' })
        const downvoteButton = screen.getByRole('button', { name: 'downvote' })

        expect(downvoteButton).toHaveTextContent('0')

        fireEvent.click(upvoteButton)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'upvote' })).toHaveTextContent('1')
        })
        expect(screen.getByRole('button', { name: 'downvote' })).toHaveTextContent('0')

        fireEvent.click(screen.getByRole('button', { name: 'upvote' }))
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'upvote' })).toHaveTextContent('0')
        })

        fireEvent.click(screen.getByRole('button', { name: 'downvote' }))
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'downvote' })).toHaveTextContent('1')
        })

        fireEvent.click(screen.getByRole('button', { name: 'upvote' }))
        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'upvote' })).toHaveTextContent('1')
            expect(screen.getByRole('button', { name: 'downvote' })).toHaveTextContent('0')
        })
    })
})
