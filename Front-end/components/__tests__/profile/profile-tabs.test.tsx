import { fireEvent, render, screen } from '@testing-library/react'
import ProfileTabs from '../../profile/profileTabs'

describe('ProfileTabs', () => {
  it('calls setActiveTab when a tab is clicked', () => {
    const setActiveTab = jest.fn()
    render(<ProfileTabs activeTab="routine" setActiveTab={setActiveTab} />)

    fireEvent.click(screen.getByRole('button', { name: /ProfileTabs.myFavorites/i }))

    expect(setActiveTab).toHaveBeenCalledWith('favorites')
  })

  it('renders routine controls for routine tab', () => {
    render(<ProfileTabs activeTab="routine" setActiveTab={jest.fn()} />)

    expect(screen.getByRole('button', { name: 'ProfileTabs.morning' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ProfileTabs.evening' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ProfileTabs.addStep' })).toBeInTheDocument()
  })

  it('renders favorites search controls for favorites tab', () => {
    render(<ProfileTabs activeTab="favorites" setActiveTab={jest.fn()} />)

    expect(screen.getByPlaceholderText('ProfileTabs.searchProducts')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ProfileTabs.discoverMore' })).toBeInTheDocument()
  })
})
