import React from "react";

function HitPosition({ pos, setPos }) {
  const lineCols = [3, 7]; // 선 들어가는 col 인덱스
  const lineRows = [4, 9]; // 선 들어가는 row 인덱스

  const getVisibleCol = (col) => {
    return col - lineCols.filter((l) => col > l).length;
  };

  const getVisibleRow = (row) => {
    return row - lineRows.filter((l) => row > l).length;
  };

  return (
    <div className=" bg-white">
      <div
        className="grid mx-auto border border-black "
        style={{
          gridTemplateColumns: "repeat(3, 1fr) 1px repeat(3, 1fr) 1px repeat(3, 1fr)", // 11칸
          gridTemplateRows: "repeat(4, 1fr) 1px repeat(4, 1fr) 1px repeat(4, 1fr)",
        }}
      >
        {Array.from({ length: 154 }).map((_, i) => {
          const col = i % 11;
          const row = Math.floor(i / 11);

          const isVerticalLine = col === 3 || col === 7;
          const isHorizontalLine = row === 4 || row === 9;

          let baseColor = "bg-white";
          if (isVerticalLine || isHorizontalLine) baseColor = "bg-gray-800";
          if (pos[0] === getVisibleCol(col) && pos[1] === getVisibleRow(row)) baseColor = "bg-black";

          const roundedClass = isVerticalLine || isHorizontalLine ? "" : "";

          return (
            <div
              onClick={() => setPos([getVisibleCol(col), getVisibleRow(row)])}
              key={i}
              className={`
              w-3 h-3 box-border transition-all duration-100 ease-in-out cursor-pointer
              ${baseColor} ${roundedClass} hover:bg-slate-300
            `}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default HitPosition;
