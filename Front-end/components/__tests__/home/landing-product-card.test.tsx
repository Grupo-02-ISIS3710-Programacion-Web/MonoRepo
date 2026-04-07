import { render, screen } from '@testing-library/react'
import LandingProductCard from '../../home/landingProductCard'
import { mockProducts } from '../../test-fixtures/products'
import { getTranslations } from 'next-intl/server'

jest.mock('next-intl/server', () => ({
    getTranslations: jest.fn(),
}))

describe('home/LandingProductCard', () => {
    it('renders product information and translated CTA', async () => {
        ; (getTranslations as jest.Mock).mockResolvedValue((key: string) => `ProductCard.${key}`)

        const ui = await LandingProductCard({ product: mockProducts[0] })
        render(ui)

        expect(screen.getByText('Brand A')).toBeInTheDocument()
        expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'ProductCard.viewDetails' })).toBeInTheDocument()
    })
})
