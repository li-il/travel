import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 引入路由跳转钩子

// 使用可靠的地图数据源
const geoUrl = "https://cdn.jsdelivr.net";

// 你去过的城市数据
const travelSpots = [
  { id: "toronto", name: "Toronto", coordinates: [-79.38, 43.65] },
  { id: "shanghai", name: "Shanghai", coordinates: [121.47, 31.23] },
  { id: "london", name: "London", coordinates: [-0.12, 51.50] }
];

function MapHome() {
  const navigate = useNavigate(); // 初始化跳转功能

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white mb-8 font-mono tracking-widest"
      >
        MY TRAVEL LOG
      </motion.h1>
      
      <div className="w-full max-w-5xl aspect-video bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden relative">
        <ComposableMap projectionConfig={{ scale: 160 }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies && geographies.length > 0 ? (
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#334155" // 较亮的陆地颜色
                    stroke="#475569" // 边界线
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#475569", outline: "none" }
                    }}
                  />
                ))
              ) : (
                <text x="400" y="225" fill="white" textAnchor="middle">Loading Map Data...</text>
              )
            }
          </Geographies>

          {travelSpots.map(({ name, coordinates, id }) => (
            <Marker key={id} coordinates={coordinates}>
              {/* 呼吸灯动画效果 */}
              <motion.circle
                initial={{ r: 0, opacity: 0.6 }}
                animate={{ r: 15, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2 }}
                fill="#60a5fa"
              />
              {/* 可点击的城市圆点 */}
              <motion.circle
                r={5}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth={2}
                whileHover={{ scale: 1.5, fill: "#60a5fa" }}
                className="cursor-pointer"
                // 关键点：点击后跳转到 /gallery/城市ID
                onClick={() => navigate(`/gallery/${id}`)} 
              />
              <text
                textAnchor="middle"
                y={-20}
                style={{ fontFamily: "monospace", fill: "#94a3b8", fontSize: "12px", pointerEvents: "none" }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      
      <footer className="mt-8 text-slate-500 text-sm font-mono">
        Click on a blue dot to view my memories.
      </footer>
    </div>
  );
}

export default MapHome;
