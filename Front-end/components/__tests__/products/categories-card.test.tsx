import { render, screen } from '@testing-library/react'
import { CategoriesCard } from '../../products/categories-card'
import { Category } from '../../../types/product'

describe('CategoriesCard', () => {
  it('highlights selected category and exposes category links', () => {
    render(<CategoriesCard currentCategory={Category.HIDRATACION} />)

    expect(screen.getAllByText('Categories.hidratacion.label').length).toBeGreaterThan(0)

    const allCategoryLinks = screen.getAllByRole('link', { name: /Categories\.ALL\.label|CategoriesCard\.categories\.ALL\.label/i })
    expect(allCategoryLinks.length).toBeGreaterThan(0)
    expect(allCategoryLinks[0]).toHaveAttribute('href', '/descubrir')

    const hydrationLinks = screen.getAllByRole('link', {
      name: /Categories\.hidratacion\.label|CategoriesCard\.categories\.hidratacion\.label/i,
    })
    expect(hydrationLinks.length).toBeGreaterThan(0)
    expect(hydrationLinks[0]).toHaveAttribute('href', expect.stringContaining('?category=hidratacion'))
  })
})
