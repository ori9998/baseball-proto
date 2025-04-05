import React, { useState } from "react";
import Image from "next/image";
import CircularSlider from "react-circular-slider-svg";

function HitDirectionAngle({directionAngle, setDirectionAngle}) {
  
  return (
    <div className="">
          <div className="relative w-[192px] h-[164px] overflow-hidden ">
            <div className="w-[120px] h-[120px] rounded-tr-full absolute border border-black bg-white rotate-[-45deg] left-1/2 -translate-x-1/2 bottom-[38px] " />
            <div className="absolute -left-[54px] -bottom-[120px]">
              <CircularSlider
                handle1={{
                  value: directionAngle,
                  onChange: (v) => setDirectionAngle(v),
                }}
                size={300}
                arcBackgroundColor="#f3f5f7"
                arcColor="#f3f5f7"
                // arcBackgroundColor="#fff000"
                // arcColor="#ff0000"
                trackWidth={20}
                handleColor1="white"
                minValue={0}
                maxValue={90}
                startAngle={135}
                endAngle={225}
              />
            </div>
            <div className="absolute bottom-[44px] left-1/2 -translate-x-1/2 pointer-events-none select-none rotate-[-45deg]">
            <Image
                alt="pointer"
                draggable={false}
                src={"/arrow_line2.svg"}
                width={72}
                height={20}
                style={{
                  transform: `rotate(${directionAngle - 45}deg)`,
                  transformOrigin: "bottom left",
                }}
              />
            </div>
          </div>
        </div>
  )
}

export default HitDirectionAngle