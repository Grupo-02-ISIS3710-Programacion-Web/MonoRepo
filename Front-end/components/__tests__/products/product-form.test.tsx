import { fireEvent, render, screen } from '@testing-library/react'
import ProductForm from '../../products/product-form'

const toastSuccess = jest.fn()

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}))

jest.mock('@/components/ui/select', () => {
  const React = require('react')
  const Select = ({ onValueChange, children }: any) => (
    <div>
      <button type="button" onClick={() => onValueChange?.('hidratacion')}>
        select-primary-category
      </button>
      {children}
    </div>
  )
  const Passthrough = ({ children }: any) => <div>{children}</div>
  return {
    Select,
    SelectContent: Passthrough,
    SelectItem: ({ children }: any) => <div>{children}</div>,
    SelectTrigger: Passthrough,
    SelectValue: Passthrough,
  }
})

jest.mock('@/components/ui/combobox', () => {
  const React = require('react')
  const Combobox = ({ items = [], multiple, onValueChange, disabled, children }: any) => (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (items.length === 0) return
          onValueChange?.(multiple ? [items[0]] : items[0])
        }}
      >
        select-combobox
      </button>
      {children}
    </div>
  )

  const Passthrough = ({ children, ...props }: any) => <div {...props}>{children}</div>

  return {
    Combobox,
    ComboboxChip: Passthrough,
    ComboboxChips: Passthrough,
    ComboboxChipsInput: (props: any) => <input {...props} />,
    ComboboxContent: Passthrough,
    ComboboxInput: (props: any) => <input {...props} />,
    ComboboxItem: Passthrough,
    ComboboxList: Passthrough,
    ComboboxTrigger: Passthrough,
    ComboboxValue: ({ children }: any) => (typeof children === 'function' ? children([]) : children),
    useComboboxAnchor: () => ({ current: null }),
  }
})

describe('ProductForm', () => {
  beforeEach(() => {
    toastSuccess.mockClear()
  })

  it('does not trigger success toast when required data is still invalid', () => {
    render(<ProductForm />)

    fireEvent.change(screen.getByPlaceholderText('CreateProductPage.productNamePlaceholder'), {
      target: { value: 'Hydra Valid Product' },
    })
    fireEvent.change(screen.getByPlaceholderText('La Roche Posay'), {
      target: { value: 'Brand Z' },
    })
    fireEvent.change(screen.getByPlaceholderText('CreateProductPage.descriptionPlaceholder'), {
      target: { value: 'Long enough product description' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'select-primary-category' }))

    const comboboxButtons = screen.getAllByRole('button', { name: 'select-combobox' })
    comboboxButtons.forEach((button) => fireEvent.click(button))

    const ingredientsInput = screen.getByPlaceholderText('CreateProductPage.ingredientsPlaceholder')
    fireEvent.change(ingredientsInput, { target: { value: 'niacinamide, glycerin' } })
    fireEvent.blur(ingredientsInput)

    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://example.com/image.jpg' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('resets edited values when reset is clicked', () => {
    render(<ProductForm />)

    const nameInput = screen.getByPlaceholderText('CreateProductPage.productNamePlaceholder')
    fireEvent.change(nameInput, { target: { value: 'Temp Product' } })

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(nameInput).toHaveValue('')
  })
})
