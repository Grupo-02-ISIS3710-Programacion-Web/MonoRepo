import { render, screen } from '@testing-library/react'
import RoutineDrawer from '../../routines/RoutineDrawer'
import { mockProducts } from '../../test-fixtures/products'

jest.mock('@/components/ui/drawer', () => {
  const React = require('react')
  return {
    Drawer: ({ children }: any) => <div data-testid="mock-drawer">{children}</div>,
    DrawerTrigger: ({ children }: any) => <div>{children}</div>,
    DrawerContent: ({ children }: any) => <div>{children}</div>,
  }
})

describe('RoutineDrawer', () => {
  it('renders trigger and summary content', () => {
    render(
      <RoutineDrawer
        addedProducts={new Set(['p1'])}
        products={mockProducts}
        onRemoveProduct={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /RoutineDrawer\.viewRoutine/i })).toBeInTheDocument()
    expect(screen.getByText('Hydra Cream')).toBeInTheDocument()
  })
})
