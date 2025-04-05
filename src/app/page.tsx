import React from 'react'
import dynamic from 'next/dynamic'
import { useModelStore } from '@/zustand/modelStore'
import TrajectoryTable from '@/components/TrajectoryTable'
import SimulationConsole from '@/components/SimulationConsole'
import MainLoading from '@/components/MainLoading'

const Scene = dynamic(() => import("@/components/Scene"), {ssr: false})

function page() {

  return (
    <div className=' h-screen bg-slate-200'>
      <SimulationConsole />
      <TrajectoryTable />
      <Scene />
    </div> 
  )
}

export default page
