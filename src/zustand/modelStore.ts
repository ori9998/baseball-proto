import { Vector3 } from 'three';
import { create } from 'zustand'

interface TrajectoryData {
    index: number;
    trajectoryPointsXYZArr: number[];
    landingPositionXYZ: { x: number, y: number, z: number };
    launchAngle:string;
    power: number;
    hitDistance:string
    horizontalDistance:string
}

interface ZoneObj {
    zone: number;
    count: number;
    color: string | null
}
  
interface UseModelStore {
  triggerBall: () => void
  setTriggerBall: (fn: () => void) => void

  trajectoryArrLandingPosArr: TrajectoryData[]

  setTrajectoryArrLandingPosArr:(startPositionXYZ, directionXYZNorm, power, launchAngle, landingZone) => void

  zoneDataArrZonesObj: ZoneObj[]
  setZoneDataArrZonesObj: (newZoneNumber:number) => void
}

const updateZoneDataColor = (zoneData) => {
    const counts = Array.from(new Set(zoneData.map((z:ZoneObj) => z.count).filter((num:number) => num > 0))).sort((a, b) => b - a);
    //[8, 6, 4]
    return zoneData.map(zone => {
        if (zone.count === 0) return {...zone, color: null}

        const rank = counts.indexOf(zone.count)

        let color;
        if (rank === 0) {
            color = '#00FF00'
        } else  if (rank === 1) {
            color = 'orange'
        } else {
            color = 'red'
        }
  
      return { ...zone, color };
    })
}

const simulateTrajectory = (startPositionXYZ: Vector3, directonXYZ: Vector3, power:number) => {
      const frame = 1/60
      const gravity = -9.81

      const trajectoryPointsXYZArr: Vector3[] = [];

      const velocity = directonXYZ.clone().multiplyScalar(power);

      const vel = velocity.clone();
      const pos = startPositionXYZ.clone();

      let time = 0
      
      while (true) {
        vel.y = vel.y + gravity * frame
        pos.addScaledVector(vel, frame)

        trajectoryPointsXYZArr.push(pos.clone());

        if (pos.y <= 0.07 && vel.y < 0) {
          pos.y = -0.07; 
          vel.set(0, 0, 0); 
        
          trajectoryPointsXYZArr.push(pos.clone());
          break;
        }

        time += frame;
        if (time > 10) break;

      }

      const landingPositionXYZ = trajectoryPointsXYZArr[trajectoryPointsXYZArr.length -1]

      const hitDistance = trajectoryPointsXYZArr.reduce((acc, point, i) => {
        if (i === 0) return 0; 
        return acc + point.distanceTo(trajectoryPointsXYZArr[i - 1]);
      }, 0);

      const flattenTrajectoryPointsXYZArr = trajectoryPointsXYZArr.flatMap(pos => [pos.x, pos.y, pos.z])

      return {flattenTrajectoryPointsXYZArr, landingPositionXYZ, hitDistance};
}

export const useModelStore = create<UseModelStore>((set, get) => ({
  triggerBall: () => {},
  setTriggerBall: (fn) => set({ triggerBall: fn }),

  runSimulation: false,
  setRunSimulation: (value) => set({runSimulation: value}),

  trajectoryArrLandingPosArr: [],

  setTrajectoryArrLandingPosArr: (startPositionXYZ, directionXYZNorm, power, launchAngle, landingZone) => {
    const prev = get().trajectoryArrLandingPosArr;

    const currentIndex = prev.length === 0 ? 0 : get().trajectoryArrLandingPosArr.length
    
    const {flattenTrajectoryPointsXYZArr, landingPositionXYZ, hitDistance} = simulateTrajectory(startPositionXYZ, directionXYZNorm, power)

    const horizontalStart = new Vector3(startPositionXYZ.x, 0, startPositionXYZ.z);
    const horizontalEnd = new Vector3(landingPositionXYZ.x, 0, landingPositionXYZ.z);
    const horizontalDistance = horizontalStart.distanceTo(horizontalEnd).toFixed(1)

    const newEntry = {
      index: currentIndex + 1,
      flattenTrajectoryPointsXYZArr,
      landingPositionXYZ,
      launchAngle,
      landingZone,
      power,
      hitDistance: hitDistance.toFixed(1),
      horizontalDistance,
      focused: false
    };

    set({
      trajectoryArrLandingPosArr: [...prev, newEntry],
    });

    get().setZoneDataArrZonesObj(landingZone);
    
  },

  zoneDataArrZonesObj: [{zone: 1, color: null, count: 0, focused: false }, {zone: 2, color: null, count: 0, focused: false }, {zone: 3, color: null, count: 0, focused: false }, {zone: 4, color: null, count: 0, focused: false }, {zone: 5, color: null, count: 0, focused: false }],

  setZoneDataArrZonesObj: (newZoneNumber) => {
    const prevZoneData = get().zoneDataArrZonesObj

    const coutUpdatedZoneDataArr = prevZoneData.map(zone => {
        if (zone.zone === newZoneNumber) {
            return {...zone, count: zone.count + 1}
        }

        return zone
    })
    const colorUpatedZoneDataArr = updateZoneDataColor(coutUpdatedZoneDataArr)

    set(() => ({
        zoneDataArrZonesObj: colorUpatedZoneDataArr
    }))
  },

  focusedTrajectories: [],

  focusTrajectories: (clickedZone: number) => {
    const zoneData = get().zoneDataArrZonesObj;
    const trajectories = get().trajectoryArrLandingPosArr;
  
    const isAlreadyFocused = zoneData.find(z => z.zone === clickedZone)?.focused;
  
    let updatedZone;
    let updatedTrajectories;
    let clickedZoneTrajectories: number[] = [];
  
    if (isAlreadyFocused) {
      updatedZone = zoneData.map(zone => ({
        ...zone,
        focused: false
      }));
  
      updatedTrajectories = trajectories.map(trajectory => ({
        ...trajectory,
        focused: false
      }));
    } else {
      updatedZone = zoneData.map(zone => ({
        ...zone,
        focused: zone.zone === clickedZone
      }));
  
      updatedTrajectories = trajectories.map(trajectory => {
        if (trajectory.landingZone === clickedZone) {
          clickedZoneTrajectories.push(trajectory.index);
          return { ...trajectory, focused: true };
        }
        return { ...trajectory, focused: false };
      });
    }
  
    set(() => ({
      zoneDataArrZonesObj: updatedZone,
      focusedTrajectories: clickedZoneTrajectories,
      trajectoryArrLandingPosArr: updatedTrajectories
    }));
  },

  onClickTableRow: (clickedIndex:number) => {
    const trajectories = get().trajectoryArrLandingPosArr;
    const focusedTrajectories = get().focusedTrajectories;
    const zoneData = get().zoneDataArrZonesObj;

    let updatedTrajectoriesArr;
    let updatedZone;
    let focusedTrajectoriesIdx = [...focusedTrajectories]

    updatedTrajectoriesArr = trajectories.map(trajectory => {
      if (trajectory.index === clickedIndex) {
        if (trajectory.focused) {
          return { ...trajectory, focused: false };
        } else {
          return { ...trajectory, focused: true };
        }
      }
      return trajectory
    });

    if (!focusedTrajectories.includes(clickedIndex)) {
      focusedTrajectoriesIdx.push(clickedIndex)
    } else {
      focusedTrajectoriesIdx = focusedTrajectories.filter(idx => idx !== Number(clickedIndex))
    }

    const focusedZones = updatedTrajectoriesArr.filter(obj => obj.focused).map(obj => obj.landingZone);
  
    const uniqueFocusedZones = [...new Set(focusedZones)];
  
    updatedZone = get().zoneDataArrZonesObj.map(zone => ({
      ...zone,
      focused: uniqueFocusedZones.includes(zone.zone),
    }));
    
    set(() => ({
      focusedTrajectories: focusedTrajectoriesIdx,
      trajectoryArrLandingPosArr: updatedTrajectoriesArr,
      zoneDataArrZonesObj: updatedZone,
    }));
  },

  focusAllTrajectories: () => {
    const trajectories = get().trajectoryArrLandingPosArr;
    const zoneData = get().zoneDataArrZonesObj;

    let updatedZone;
    let updatedTrajectories;

    updatedZone = zoneData.map(zone => ({
      ...zone,
      focused: true
    }));

    updatedTrajectories = trajectories.map(trajectory => ({
      ...trajectory,
      focused: true
    }));

    const allTrajectoriesIdx = trajectories.map(trajectory => trajectory.index)

    set(() => ({
      focusedTrajectories: [...allTrajectoriesIdx],
      trajectoryArrLandingPosArr: updatedTrajectories,
      zoneDataArrZonesObj: updatedZone,
    }));
  },

  removeFocusAllTrajectories: () => {
    const trajectories = get().trajectoryArrLandingPosArr;
    const zoneData = get().zoneDataArrZonesObj;

    let updatedZone;
    let updatedTrajectories;

    updatedZone = zoneData.map(zone => ({
      ...zone,
      focused: false
    }));

    updatedTrajectories = trajectories.map(trajectory => ({
      ...trajectory,
      focused: false
    }));

    set(() => ({
      focusedTrajectories: [],
      trajectoryArrLandingPosArr: updatedTrajectories,
      zoneDataArrZonesObj: updatedZone,
    }));
  },

  resetAllTrajectories: () => {
    set(() => ({
      focusedTrajectories: [],
      trajectoryArrLandingPosArr: [],
      zoneDataArrZonesObj: [{zone: 1, color: null, count: 0, focused: false }, {zone: 2, color: null, count: 0, focused: false }, {zone: 3, color: null, count: 0, focused: false }, {zone: 4, color: null, count: 0, focused: false }, {zone: 5, color: null, count: 0, focused: false }],
    }));
  }
}))

