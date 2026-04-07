import { fireEvent, render, screen } from '@testing-library/react'
import RoutineContent from '../../profile/routineContent'
import { mockRoutines } from '../../test-fixtures/routines'
import { mockProducts } from '../../test-fixtures/products'
import { toast } from 'sonner'

jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(() => mockProducts),
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}))

describe('RoutineContent', () => {
  it('renders routines and resolves product names for steps', () => {
    render(<RoutineContent filteredRoutines={mockRoutines} />)

    expect(screen.getByText('Morning Basic')).toBeInTheDocument()
    expect(screen.getByText('Night Repair')).toBeInTheDocument()
    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
    expect(screen.getByText('Cleanser Plus')).toBeInTheDocument()
  })

  it('renders fallback label when product is not found', () => {
    render(
      <RoutineContent
        filteredRoutines={[
          {
            ...mockRoutines[0],
            id: 'r-missing',
            steps: [{ id: 'sx', order: 1, product: 'not-found' }],
          },
        ]}
      />
    )

    expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
  })

  it('deletes a routine when confirmation is accepted', () => {
    render(<RoutineContent filteredRoutines={[mockRoutines[0]]} />)

    fireEvent.click(screen.getByTitle('RoutineContent.deleteDialog.title'))
    fireEvent.click(screen.getByRole('button', { name: 'RoutineContent.deleteDialog.delete' }))

    expect(screen.queryByText('Morning Basic')).not.toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledWith('Morning Basic RoutineContent.deleted')
  })
})
