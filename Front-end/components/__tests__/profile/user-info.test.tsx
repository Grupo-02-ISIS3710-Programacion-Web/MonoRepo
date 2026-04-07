import { fireEvent, render, screen } from '@testing-library/react'
import UserInfo from '../../profile/userInfo'

describe('UserInfo', () => {
  const props = {
    name: 'Manuela',
    city: 'Bogota',
    skinType: 'Mixta',
    reviews: 12,
    posts: 4,
    bio: 'Skincare lover',
    photo: 'https://example.com/u.jpg',
  }

  it('renders initial profile information', () => {
    render(<UserInfo {...props} />)

    expect(screen.getByText('Manuela')).toBeInTheDocument()
    expect(screen.getByText('Bogota')).toBeInTheDocument()
    expect(screen.getByText('Mixta')).toBeInTheDocument()
    expect(screen.getByText('Skincare lover')).toBeInTheDocument()
  })

  it('opens modal, saves fields and closes it', () => {
    render(<UserInfo {...props} />)

    fireEvent.click(screen.getByRole('button', { name: /UserInfo.editProfile/i }))

    const nameInput = screen.getByDisplayValue('Manuela')
    fireEvent.change(nameInput, { target: { value: 'Ana' } })

    fireEvent.click(screen.getByRole('button', { name: 'UserInfo.save' }))

    expect(screen.queryByRole('button', { name: 'UserInfo.save' })).not.toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
  })
})
