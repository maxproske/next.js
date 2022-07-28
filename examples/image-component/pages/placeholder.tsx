import Image from 'next/image'
import ViewSource from '../components/view-source'
import mountains from '../public/mountains.jpg'

export default function PlaceholderBlur() {
  return (
    <div>
      <ViewSource pathname="pages/placeholder.tsx" />
      <h1>Image Component With Placeholder Blur</h1>
      <Image
        alt="Mountains"
        src={mountains}
        placeholder="blur"
        width={700}
        height={475}
      />
    </div>
  )
}
