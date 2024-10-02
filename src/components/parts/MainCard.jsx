import React from 'react'
import { Button } from '../ui/button'
import { ArrowBigDownIcon, ArrowRight } from 'lucide-react'

export default function MainCard() {
  return (
    <div className='pt-20 pb-20 m-3 flex flex-col text-center justify-center'>
        <div className='p-2 text-xl font-bold'>MedBot</div>
        <div className='p-2 text-5xl'>
        <div>Get answers. Find inspiration.</div>
        <div> Be more productive.</div>
        </div>
        <div className='p-3 text-xl'>
        <div>Free to use. Easy to try. Just ask and MedBot can</div>
        <div>help with writing, learning, brainstorming, and more.</div>
        </div>
        <div className='p-2 gap-2'>
            <Button>Start Now <ArrowRight/></Button>
            <Button variant="link">Download Now <ArrowBigDownIcon/></Button>
        </div>
    </div>
  )
}
