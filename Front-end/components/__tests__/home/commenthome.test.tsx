import { render, screen } from '@testing-library/react'
import CommentHome from '../../home/commenthome'

describe('home/CommentHome', () => {
    it('renders content and community CTA', () => {
        render(<CommentHome />)

        expect(screen.getByText('CommentHome.title')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'CommentHome.visitCommunity' })).toHaveAttribute('href', '/community')
        expect(screen.getByPlaceholderText('CommentHome.emailPlaceholder')).toBeInTheDocument()
    })
})
