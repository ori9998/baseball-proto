"use client"
import React, { useEffect, useState } from 'react'
import HitPosition from './SingleHitSimulation.tsx/HitPosition'
import HitLaunchAngle from './SingleHitSimulation.tsx/HitLaunchAngle'
import HitPower from './SingleHitSimulation.tsx/HitExitVelocity'
import { RiResetLeftLine } from "react-icons/ri";
import HitDirection from './SingleHitSimulation.tsx/HitDirectionAngle'
import HitExitVelocity from './SingleHitSimulation.tsx/HitExitVelocity'
import HitDirectionAngle from './SingleHitSimulation.tsx/HitDirectionAngle'
import { MathUtils, Vector3 } from 'three'
import { useModelStore } from '@/zustand/modelStore'

function SimulationConsole() {
    const [pos, setPos] = useState([4, 5])
    const [launchAngle, setLaunchAngle] = useState(45)
    const [directionAngle, setDirectionAngle] = useState(45)
    const [exitVelocity, setExitVelocity] = useState(80)
    const triggerBall = useModelStore((state) => state.triggerBall)
    const setTrajectoryArrLandingPosArr = useModelStore((state) => state.setTrajectoryArrLandingPosArr)
    const runSimulation = useModelStore((state) => state.runSimulation)

    const convertPosToStartPosition = () => {
        const x = pos[0]
        const y = pos[1]

        const xOneBoxLength = 0.45 / 8
        const xInitialPoint = -0.325
        //end = 0.125

        const yOneBoxLength = 0.6 / 11
        const yInitialPoint = 0.9

        const yStartPosition = Number((yInitialPoint - (yOneBoxLength * y)).toFixed(3))
        const xStartPosition = Number((xInitialPoint + (xOneBoxLength * x)).toFixed(3))

        return {xStartPosition, yStartPosition}
    }

    const convertDirectonAngleToDirectionVectorX = () => {
        const degreeInt = Math.floor(directionAngle) - 45
        const directionVectorX = Number((degreeInt/45).toFixed(3))

        return directionVectorX
    }

    function convertLaunchAngleToDirectionVectorY(angle:number, directonVectorX:number): number {

        const z = -1 //fixed

        const angleRad = MathUtils.degToRad(angle);
        const horizontalLength = Math.sqrt(directonVectorX * directonVectorX + z * z);
      
        const directionVectorY = Number((Math.tan(angleRad) * horizontalLength).toFixed(3))
        return directionVectorY;
      }
      

    const startSingleSimulation = () => {
        if (runSimulation) return
        const {xStartPosition, yStartPosition} = convertPosToStartPosition()
        const directionVectorX = convertDirectonAngleToDirectionVectorX()

        const launchAngleInt = Number(90 - Math.floor(launchAngle))
        const directionVectorY = convertLaunchAngleToDirectionVectorY(launchAngleInt, directionVectorX)

        const landingZone = getLandingZoneFromDirectionX(directionVectorX)

        triggerBall?.({
            xStartPosition,
            yStartPosition,
            directionVectorX,
            directionVectorY,
            exitVelocity: exitVelocity / 4,
            launchAngle : launchAngleInt,
            landingZone 
          }); 
    }

    function getLandingZoneFromDirectionX(pointX: number): number {
        const z = -1; 
        const angleRad = Math.atan2(-pointX, -z); 
        const angleDeg = MathUtils.radToDeg(angleRad); 
    
        const fanSections = [
        { startDeg: 27, endDeg: 45 },   // zone 1
        { startDeg: 9, endDeg: 27 },    // zone 2
        { startDeg: -9, endDeg: 9 },    // zone 3
        { startDeg: -27, endDeg: -9 },  // zone 4
        { startDeg: -45, endDeg: -27 }, // zone 5
        ];
    
        for (let i = 0; i < fanSections.length; i++) {
        const { startDeg, endDeg } = fanSections[i];
        if (angleDeg >= startDeg && angleDeg <= endDeg) {
            return i + 1;
        }
        }
    
        return -1; 
    }

    const multipleSimulations = () => {
        if (runSimulation) return
        const startXPositionRandomArr = Array.from({ length: 5 }, () => Number((Math.random() * (0.125 - (-0.325)) + (-0.325)).toFixed(3)));               
        const startYPositionRandomArr = Array.from({ length: 5 }, () => Number((Math.random() * 0.6 + 0.3).toFixed(2)));          
        
        const directionVectorXRandomArr = Array.from({ length: 5 }, () => Number((Math.random() * 2 - 1).toFixed(2)));

        const landingZone = directionVectorXRandomArr.map(x => getLandingZoneFromDirectionX(x))

        const launchAngleRandomArr = Array.from({ length: 5 }, () => Math.floor(Math.random() * (60 - 10 + 1) + 10));
        const directionVectorYRandomArr = launchAngleRandomArr.map((angle, index) => convertLaunchAngleToDirectionVectorY(angle, directionVectorXRandomArr[index]))

        const evRandomArr = Array.from({ length: 5 }, () =>Math.floor(Math.random() * (30 - 20)) + 20);

        for (let i=0; i<5; i++) {
            const startPositionXYZ = new Vector3(startXPositionRandomArr[i], startYPositionRandomArr[i], 31.8)
            const directionXYZNorm = new Vector3(directionVectorXRandomArr[i], directionVectorYRandomArr[i], -1).normalize()

            setTrajectoryArrLandingPosArr(startPositionXYZ, directionXYZNorm, evRandomArr[i], launchAngleRandomArr[i], landingZone[i])
        }     
    }

    const resetConsole = () => {
        setPos([4, 5])
        setLaunchAngle(45)
        setDirectionAngle(45)
        setExitVelocity(80)
    }
    
  return (
    <div className=" flex flex-col absolute z-10 max-w-[1000px] max-h-[1000px] bottom-4 left-4 bg-white p-4 rounded-2xl leading-none shadow-[rgba(0,0,0,0.24)_0px_3px_8px] ">
        <div onClick={resetConsole} className=' select-none flex justify-between items-center cursor-pointer'>
            <p className=' font-bold text-[20px] pointer-events-none '>Simulation Console</p>
            <div className=' bg-[#f3f5f7] hover:bg-gray-200 py-1.5 px-2.5 flex gap-2 rounded-md'>
                <p className=' text-[14px] text-slate-500 pointer-events-none select-none'>Reset</p>
                <RiResetLeftLine size={14} color='#64748b' />
            </div>
        </div>
        <div className=' flex mt-4 gap-4'>
            <div className=' bg-[#f3f5f7] p-4 rounded-2xl'>
                <div className=' flex justify-between items-center h-[26px] mb-4'>
                    <p className=' font-semibold text-[16px] pointer-events-none select-none mr-0'>Spot</p>
                    <div className=' bg-[#007FF226] py-1.5 px-2 rounded-md min-w-[48px] text-center'>
                        <p className=' text-[#007FF2] text-[14px] font-semibold pointer-events-none select-none'>{pos[0]}, {pos[1]}</p>
                    </div>
                </div>                
                <HitPosition pos={pos} setPos={setPos} />
            </div>
            <div className=' bg-[#f3f5f7] p-4 pb-0 rounded-2xl'>
                <div className=' flex justify-between items-center'>
                    <p className=' font-semibold text-[16px] pointer-events-none select-none'>Angle</p>
                    <div className=' bg-[#007FF226] py-1.5 px-3 rounded-md'>
                        <p className=' text-[#007FF2] text-[14px] font-semibold pointer-events-none select-none'>{90 - Math.floor(launchAngle)}°</p>
                    </div>
                </div>

                <HitLaunchAngle launchAngle={launchAngle} setLaunchAngle={setLaunchAngle} />
            </div>
        </div>

        <div className=' flex mt-4 gap-4'>
            
            <div className=' bg-[#f3f5f7] p-4 px-2 pb-0 rounded-2xl'>
            <div className=' flex justify-between items-center'>
                    <p className=' font-semibold text-[16px] pointer-events-none select-none'>Direction</p>
                    <div className=' bg-[#007FF226] py-1.5 px-3 rounded-md'>
                        <p className=' text-[#007FF2] text-[14px] font-semibold pointer-events-none select-none'>{Math.floor(directionAngle) - 45}°</p>
                    </div>
                </div>
                <HitDirectionAngle directionAngle={directionAngle} setDirectionAngle={setDirectionAngle} />
            </div>

            <div className=' bg-[#f3f5f7] p-4 rounded-2xl w-full'>
                <div className=' flex justify-between items-center'>
                    <p className=' font-semibold text-[16px] pointer-events-none select-none'>EV</p>
                    <div className=' bg-[#007FF226] py-1.5 px-2 rounded-md'>
                        <p className=' text-[#007FF2] text-[14px] font-semibold pointer-events-none select-none'>{exitVelocity} MPH</p>
                    </div>
                </div>                 
                <HitExitVelocity exitVelocity={exitVelocity} setExitVelocity={setExitVelocity} />
            </div>
        </div>

        <p className=' mt-4 text-[14px] text-slate-500'>*EV: speed of the baseball as it comes off the bat</p>

        <div onClick={startSingleSimulation} className=' bg-[#007FF2] text-white h-10 rounded-xl mt-4 flex items-center justify-center cursor-pointer'>
            <p className=' pointer-events-none select-none font-medium text-[15px]'>Start Single Simulation</p>
        </div>

        <div className="flex items-center gap-4 w-full mt-4">
            <div className="flex-grow border-t border-gray-300" />
                <span className="text-sm font-semibold pointer-events-none select-none">OR</span>
            <div className="flex-grow border-t border-gray-300" />
        </div>

        <div onClick={multipleSimulations} className=' bg-[#007FF2] text-white h-10 rounded-xl mt-4 flex items-center justify-center cursor-pointer'>
            <p className=' pointer-events-none select-none font-medium text-[15px]'>Randomize Simulations</p>
        </div>
    </div>
  )
}

export default SimulationConsole