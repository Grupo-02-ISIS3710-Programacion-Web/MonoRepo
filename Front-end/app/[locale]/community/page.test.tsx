import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ComunidadPage from './page'
import { getUsers } from '@/lib/api'
import { fetchRoutines, upvoteRoutine, downvoteRoutine, removeUpvote, removeDownvote } from '@/lib/api-client'
import { SkinType } from '@/types/product'

jest.mock('@/lib/api-client', () => ({
    fetchRoutines: jest.fn(),
    upvoteRoutine: jest.fn(() => Promise.resolve()),
    downvoteRoutine: jest.fn(() => Promise.resolve()),
    removeUpvote: jest.fn(() => Promise.resolve()),
    removeDownvote: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/lib/api', () => ({
    getUsers: jest.fn(),
    getUserById: jest.fn(() => ({ id: 'u1', name: 'Sarah J.', avatarUrl: 'https://example.com/u1.png' })),
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

jest.mock('sonner', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
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
        ;(getUsers as jest.Mock).mockReturnValue([
            { id: 'u1', name: 'Sarah J.', avatarUrl: 'https://example.com/u1.png' },
        ])

        ;(fetchRoutines as jest.Mock).mockResolvedValue({
            routines: [
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
            ],
            totalPages: 1,
        })
    })

    const getDesktopTitles = async () => {
        const titles = await screen.findAllByTestId('routine-card-title')
        return titles
            .slice(0, 3)
            .map((node) => node.textContent)
    }

    it('renders forum sections and routine cards', async () => {
        render(<ComunidadPage />)

        await waitFor(() => {
            expect(screen.getAllByText('forumTitle').length).toBeGreaterThan(0)
        })
        const titles = await screen.findAllByText('Morning Routine')
        expect(titles.length).toBeGreaterThan(0)
        expect(screen.getAllByText('Night Routine').length).toBeGreaterThan(0)
        expect(screen.getAllByRole('link', { name: /createPost/ }).length).toBeGreaterThan(0)
    })

    it('reorders list when switching tabs', async () => {
        render(<ComunidadPage />)

        const titles1 = await getDesktopTitles()
        expect(titles1).toEqual(['Night Routine', 'Weekly Exfoliation', 'Morning Routine'])

        fireEvent.click(screen.getAllByRole('button', { name: /tabs.mostCommented/ })[0])
        await waitFor(async () => {
            const titles = await screen.findAllByTestId('routine-card-title')
            const first3 = titles.slice(0, 3).map(t => t.textContent)
            expect(first3).toEqual(['Morning Routine', 'Weekly Exfoliation', 'Night Routine'])
        }, { timeout: 3000 })

        fireEvent.click(screen.getAllByRole('button', { name: /tabs.mostVoted/ })[0])
        await waitFor(async () => {
            const titles = await screen.findAllByTestId('routine-card-title')
            const first3 = titles.slice(0, 3).map(t => t.textContent)
            expect(first3).toEqual(['Weekly Exfoliation', 'Morning Routine', 'Night Routine'])
        }, { timeout: 3000 })
    })

    it('filters routines by selected skin type', async () => {
        render(<ComunidadPage />)

        await screen.findAllByTestId('routine-card-title')

        fireEvent.click(screen.getAllByRole('button', { name: /seca/ })[0])

        await waitFor(async () => {
            const filteredTitles = (await screen.findAllByTestId('routine-card-title'))
                .map((node) => node.textContent)

            expect(filteredTitles.every((title) => title === 'Night Routine')).toBe(true)
        })
    })

    it('updates vote count when upvote is clicked', async () => {
        render(<ComunidadPage />)

        const upvoteButtons = await screen.findAllByRole('button', { name: 'upvote' })
        const upvoteButton = upvoteButtons[0]

        expect(upvoteButton).toHaveTextContent('0')

        fireEvent.click(upvoteButton)

        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: 'upvote' })[0]).toHaveTextContent('1')
        })
    })
})
