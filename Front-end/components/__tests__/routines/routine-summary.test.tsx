import { fireEvent, render, screen } from '@testing-library/react'
import RoutineSummary from '../../routines/RoutineSummary'
import { mockProducts } from '../../test-fixtures/products'

describe('RoutineSummary', () => {
  it('shows empty state when no products are selected', () => {
    render(<RoutineSummary addedProducts={new Set()} products={mockProducts} />)

    expect(screen.getByText('RoutineSummary.empty')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders selected products, remove action and save link with query', () => {
    const onRemove = jest.fn()
    render(
      <RoutineSummary
        addedProducts={new Set(['p1', 'p2'])}
        products={mockProducts}
        onRemoveProduct={onRemove}
      />
    )

    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
    expect(screen.getByText('Repair Balm')).toBeInTheDocument()

    const removeButtons = screen.getAllByRole('button')
    fireEvent.click(removeButtons[0])

    expect(onRemove).toHaveBeenCalledWith('p1')

    const saveLink = screen.getByRole('link')
    expect(saveLink).toHaveAttribute('href', expect.stringContaining('/routine/guardar'))
    expect(saveLink).toHaveAttribute('href', expect.stringContaining('products=p1%2Cp2'))
  })
})
