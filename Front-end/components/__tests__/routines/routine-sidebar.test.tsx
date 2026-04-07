import { render, screen } from '@testing-library/react'
import RoutineSidebar from '../../routines/RoutineSidebar'
import { mockProducts } from '../../test-fixtures/products'

describe('RoutineSidebar', () => {
  it('renders summary content with selected products', () => {
    render(
      <RoutineSidebar
        addedProducts={new Set(['p3'])}
        products={mockProducts}
        onRemoveProduct={jest.fn()}
      />
    )

    expect(screen.getByText('Cleanser Plus')).toBeInTheDocument()
    expect(screen.getByText('RoutineSummary.productsCount')).toBeInTheDocument()
  })
})
