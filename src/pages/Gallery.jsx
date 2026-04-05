import React, { useState, useEffect } from 'react'; // 修复：必须引入 Hooks
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Calendar, MapPin, Globe, Clock, Image as ImageIcon } from 'lucide-react';
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import { travelSpots, TOTAL_COUNTRIES } from "../data/travelData"; // 引入共享数据

// 扫描所有深度的图片
const imageModules = import.meta.glob('../assets/trips/**/*.{png,jpg,jpeg,JPG,PNG}', { eager: true });

function Gallery() {
  const { id } = useParams();
  const [visitedCountries, setVisitedCountries] = useState(0);

  const allPhotos = Object.keys(imageModules)
  .filter((path) => {
    // 依然通过城市名过滤，确保只显示当前城市的照片
    return path.toLowerCase().includes(`/${id.toLowerCase()}/`);
  })
  .map((path) => {
    const parts = path.split('/'); 
    // 路径结构示例: [..., 'trips', 'Asia', 'China', 'Shanghai', '2024-03-21', 'IMG_01.jpg']
    
    const fileName = parts[parts.length - 1]; // 文件名
    const date = parts[parts.length - 2];     // 文件夹名：日期 (YYYY-MM-DD)
    const city = parts[parts.length - 3];     // 文件夹名：城市
    const country = parts[parts.length - 4];  // 文件夹名：国家
    const continent = parts[parts.length - 5];// 文件夹名：大洲

    return {
      url: imageModules[path].default,
      name: fileName.split('.').shift().replace(/[-_]/g, ' '),
      date: date,
      city: city,
      country: country,
      continent: continent,
      // 2. 增加容错：如果日期解析失败，不影响页面渲染
      rawDate: (date && date.includes('-')) ? new Date(date) : new Date(0)
    };
  });

  // // 2. 获取所有标记点 (你可以根据需要在这里继续添加城市)
  // const travelSpots = [
  //   { name: "Toronto", coordinates: [-79.38, 43.65] },
  //   { name: "Shanghai", coordinates: [121.47, 31.23] },
  //   { name: "London", coordinates: [-0.12, 51.50] },
  //   // 新增城市示例：
  //   { name: "Vancouver", coordinates: [-123.12, 49.28] },
  //   { name: "Tokyo", coordinates: [139.69, 35.67] },
  // ];

  useEffect(() => {
    // 自动计算已访问国家 (确保 world.json 在 public 文件夹下)
    fetch("./world.json")
      .then(response => response.json())
      .then(worldData => {
        const countries = feature(worldData, worldData.objects.countries).features;
        const visitedSet = new Set();

     
        // 关键：现在自动使用共享的 travelSpots 数组计算
        travelSpots.forEach(spot => {
          const country = countries.find(c => geoContains(c, spot.coordinates));
          if (country) visitedSet.add(country.id || country.properties.name);
        });
        setVisitedCountries(visitedSet.size);
      });
  }, []);

  const totalCountries = 195;
  const explorationPercentage = ((visitedCountries / totalCountries) * 100).toFixed(1);

  // 3. 按日期分组
  const groupedPhotos = allPhotos.reduce((groups, photo) => {
    const date = photo.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(photo);
    return groups;
  }, {});

  // 4. 正序排列
  const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(a) - new Date(b));

  const totalPhotos = allPhotos.length;
  const uniqueDates = sortedDates.length;

  return (
    <div className="min-h-screen text-slate-200 p-8 md:p-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* 1. 响应式背景大标题 (Big Header) */}
        <div className="absolute -top-6 md:-top-20 left-0 w-full pointer-events-none select-none overflow-hidden px-4">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            /* 关键修改：字号随屏幕宽度变化，且增加自动换行或缩放逻辑 */
            className="text-[15vw] md:text-[20vw] lg:text-[22rem] font-black uppercase tracking-tighter text-blue-100 leading-none break-words"
          >
            {id}
          </motion.h1>
        </div>

        {/* 返回按钮 */}
        <Link to="/" className="relative z-20 inline-flex items-center text-slate-400 hover:text-white transition-colors mb-16 group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Return to Atlas</span>
        </Link>

        {/* 统计栏 */}
        <header className="relative z-10 mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-6xl md:text-8xl font-bold italic font-serif capitalize text-white tracking-tighter">
              {id}<span className="text-blue-400 not-italic">.</span>
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-blue-500 to-emerald-400 mt-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // 关键修改：
            // 窄屏：grid-cols-2 (每行两个) 
            // 中屏：md:flex (恢复弹性横向排列)
            // 增加 w-full 确保撑满
            className="glass-panel grid grid-cols-2 md:flex md:items-center gap-6 md:gap-12 p-6 md:p-8 rounded-[2rem] w-full"
          >
            {/* 左侧三个小统计：在窄屏下自动平铺 */}
            <div className="contents md:flex md:gap-10 md:border-r md:border-white/10 md:pr-10">
              <SmallStat icon={<ImageIcon size={14}/>} label="Moments" value={totalPhotos} />
              <SmallStat icon={<Clock size={14}/>} label="Days" value={uniqueDates} />
              <SmallStat icon={<Globe size={14}/>} label="Status" value="Live" />
            </div>

            {/* 全球探索进度条：在窄屏下占据整行 (col-span-2) */}
            <div className="col-span-2 md:flex-grow w-full">
              <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                  <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Global Exploration</span>
                  <span className="text-xl md:text-2xl font-black text-white tracking-tighter">
                    {explorationPercentage}<span className="text-blue-500 text-xs ml-1">%</span>
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-600 uppercase italic hidden sm:inline">Goal: 100%</span>
              </div>
              
              <div className="h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${explorationPercentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-emerald-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        </header>

                {/* 3. 时间轴与画廊展示 */}
                <div className="relative border-l-2 border-white/5 ml-2 md:ml-4 pl-8 md:pl-16 mt-20">
          {sortedDates.map((date, groupIndex) => (
            <motion.section key={date} className="mb-32 relative">
              
              {/* 时间轴发光圆点 */}
              <div className="absolute -left-[41px] md:-left-[73px] top-2 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0f172a] shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
              
              <header className="mb-12">
                <div className="flex items-center space-x-4 text-blue-300/80 font-mono text-[10px] tracking-[0.2em] uppercase mb-3">
                   <Calendar size={14} />
                   <span className="bg-blue-500/10 px-2 py-0.5 rounded">{date}</span>
                   <span className="text-slate-600">/</span>
                   <span>Day {groupIndex + 1}</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight text-white/90">Chapter {groupIndex + 1}</h3>
              </header>

              {/* 每日照片网格 */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {groupedPhotos[date].map((photo, photoIndex) => (
                  <div key={photoIndex} className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-slate-800 border border-white/10 transition-all duration-500 hover:border-blue-400/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <img 
                      src={photo.url} 
                      className="w-full h-auto object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-75" 
                      alt={photo.name}
                    />
                    
                    {/* 悬停描述块 (Thumb up Version) */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        
                        {/* 图片名称 */}
                        <h4 className="text-lg font-bold text-white mb-3 truncate">
                          {photo.name || "Untitled Moment"}
                        </h4>

                        {/* 你的新地理位置信息栏 */}
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-300 border-t border-white/10 pt-3">
                          <span className="flex items-center">
                            <MapPin size={10} className="mr-1 text-blue-400" />
                            {photo.country || "Earth"} · {photo.continent || "Explore"}
                          </span>
                          <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">
                            {photo.date}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}

// 别忘了在文件最末尾保留 SmallStat 组件
function SmallStat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center md:items-start min-w-[70px]">
      <div className="text-blue-400 mb-1 opacity-80">{icon}</div>
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">{label}</span>
      <span className="text-sm font-black tracking-tight text-white">{value}</span>
    </div>
  );
}

export default Gallery;
