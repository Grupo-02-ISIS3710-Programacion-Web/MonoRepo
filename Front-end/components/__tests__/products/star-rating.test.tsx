import { render, screen } from '@testing-library/react'
import StarRating from '../../products/star-rating'

describe('StarRating', () => {
  it('renders fallback when rating is undefined', () => {
    render(<StarRating rating={undefined} />)

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('renders rating and review count', () => {
    render(<StarRating rating={4.5} reviewCount={120} />)

    expect(screen.getByText('(4.5)')).toBeInTheDocument()
    expect(screen.getByText('(120)')).toBeInTheDocument()
  })
})
