import { act, fireEvent, render, screen } from '@testing-library/react'
import GridProductos from '../../routines/GridProductos'
import { mockProducts } from '../../test-fixtures/products'

const toastSuccess = jest.fn()
const toastInfo = jest.fn()

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    info: (...args: unknown[]) => toastInfo(...args),
  },
}))

jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(() => mockProducts),
}))

jest.mock('@/components/routines/SearchBar', () => ({
  __esModule: true,
  default: ({ onSearchChange, onCategoryChange }: any) => (
    <div>
      <button onClick={() => onSearchChange('hydra')}>search-hydra</button>
      <button onClick={() => onCategoryChange('hidratacion')}>filter-hydration</button>
      <button onClick={() => onCategoryChange(null)}>filter-all</button>
    </div>
  ),
}))

jest.mock('@/components/routines/CardProducto', () => ({
  __esModule: true,
  default: ({ product, onAddToRoutine }: any) => (
    <div>
      <span>{product.name}</span>
      <button onClick={onAddToRoutine}>add-{product.id}</button>
    </div>
  ),
}))

jest.mock('@/components/routines/RoutineSidebar', () => ({
  __esModule: true,
  default: ({ addedProducts }: any) => <div>sidebar-{addedProducts.size}</div>,
}))

jest.mock('@/components/routines/RoutineDrawer', () => ({
  __esModule: true,
  default: ({ addedProducts }: any) => <div>drawer-{addedProducts.size}</div>,
}))

describe('GridProductos', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    toastSuccess.mockClear()
    toastInfo.mockClear()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('loads products asynchronously and filters by search and category', async () => {
    render(<GridProductos />)

    expect(screen.getByText('GridProductos.loading')).toBeInTheDocument()

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
    expect(screen.getByText('Repair Balm')).toBeInTheDocument()

    fireEvent.click(screen.getByText('search-hydra'))
    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
    expect(screen.queryByText('Repair Balm')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('filter-all'))
    fireEvent.click(screen.getByText('filter-hydration'))

    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
    expect(screen.queryByText('Cleanser Plus')).not.toBeInTheDocument()
  })

  it('handles add duplicate and remove flows through state', async () => {
    render(<GridProductos />)

    await act(async () => {
      jest.advanceTimersByTime(1000)
    })

    fireEvent.click(screen.getByText('add-p1'))
    fireEvent.click(screen.getByText('add-p1'))

    expect(toastSuccess).toHaveBeenCalled()
    expect(toastInfo).toHaveBeenCalled()
    expect(screen.getByText('sidebar-1')).toBeInTheDocument()
    expect(screen.getByText('drawer-1')).toBeInTheDocument()
  })
})
