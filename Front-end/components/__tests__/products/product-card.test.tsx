import { fireEvent, render, screen } from '@testing-library/react'
import { ProductCard } from '../../products/product-card'
import { mockProducts } from '../../test-fixtures/products'

jest.mock('@/lib/favorites', () => ({
  productsFavorites: [],
}))

describe('ProductCard', () => {
  it('renders product details and detail link slug', () => {
    const product = mockProducts[0]

    render(
      <ProductCard
        productIndex={0}
        product={product}
        onFavoriteSelect={jest.fn()}
        onFavoriteDeselect={jest.fn()}
      />
    )

    expect(screen.getByText(product.brand)).toBeInTheDocument()
    expect(screen.getAllByText(product.name).length).toBeGreaterThan(0)

    const detailLinks = screen.getAllByRole('link', { name: product.name })
    expect(detailLinks.some((link) => link.getAttribute('href') === '/descubrir/hydra-cream')).toBe(true)
  })

  it('calls onFavoriteSelect when toggled from non-favorite state', () => {
    const onFavoriteSelect = jest.fn()
    const onFavoriteDeselect = jest.fn()

    render(
      <ProductCard
        productIndex={3}
        product={mockProducts[1]}
        onFavoriteSelect={onFavoriteSelect}
        onFavoriteDeselect={onFavoriteDeselect}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    expect(onFavoriteSelect).toHaveBeenCalledWith(3)
    expect(onFavoriteDeselect).not.toHaveBeenCalled()
  })
})
