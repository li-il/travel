import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { travelSpots } from "../data/travelData"; 
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, ArrowRight } from "lucide-react"; // 修复了导入
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const geoUrl = "./world.json"; 

function MapHome() {
  const navigate = useNavigate();
  // 1. 新增：存储当前的缩放状态
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  // 2. 监听缩放变化的函数
  const handleMoveEnd = (position) => {
    setPosition(position);
  };
  // --- 状态定义 ---
  const [queryCity, setQueryCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null); 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. 智能查询函数
  const handleSmartSearch = async () => {
    if (!queryCity) return;
    setLoading(true);
    try {
      const url = `https://maps.co{encodeURIComponent(queryCity)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const lon = parseFloat(data[0].lon);
        const lat = parseFloat(data[0].lat);
        const id = queryCity.toLowerCase().replace(/\s+/g, '-');
        const codeSnippet = `{ id: "${id}", name: "${queryCity}", coordinates: [${lon.toFixed(2)}, ${lat.toFixed(2)}] },`;
        await navigator.clipboard.writeText(codeSnippet);
        alert(`✅ 代码已复制:\n${codeSnippet}`);
      }
    } catch (err) {
      alert("查询失败，请检查网络");
    }
    setLoading(false);
  };

  // 2. 悬停检测函数
  const handleMarkerHover = (e, currentSpot) => {
    const threshold = 2.0; 
    if (!currentSpot.coordinates) return;

    const nearby = travelSpots.filter(spot => {
      const lonDiff = Math.abs(spot.coordinates[0] - currentSpot.coordinates[0]);
      const latDiff = Math.abs(spot.coordinates[1] - currentSpot.coordinates[1]);
      return lonDiff < threshold && latDiff < threshold;
    });

    if (nearby.length > 1) {
      setHoveredGroup(nearby);
      setMousePos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredGroup(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <h1 className="text-4xl font-bold text-white mb-8 font-mono tracking-widest uppercase">My Travel Log</h1>

      {/* 3. 悬浮选择列表 (仅在重叠时显示) */}
      <AnimatePresence>
        {hoveredGroup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onMouseLeave={() => setHoveredGroup(null)}
            style={{ 
              position: 'fixed',
              left: mousePos.x + 15, 
              top: mousePos.y - 15,
              zIndex: 9999 
            }}
            className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 p-4 rounded-[2rem] shadow-2xl min-w-[200px]"
          >
            <div className="text-blue-400 text-[10px] font-mono mb-3 px-2 flex items-center">
              <Navigation size={12} className="mr-2" /> SELECT LOCATION
            </div>
            <div className="space-y-1">
              {hoveredGroup.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/gallery/${s.id}`)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-600 transition-all text-white text-sm font-bold flex justify-between items-center group"
                >
                  {s.name}
                  <ArrowRight size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. 地图主容器 (仅保留一个) */}
      <div className="w-full max-w-5xl aspect-video bg-slate-900 border border-slate-800 rounded-[3rem] p-4 shadow-2xl overflow-hidden relative">
      <ComposableMap projectionConfig={{ scale: 160 }}>
        {/* 3. 使用 onMoveEnd 实时获取 zoom 倍数 */}
        <ZoomableGroup 
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            maxZoom={12}
          >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo} 
                  fill="#1e293b" 
                  stroke="#334155" 
                  style={{ default: { outline: "none" } }} 
                />
              ))
            }
          </Geographies>

          {travelSpots.map((spot) => {
              // 4. 关键逻辑：计算动态大小
              // 当 zoom 变大时，我们将 r 除以 zoom 的平方根，让圆点在视觉上变小
              const dynamicRadius = 5 / Math.sqrt(position.zoom);
              const dynamicStroke = 2 / Math.sqrt(position.zoom);

              return (
                <Marker key={spot.id} coordinates={spot.coordinates}>
                  {/* 背景光圈也要跟着缩小 */}
                  <motion.circle
                    r={dynamicRadius * 3}
                    fill="#60a5fa"
                    animate={{ opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  {/* 城市圆点 */}
                  <motion.circle
                    r={dynamicRadius}
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth={dynamicStroke}
                    className="cursor-pointer"
                    onMouseEnter={(e) => handleMarkerHover(e, spot)}
                    onClick={() => {
                      // 5. 交互改进：如果已经放大到一定程度，就不弹出列表，直接跳转
                      if (position.zoom > 5) {
                        navigate(`/gallery/${spot.id}`);
                      } else if (!hoveredGroup) {
                        navigate(`/gallery/${spot.id}`);
                      }
                    }}
                  />
                  {/* 名字：在缩放较小时隐藏，放大后才显示 */}
                  {position.zoom > 3 && (
                    <text
                      textAnchor="middle"
                      y={-(dynamicRadius + 5)}
                      style={{ 
                        fontSize: `${10 / Math.sqrt(position.zoom)}px`, 
                        fill: "#94a3b8", 
                        pointerEvents: "none" 
                      }}
                    >
                      {spot.name}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* 5. 智能查询器 (仅本地可见) */}
      {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
        <div className="fixed bottom-10 right-10 z-[100] p-6 bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-[2rem] shadow-2xl">
          <h4 className="text-[10px] font-mono text-blue-400 mb-3 uppercase tracking-widest font-bold">Smart Coords Finder</h4>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={queryCity}
              onChange={(e) => setQueryCity(e.target.value)}
              placeholder="City, Country" 
              className="bg-slate-950 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-blue-500 w-40"
            />
            <button 
              onClick={handleSmartSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
            >
              {loading ? "..." : "GET CODE"}
            </button>
          </div>
        </div>
      )}

      <footer className="mt-8 text-slate-500 text-sm font-mono italic">
        Hover over markers to reveal overlapping destinations.
      </footer>
    </div>
  );
}

export default MapHome;
