import React from 'react'
import {Slider} from "@heroui/react";

function HitExitVelocity({exitVelocity, setExitVelocity}) {
  return (
    <div className=' flex h-full justify-center items-center'>
    <Slider
      className="max-w-md max-h-[120px]"
      classNames={{
        track: 'bg-white'
      }}
      value={exitVelocity}
      onChange={(value) => setExitVelocity(value)}
      defaultValue={80}
      maxValue={120}
      size='sm'
      minValue={40}
      step={5}
      orientation='vertical'
    />    
    </div>
  )
}

export default HitExitVelocity