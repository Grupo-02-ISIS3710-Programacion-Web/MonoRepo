import { render, screen } from '@testing-library/react'
import SeccionInfoHome from '../../home/seccioInfoHome'

describe('home/SeccionInfoHome', () => {
    it('renders hero texts and navigation links', () => {
        render(<SeccionInfoHome />)

        expect(screen.getByText('SeccionInfoHome.badge')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'SeccionInfoHome.register' })).toHaveAttribute('href', '/register')
        expect(screen.getByRole('link', { name: 'SeccionInfoHome.explorer' })).toHaveAttribute('href', '/descubrir')
        expect(screen.getByText('50k+')).toBeInTheDocument()
    })
})
