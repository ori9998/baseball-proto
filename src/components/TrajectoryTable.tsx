"use client"
import React, { useEffect } from 'react'
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    getKeyValue,
} from "@heroui/react";
import { useModelStore } from '@/zustand/modelStore';
import { RiResetLeftLine } from 'react-icons/ri';

  const columns = [
    {
      key: "index",
      label: "ORDER",
    },
    {
        key: "power",
        label: "EV\n(MPH)",
    },
    {
        key: "launchAngle",
        label: "LAUNCH\nANGLE (°)",
    },
    {
      key: "hitDistance",
      label: "HIT\nDISTANCE (m)",
    },
    {
      key: "horizontalDistance",
      label: "HORIZONTAL\nDISTANCE (m)",
    },
    {
        key: "landingZone",
        label: "ZONE",
    },
  ];
  
function TrajectoryTable() {

    const trajectoryArrLandingPosArr = useModelStore((state) => state.trajectoryArrLandingPosArr)
    const [selectedKeys, setSelectedKeys] = React.useState(new Set());
    const focusedTrajectories = useModelStore((state) => state.focusedTrajectories)
    const onClickTableRow = useModelStore((state) => state.onClickTableRow)

    const focusAllTrajectories = useModelStore((state) => state.focusAllTrajectories)
    const removeFocusAllTrajectories = useModelStore((state) => state.removeFocusAllTrajectories)

    const resetAllTrajectories = useModelStore((state) => state.resetAllTrajectories)
    const runSimulation = useModelStore((state) => state.runSimulation)

    useEffect(() => {
      const newSet = new Set(
        focusedTrajectories.map((item) => item.toString())
      );
      setSelectedKeys(newSet);
    }, [focusedTrajectories]);
            
    const onClickRow = (value) => {
      if (value !== 'all' && value.size > 0) {
        let change;
    
        const added = [...value].filter(k => !selectedKeys.has(k));
        const removed = [...selectedKeys].filter(k => !value.has(k));
    
        if (added.length !== 0) {
          change = Number(added[0]);
        } else {
          change = Number(removed[0]);
        }
    
        onClickTableRow(change);
      } else {
        if (selectedKeys.size > 0) {
          console.log('remove all')
          removeFocusAllTrajectories();
        } else {
          focusAllTrajectories(); 
        }
      }
    };
    
    const resetTrajectories = () => {
      if (runSimulation) return
      resetAllTrajectories()
    }

  return (
    <div className="  absolute z-10 bottom-4 right-4 shadow-[rgba(0,0,0,0.24)_0px_3px_8px] rounded-[16px] bg-white">
      <div onClick={resetTrajectories} className=' select-none flex justify-between items-center cursor-pointer px-4 pt-3'>
          <p className=' font-bold text-[20px] pointer-events-none '>Simulation Table</p>
          <div className=' bg-[#f3f5f7] hover:bg-gray-200 py-1.5 px-2.5 flex gap-2 rounded-md'>
              <p className=' text-[14px] text-slate-500 pointer-events-none select-none'>Reset</p>
              <RiResetLeftLine size={14} color='#64748b' />
          </div>
      </div>

    <div className="flex flex-col-reverse gap-3 max-w-[800px] max-h-screen overflow-auto mt-4">
    <Table
        aria-label="Trajectory Table"
        color={'primary'}
        selectedKeys={selectedKeys}
        selectionBehavior="toggle"
        classNames={{
          wrapper: "pt-0 shadow-none",
          emptyWrapper: 'h-[50px] text-[13px]',
        }}
        selectionMode="multiple"
        onRowAction={(value) => console.log('bbb', value)}
        onSelectionChange={(value) => {
          onClickRow(value)
        }}
        >
         <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key}>
            <span className="whitespace-pre-wrap">{column.label}</span>
          </TableColumn>
        )}
      </TableHeader>
        <TableBody emptyContent={"Start Simulation."} items={trajectoryArrLandingPosArr}>
          {(item) => (
            <TableRow key={item.index}>
             {(columnKey) => (
              <TableCell>
                {columnKey === "power"
                  ? item.power * 4
                  : columnKey === "hitDistance"
                  ? (Number(item.hitDistance) * 2).toFixed(1)
                  : columnKey === "horizontalDistance"
                  ? (Number(item.horizontalDistance) * 2).toFixed(1)
                  : getKeyValue(item, columnKey)}
              </TableCell>
            )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  )
}

export default TrajectoryTable