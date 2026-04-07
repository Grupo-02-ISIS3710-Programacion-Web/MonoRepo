import { fireEvent, render, screen } from '@testing-library/react'
import CardProducto from '../../routines/CardProducto'
import { mockProducts } from '../../test-fixtures/products'

describe('CardProducto', () => {
  it('renders product core information', () => {
    render(<CardProducto product={mockProducts[0]} />)

    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
    expect(screen.getByText(/Brand A/i)).toBeInTheDocument()
    expect(screen.getByText('HYDRATION')).toBeInTheDocument()
  })

  it('calls onAddToRoutine when action is clicked', () => {
    const onAddToRoutine = jest.fn()
    render(<CardProducto product={mockProducts[1]} onAddToRoutine={onAddToRoutine} />)

    fireEvent.click(screen.getByRole('button', { name: 'CardProducto.addToRoutine' }))

    expect(onAddToRoutine).toHaveBeenCalledTimes(1)
  })

  it('hides action button when showButton is false', () => {
    render(<CardProducto product={mockProducts[0]} showButton={false} />)

    expect(screen.queryByRole('button', { name: 'CardProducto.addToRoutine' })).not.toBeInTheDocument()
  })
})
