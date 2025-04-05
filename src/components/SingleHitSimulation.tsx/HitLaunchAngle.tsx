import React, { useState } from "react";
import Image from "next/image";
import CircularSlider from "react-circular-slider-svg";

function HitLaunchAngle({launchAngle, setLaunchAngle}) {

  return (
    <div className="relative w-[168px] h-[168px] overflow-hidden ">
      <div className=" w-[148px] h-[148px] rounded-tr-full absolute border-1 bottom-0 border-black bg-white " />
        <div className="absolute -left-[148px] -bottom-[148px]">
          <CircularSlider
            handle1={{
              value: launchAngle,
              onChange: (v) => setLaunchAngle(v),
            }}
            size={336}
            // arcBackgroundColor="#fff000"
            // arcColor="#ff0000"
            arcBackgroundColor="#f3f5f7"
            arcColor="#f3f5f7"
            handleColor1="white"            
            trackWidth={20}
            minValue={10}
            maxValue={85}
            startAngle={190}
            endAngle={270}
          />
        </div>
        <div className=" absolute bottom-4 left-4 pointer-events-none select-none ">
          <Image
            alt="pointer"
            draggable={false}
            src={"/arrow_line2.svg"}
            width={82}
            height={20}
            style={{
              transform: `rotate(${launchAngle - 45}deg)`,
              transformOrigin: "bottom left",
            }}
          />
        </div>
    </div>
  );
}

export default HitLaunchAngle;
