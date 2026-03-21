// 在 App.jsx 顶部修改
const geoUrl = import.meta.env.BASE_URL + "world.json"; 
import { useNavigate } from "react-router-dom";
import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion } from "framer-motion";

// 世界地图数据




// 你去过的城市示例 (经度, 纬度)
const travelSpots = [
  { id: "toronto", name: "Toronto", coordinates: [-79.38, 43.65] },
  { id: "shanghai", name: "Shanghai", coordinates: [121.47, 31.23] },
  { id: "london", name: "London", coordinates: [-0.12, 51.50] }
];

function MapHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8 font-mono tracking-widest">
        MY TRAVEL LOG
      </h1>
      
      <div className="w-full max-w-5xl aspect-video bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden relative">
        {/* 添加 aspect-video 或固定高度如 h-[600px] */}
        <ComposableMap projectionConfig={{ scale: 150 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) => {
              console.log("Current Geographies:", geographies); // 重点看这里
              return geographies && geographies.length > 0 ? (
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e293b"
                    stroke="#334155"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#2d3748", outline: "none" }
                    }}
                  />
                ))
              ) : (
                <text fill="white">Loading Map...</text> // 数据加载中或失败时的占位符
              )
            }}
          </Geographies>

          {travelSpots.map(({ name, coordinates, id }) => (
            <Marker key={id} coordinates={coordinates}>
              {/* 发光脉冲效果 */}
              <motion.circle
                initial={{ r: 0, opacity: 0.6 }}
                animate={{ r: 12, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                fill="#60a5fa"
              />
              {/* 城市点 */}
              <motion.circle
                r={4}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={1}
                whileHover={{ scale: 1.8 }}
                className="cursor-pointer"
                onClick={() => navigate(`/gallery/${id}`)} 
              />
              <text
                textAnchor="middle"
                y={-15}
                style={{ fontFamily: "monospace", fill: "#94a3b8", fontSize: "10px" }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
}

export default App;
