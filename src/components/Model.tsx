import { useGLTF, useMatcapTexture, Text } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";

useGLTF.preload("/baseball.glb")

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Group, Box3, Vector3, Vector2, Mesh, Line, BufferGeometry, Shape, MathUtils, Raycaster, DoubleSide, ArrowHelper, BoxHelper, Box3Helper, BoxGeometry, MeshBasicMaterial, Quaternion, SphereGeometry } from "three";
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

import { Line2, } from 'three/addons/lines/Line2.js';
import { useModelStore } from "@/zustand/modelStore";

import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline'
import { Object3DNode, MaterialNode } from '@react-three/fiber'
import { useShallow } from "zustand/shallow";
import BaseballField from "./BaseballField";

extend({ Line2, LineMaterial, LineGeometry, MeshLineGeometry, MeshLineMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>
    meshLineMaterial: MaterialNode<MeshLineMaterial, typeof MeshLineMaterial>
  }
}

function Model() {
    const group = useRef<Group>(null)
    const pointsRef = useRef<Vector3[]>([])
  
    const trajectoryArrLandingPosArr = useModelStore((state) => state.trajectoryArrLandingPosArr)

    const zoneDataArrZonesObj = useModelStore((state) => state.zoneDataArrZonesObj)

    // const [runSimulation, setRunSimulation] = useState(false)
    
    const runSimulation = useModelStore((state) => state.runSimulation)
    const setRunSimulation = useModelStore((state) => state.setRunSimulation)

    const setTriggerBall = useModelStore((state) => state.setTriggerBall)

    const singleParamRef = useRef(null)
    const setTrajectoryArrLandingPosArr = useModelStore((state) => state.setTrajectoryArrLandingPosArr)
    const focusTrajectories = useModelStore((state) => state.focusTrajectories)

    const ref = useRef<Mesh>(null)

    const pos = useRef(new Vector3());
    const vel = useRef(new Vector3());
    const [onGround, setOnGround] = useState(false)
    const meshLineRef = useRef<any>(null);
    const fixedDelta = 1 / 60;

    useEffect(() => {
      setTriggerBall((params) => {
        console.log("run sim",params)

        singleParamRef.current = params
        const startPositionXYZ =  new Vector3(params.xStartPosition, params.yStartPosition, 31.8)
        pos.current = startPositionXYZ.clone()
        pointsRef.current = [pos.current.clone()] 

        const directionXYZ = new Vector3(params.directionVectorX, params.directionVectorY, -1).normalize()
        const initialVelocity = directionXYZ.multiplyScalar(params.exitVelocity)
        vel.current = initialVelocity.clone()

        setRunSimulation(true)
      })
    },[])
    
    useFrame(() => {
      if (!runSimulation) return;
    
      if (!ref.current) return

      if (!onGround) {
        vel.current.y = vel.current.y + -9.81 * fixedDelta
        pos.current.addScaledVector(vel.current, fixedDelta)

        if (pos.current.y <= 0.07 && vel.current.y < 0) {
          pos.current.y = -0.07;
          vel.current.set(0, 0, 0)
        
          setOnGround(true)
          setRunSimulation(false)
          saveTrajectoryToGraph()
          resetSingleSimulation()
        }

        pointsRef.current.push(pos.current.clone())
      } 

      if (meshLineRef.current) {
        const flatPoints = pointsRef.current.flatMap((p) => [p.x, p.y, p.z]);
        meshLineRef.current.geometry.setPoints(flatPoints);
      }

      ref.current.position.copy(pos.current)
    })



    const resetSingleSimulation = () => {
      pointsRef.current = []
      if (meshLineRef.current) {
        meshLineRef.current.geometry.setPoints([])
      }

      singleParamRef.current = null
      pos.current = new Vector3(); 
      vel.current = new Vector3(); 

      ref.current.position.set(0, 0, 0) 
      setOnGround(false);
    }

    const saveTrajectoryToGraph = () => {
      const startPositionXYZ = new Vector3(singleParamRef.current.xStartPosition, singleParamRef.current.yStartPosition, 31.8)
      const directionXYZNorm = new Vector3(singleParamRef.current.directionVectorX, singleParamRef.current.directionVectorY, -1).normalize()

      setTrajectoryArrLandingPosArr(
        startPositionXYZ, 
        directionXYZNorm, 
        singleParamRef.current.exitVelocity, 
        singleParamRef.current.launchAngle, 
        singleParamRef.current.landingZone
      )
    }

    function createFanShapeSegment(radius: number, startDeg: number, endDeg: number, segments = 5) {
      const shape = new Shape()
    
      const adjustedStartDeg = startDeg + 90
      const adjustedEndDeg = endDeg + 90
    
      const startRad = (adjustedStartDeg * Math.PI) / 180
      const endRad = (adjustedEndDeg * Math.PI) / 180
    
      shape.moveTo(0, 0)
    
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const theta = startRad + t * (endRad - startRad)
        const x = radius * Math.cos(theta)
        const y = radius * Math.sin(theta)
        shape.lineTo(x, y)    
      }
    
      shape.lineTo(0, 0)
      return shape
    }
    
            
    const fanSections = [
      { startAngle: 27, endAngle: 45},
      { startAngle: 9, endAngle: 27},
      { startAngle: 9, endAngle: -9},
      { startAngle: -9, endAngle: -27},
      { startAngle: -27, endAngle: -45},
    ]

    const onClickZone = (clickedZone:number) => {
      focusTrajectories(clickedZone)
    }    

  return (
    <>
      <group ref={group}>
        <BaseballField />

        <mesh ref={ref} visible={runSimulation}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {fanSections.map((section, i) => {
          const shape = createFanShapeSegment(58.8, section.startAngle, section.endAngle, 5);

          const fanCenterX = -0.1;
          const fanCenterZ = 31.8;
          
          const radius = 45;
          const midAngle = (section.startAngle + section.endAngle) / 2;
          const angleRad = MathUtils.degToRad(midAngle + 90);
          
          const x = fanCenterX + radius * Math.cos(angleRad);
          const z = fanCenterZ - radius * Math.sin(angleRad); 

          const matchingZone = zoneDataArrZonesObj.find(zone => zone.zone === i+1)
          const total = zoneDataArrZonesObj.reduce((acc, zone) => acc + zone.count, 0)

          const zonePercentage = Math.round((matchingZone?.count / total) * 100)
          const zoneHasColor = !!matchingZone?.color;
          const isFocused = !!matchingZone?.focused;

          const opacity = zoneHasColor ? (isFocused ? 0.5 : 0.2) : 0;
          

          //Note: Drawing Line Between Segments
          const startAngleRotatedDeg = section.startAngle + 90;
          const startAngleRoatedRad = MathUtils.degToRad(startAngleRotatedDeg);

          const startAngleDirectionUnitVector = new Vector3(Math.cos(startAngleRoatedRad), Math.sin(startAngleRoatedRad), 0);

          const extendedLength = radius + 15;
          const endPoint = startAngleDirectionUnitVector.clone().multiplyScalar(extendedLength).setZ(0.01); 

          const linePoints = [new Vector3(0, 0, 0.01), endPoint];
          const flatLinePoints = new Float32Array(linePoints.flatMap(p => [p.x, p.y, p.z]));

          return (
            <group key={i} >
              <mesh 
                position={[-0.1, 0.05, 31.8]} 
                rotation={[-Math.PI / 2, 0, 0]} 
                onClick={() => onClickZone(i+1)} 
                onPointerOver={() => {document.body.style.cursor = 'pointer';}}
                onPointerOut={() => {document.body.style.cursor = 'default';}}
                >
                <shapeGeometry args={[shape]} />
                <meshStandardMaterial
                  color={matchingZone?.color ?? "black"}
                  opacity={opacity}
                  transparent
                  depthWrite={false}
                />
              </mesh>

              <mesh                 
                position={[-0.1, 0.05, 31.8]} 
                rotation={[-Math.PI / 2, 0, 0]} >
                <meshLineGeometry attach="geometry" points={flatLinePoints} />
                <meshLineMaterial
                  attach="material"
                  lineWidth={0.1}
                  color="white"
                  transparent
                  depthTest={true}
                />
              </mesh>

              <group position={[x, 0.07, z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <Text position={[0, 0.5, 0]} fontSize={3} color="white" fontWeight={600} anchorX="center" anchorY="middle">{`${isNaN(zonePercentage) ? 0 : zonePercentage}%`}</Text>
                  <Text position={[0, -2, 0]} fontSize={1.2} color="#999999" anchorX="center" anchorY="middle">({`${matchingZone?.count}/${total}`})</Text>
              </group>
            </group>
          );
        })}

        {trajectoryArrLandingPosArr &&  trajectoryArrLandingPosArr.map((obj, i) => {
          return (
            <group key={i}>
              <mesh>
                <meshLineGeometry attach="geometry" points={obj.flattenTrajectoryPointsXYZArr} />
                <meshLineMaterial
                  attach="material"
                  lineWidth={obj.focused ? 0.4 : 0.2} 께
                  color={obj.focused ? '#B22222' : '#DAA520'}
                />
              </mesh> 
              <mesh position={[obj.landingPositionXYZ.x, 0.06, obj.landingPositionXYZ.z + 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[ obj.focused? 0.4 : 0.2, 52]} />
              <meshStandardMaterial color={obj.focused ? 'white' : '#999999'} />
            </mesh>
          </group>
          )
        })}

        <mesh ref={meshLineRef} raycast={raycast}>
          <meshLineGeometry attach="geometry" points={[]} />
          <meshLineMaterial
            attach="material"
            lineWidth={0.2} 
            color="hotpink"
          />
        </mesh>
      </group>
     
      //Note: Strike Zone
      {/* <mesh position={new Vector3(-0.1, 0.6, 31.75)} >
        <boxGeometry args={[0.45, 0.6, 0.1]} />
        <meshStandardMaterial color="yellow" />
      </mesh> */}
    </>
  );
}

export default Model