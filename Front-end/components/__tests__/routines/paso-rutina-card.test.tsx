import { fireEvent, render, screen } from '@testing-library/react'
import PasoRutinaCard from '../../routines/PasoRutinaCard'
import { mockProducts } from '../../test-fixtures/products'

jest.mock('@/components/routines/CardProducto', () => ({
  __esModule: true,
  default: ({ product }: any) => <div>card-{product.name}</div>,
}))

describe('PasoRutinaCard', () => {
  it('renders step information and triggers movement/delete actions', () => {
    const onMoveUp = jest.fn()
    const onMoveDown = jest.fn()
    const onRemove = jest.fn()

    const register = jest.fn((name: string) => ({ name }))

    render(
      <PasoRutinaCard
        index={1}
        totalSteps={3}
        product={mockProducts[0]}
        register={register as any}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />
    )

    expect(screen.getByText('GuardarRutina.steps.stepNumber')).toBeInTheDocument()
    expect(screen.getByText('card-Hydra Cream')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mover paso arriba' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mover paso abajo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar paso' }))

    expect(onMoveUp).toHaveBeenCalledTimes(1)
    expect(onMoveDown).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
