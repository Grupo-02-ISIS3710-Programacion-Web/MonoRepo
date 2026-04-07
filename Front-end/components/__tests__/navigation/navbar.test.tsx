import { fireEvent, render, screen } from '@testing-library/react'
import NavBar, { NavBarDesktop, NavBarMobile } from '../../NavBar'

const pushMock = jest.fn()

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/lib/hooks/use-auth-session', () => ({
  useAuthSession: () => ({
    isLoggedIn: false,
    logout: jest.fn(),
    user: null,
  }),
}))

jest.mock('@/components/ui/sheet', () => {
  const React = require('react')
  return {
    Sheet: ({ children }: any) => <div>{children}</div>,
    SheetTrigger: ({ children }: any) => <div>{children}</div>,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <div>{children}</div>,
  }
})

describe('NavBar', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it('renders desktop and mobile wrappers in the root component', () => {
    render(<NavBar />)

    expect(screen.getAllByText('Skin4All').length).toBeGreaterThan(0)
  })

  it('renders desktop auth actions when logged out and user actions when logged in', () => {
    const { rerender } = render(<NavBarDesktop isLoggedIn={false} />)

    expect(screen.getByRole('button', { name: 'register' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'login' })).toBeInTheDocument()

    rerender(<NavBarDesktop isLoggedIn />)

    expect(screen.getAllByRole('button').length).toBeGreaterThan(2)
  })

  it('renders mobile menu links', () => {
    render(<NavBarMobile />)

    expect(screen.getAllByRole('link', { name: 'home' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'discover' }).length).toBeGreaterThan(0)
  })

  it('navigates to discovery page with query when desktop search is submitted', () => {
    render(<NavBarDesktop isLoggedIn={false} />)

    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), {
      target: { value: 'hidra' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'searchPlaceholder' }))

    expect(pushMock).toHaveBeenCalledWith('/descubrir?q=hidra')
  })

  it('navigates to discovery without query when desktop search is empty', () => {
    render(<NavBarDesktop isLoggedIn={false} />)

    fireEvent.click(screen.getByRole('button', { name: 'searchPlaceholder' }))

    expect(pushMock).toHaveBeenCalledWith('/descubrir')
  })

  it('opens mobile search and submits query', () => {
    render(<NavBarMobile />)

    fireEvent.click(screen.getByRole('button', { name: 'openSearch' }))
    fireEvent.change(screen.getByPlaceholderText('searchPlaceholder'), {
      target: { value: 'acne' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'searchPlaceholder' }))

    expect(pushMock).toHaveBeenCalledWith('/descubrir?q=acne')
  })
})
