import { fireEvent, render, screen } from '@testing-library/react'
import ComunidadPage from './page'
import { getRoutines } from '@/lib/routine'
import { getUsers } from '@/lib/api'
import { SkinType } from '@/types/product'

jest.mock('@/lib/routine', () => ({
    getRoutines: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
    getUsers: jest.fn(),
}))

jest.mock('@/i18n/navigation', () => ({
    Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

jest.mock('@/components/community/RoutineCard', () => ({
    __esModule: true,
    default: ({ post, onVote, tRoutine }: any) => (
        <article data-testid="routine-card">
            <h3 data-testid="routine-card-title">{post.title}</h3>
            {onVote && tRoutine ? (
                <>
                    <button aria-label={tRoutine('upvote')} onClick={() => onVote(post.id, 'up')}>
                        {post.upvotes}
                    </button>
                    <button aria-label={tRoutine('downvote')} onClick={() => onVote(post.id, 'down')}>
                        {post.downvotes}
                    </button>
                </>
            ) : null}
        </article>
    ),
}))

describe('app/[locale]/community/page', () => {
    beforeEach(() => {
        ; (getUsers as jest.Mock).mockReturnValue([
            { id: 'u1', name: 'Sarah J.', avatarUrl: 'https://example.com/u1.png' },
        ])

            ; (getRoutines as jest.Mock).mockReturnValue([
                {
                    id: 'r1',
                    userId: 'u1',
                    name: 'Morning Routine',
                    description: 'Daily routine',
                    skinType: SkinType.NORMAL,
                    upvotes: ['u2'],
                    downvotes: [],
                    comments: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }, { id: 'c4' }, { id: 'c5' }, { id: 'c6' }],
                    views: 1500,
                    publishedAt: '2026-03-14T11:05:00.000Z',
                },
                {
                    id: 'r2',
                    userId: 'u1',
                    name: 'Night Routine',
                    description: 'Night hydration',
                    skinType: SkinType.SECA,
                    upvotes: [],
                    downvotes: [],
                    comments: [{ id: 'c7' }],
                    views: 800,
                    publishedAt: '2026-03-16T11:05:00.000Z',
                },
                {
                    id: 'r3',
                    userId: 'u1',
                    name: 'Weekly Exfoliation',
                    description: 'Weekly exfoliation routine',
                    skinType: SkinType.MIXTA,
                    upvotes: ['u2', 'u3', 'u4', 'u5'],
                    downvotes: ['u6'],
                    comments: [{ id: 'c8' }, { id: 'c9' }, { id: 'c10' }],
                    views: 1200,
                    publishedAt: '2026-03-15T11:05:00.000Z',
                },
            ])
    })

    const getDesktopTitles = () =>
        screen
            .getAllByTestId('routine-card-title')
            .slice(0, 3)
            .map((node) => node.textContent)

    it('renders forum sections and routine cards', () => {
        render(<ComunidadPage />)

        expect(screen.getAllByText('CommunityPage.forumTitle').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Morning Routine').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Night Routine').length).toBeGreaterThan(0)
        expect(screen.getAllByRole('link', { name: 'CommunityPage.createPost' }).length).toBeGreaterThan(0)
    })

    it('reorders list when switching tabs', () => {
        render(<ComunidadPage />)

        expect(getDesktopTitles()).toEqual(['Night Routine', 'Weekly Exfoliation', 'Morning Routine'])

        fireEvent.click(screen.getAllByRole('button', { name: 'CommunityPage.tabs.mostCommented' })[0])
        expect(getDesktopTitles()).toEqual(['Morning Routine', 'Weekly Exfoliation', 'Night Routine'])

        fireEvent.click(screen.getAllByRole('button', { name: 'CommunityPage.tabs.mostVoted' })[0])
        expect(getDesktopTitles()).toEqual(['Weekly Exfoliation', 'Morning Routine', 'Night Routine'])
    })

    it('filters routines by selected skin type', () => {
        render(<ComunidadPage />)

        fireEvent.click(screen.getAllByRole('button', { name: /SkinTypes.seca/ })[0])

        const filteredTitles = screen
            .getAllByTestId('routine-card-title')
            .map((node) => node.textContent)

        expect(filteredTitles.every((title) => title === 'Night Routine')).toBe(true)
    })

    it('updates vote count when upvote is clicked', () => {
        render(<ComunidadPage />)

        const upvoteButton = screen.getAllByRole('button', { name: 'RoutineDetail.upvote' })[0]

        expect(upvoteButton).toHaveTextContent('0')

        fireEvent.click(upvoteButton)

        expect(screen.getAllByRole('button', { name: 'RoutineDetail.upvote' })[0]).toHaveTextContent('1')
    })
})
