"use client"

import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
import Model from './Model'
import { Center, OrbitControls, Text } from '@react-three/drei'
import MainLoading from './MainLoading'

function Scene() {
  return (
    <>        
    <Suspense fallback={<MainLoading />}>

    <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>

        <directionalLight position={[5, 5, 5]} intensity={4} />
            <Center>
                <Model />
                {/* <RayExample /> */}
            </Center>
            {/* <Ball /> */}
    
        <OrbitControls 
            target={[0, 0, 0]} 
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={100}
        />
    </Canvas>
    </Suspense>
    </>
  )
}

export default Scene