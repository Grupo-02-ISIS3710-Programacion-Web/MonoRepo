import { fireEvent, render, screen } from '@testing-library/react'
import SearchBar from '../../routines/SearchBar'
import { mockProducts } from '../../test-fixtures/products'

jest.mock('@/lib/api', () => ({
  getProducts: jest.fn(() => mockProducts),
}))

describe('SearchBar', () => {
  it('renders dynamic category buttons and all products button', () => {
    render(
      <SearchBar
        searchTerm=""
        selectedCategory={null}
        onSearchChange={jest.fn()}
        onCategoryChange={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'SearchBar.allProducts' })).toBeInTheDocument()
  })

  it('calls callbacks on search and category change', () => {
    const onSearchChange = jest.fn()
    const onCategoryChange = jest.fn()

    render(
      <SearchBar
        searchTerm=""
        selectedCategory={null}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('SearchBar.placeholder'), {
      target: { value: 'hydra' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'SearchBar.allProducts' }))

    expect(onSearchChange).toHaveBeenCalledWith('hydra')
    expect(onCategoryChange).toHaveBeenCalledWith(null)
  })
})
