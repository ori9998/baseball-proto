import React from 'react'
import {Spinner} from "@heroui/spinner";

function MainLoading() {
  return (
    <div className=' w-full h-full flex flex-col items-center justify-center'>
        <Spinner size="md" variant='wave' />
        <p className=' text-[24px] font-bold mt-4'>Downloading Model...</p>
    </div>
  )
}

export default MainLoading