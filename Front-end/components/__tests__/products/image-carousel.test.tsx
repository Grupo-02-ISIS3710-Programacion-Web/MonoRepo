import { fireEvent, render, screen } from '@testing-library/react'
import ImageCarousel from '../../products/image-carousel'

describe('ImageCarousel', () => {
  const images = ['https://example.com/1.jpg', 'https://example.com/2.jpg']

  it('renders current image alt text', () => {
    render(
      <ImageCarousel
        imagesURL={images}
        currentIndex={1}
        altText="Producto"
        onNextImage={jest.fn()}
        onPreviousImage={jest.fn()}
      />
    )

    expect(screen.getByAltText('Producto')).toHaveAttribute('src', expect.stringContaining('2.jpg'))
  })

  it('calls callbacks when navigation buttons are clicked', () => {
    const onNext = jest.fn()
    const onPrevious = jest.fn()

    render(
      <ImageCarousel
        imagesURL={images}
        currentIndex={0}
        altText="Producto"
        onNextImage={onNext}
        onPreviousImage={onPrevious}
      />
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('does not show arrows when there is a single image', () => {
    render(
      <ImageCarousel
        imagesURL={[images[0]]}
        currentIndex={0}
        altText="Producto"
        onNextImage={jest.fn()}
        onPreviousImage={jest.fn()}
      />
    )

    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
