import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FilterHeader } from '../../products/filter-header'

jest.mock('@/components/ui/combobox', () => {
  const React = require('react')
  const Combobox = ({ items = [], multiple, onValueChange, children }: any) => (
    <div>
      <button
        type="button"
        data-testid="mock-combobox-select"
        onClick={() => {
          if (items.length === 0) return
          onValueChange?.(multiple ? [items[0]] : items[0])
        }}
      >
        select
      </button>
      {children}
    </div>
  )

  const Passthrough = ({ children, ...props }: any) => <div {...props}>{children}</div>
  return {
    Combobox,
    ComboboxInput: Passthrough,
    ComboboxItem: Passthrough,
    ComboboxList: Passthrough,
    ComboboxContent: Passthrough,
  }
})

describe('FilterHeader', () => {
  it('emits initial empty filters', async () => {
    const onFiltersChange = jest.fn()

    render(
      <FilterHeader
        brands={['brand-a']}
        ingredients={['niacinamide']}
        productCount={10}
        onFiltersChange={onFiltersChange}
      />
    )

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenCalledWith({
        skinTypes: [],
        brands: [],
        ingredients: [],
      })
    })
  })

  it('updates filters from combobox interactions and supports clear action', async () => {
    const onFiltersChange = jest.fn()

    render(
      <FilterHeader
        brands={['brand-a']}
        ingredients={['niacinamide']}
        productCount={10}
        onFiltersChange={onFiltersChange}
      />
    )

    const comboButtons = screen.getAllByTestId('mock-combobox-select')
    comboButtons.slice(0, 3).forEach((button) => fireEvent.click(button))

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenLastCalledWith({
        skinTypes: ['normal'],
        brands: ['brand-a'],
        ingredients: ['niacinamide'],
      })
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'FilterHeader.clearFilters' })[0])

    await waitFor(() => {
      expect(onFiltersChange).toHaveBeenLastCalledWith({
        skinTypes: [],
        brands: [],
        ingredients: [],
      })
    })
  })
})
