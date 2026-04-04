import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Calendar, MapPin, Globe, Clock, Image as ImageIcon } from 'lucide-react';

const imageModules = import.meta.glob('../assets/trips/**/*.{png,jpg,jpeg,JPG,PNG}', { eager: true });

function Gallery() {
  const { id } = useParams();

  // 1. 数据解析
  const allPhotos = Object.keys(imageModules)
    .filter((path) => path.includes(`/trips/${id}/`))
    .map((path) => {
      const fileName = path.split('/').pop();
      const datePart = fileName.match(/^\d{4}-\d{2}-\d{2}/);
      return {
        url: imageModules[path].default,
        name: fileName.replace(/^\d{4}-\d{2}-\d{2}_/, '').split('.').shift(),
        date: datePart ? datePart[0] : "Adventure",
        rawDate: datePart ? new Date(datePart[0]) : new Date(0)
      };
    });

  const visitedCountriesCount = 1; // 目前你可以手动设置，或者根据城市 id 逻辑判断
  const totalCountries = 195;
  const explorationPercentage = ((visitedCountriesCount / totalCountries) * 100).toFixed(1);

  // 2. 按日期分组
  const groupedPhotos = allPhotos.reduce((groups, photo) => {
    const date = photo.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(photo);
    return groups;
  }, {});

  // 3. 【正序排列】Ascending Order: 最早的日期在最上面
  const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(a) - new Date(b));

  const totalPhotos = allPhotos.length;
  const uniqueDates = sortedDates.length;

  return (
    <div className="min-h-screen text-slate-200 p-8 md:p-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto relative">
        
        {/* 1. 大背景标题：从纯白改为带一点蓝色的灰，透明度稍高一点 */}
        <div className="absolute -top-10 md:-top-20 left-0 w-full pointer-events-none select-none overflow-hidden">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            className="text-[12rem] md:text-[22rem] font-black uppercase tracking-tighter text-blue-100 whitespace-nowrap"
          >
            {id}
          </motion.h1>
        </div>

        {/* 返回按钮：提高亮度 */}
        <Link to="/" className="relative z-20 inline-flex items-center text-slate-400 hover:text-white transition-colors mb-16 group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Return to Atlas</span>
        </Link>

        {/* 2. 统计栏：改用更亮、更通透的玻璃效果 */}
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
            className="glass-panel grid grid-cols-2 md:flex gap-4 md:gap-12 p-8 rounded-[2rem]"
          >
            <div className="flex gap-12 border-r border-white/10 pr-12 hidden md:flex">
            <SmallStat icon={<ImageIcon size={14}/>} label="Moments" value={totalPhotos} />
            <SmallStat icon={<Clock size={14}/>} label="Expedition" value={`${uniqueDates} Days`} />
            <SmallStat icon={<Globe size={14}/>} label="Status" value="Live" />
            </div>

          {/* 新增：全球探索进度条 */}
          <div className="flex-grow w-full">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-1">Global Exploration</span>
                <span className="text-2xl font-black text-white tracking-tighter">
                  {explorationPercentage}<span className="text-blue-500 text-sm ml-1">%</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-600 uppercase italic">Goal: 100%</span>
            </div>
            {/* 进度条背景 */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              {/* 进度条填充 */}
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

        {/* 3. 时间轴：加宽线条并使用渐变色 */}
        <div className="relative border-l-2 border-white/5 ml-2 md:ml-4 pl-8 md:pl-16 mt-20">
          {sortedDates.map((date, groupIndex) => (
            <motion.section key={date} className="mb-32 relative">
              
              {/* 圆点：内部发光效果 */}
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

              {/* 照片卡片：减少纯黑，增加细腻的边框亮光 */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {groupedPhotos[date].map((photo, photoIndex) => (
                  <div key={photoIndex} className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-slate-800 border border-white/10 transition-all duration-500 hover:border-blue-400/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <img 
                      src={photo.url} 
                      className="w-full h-auto object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-75"
                    />
                    
                    {/* 悬停描述：使用更亮的毛玻璃 */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <h4 className="text-lg font-bold text-white mb-1 truncate">{photo.name.replace(/-/g, ' ')}</h4>
                        <p className="text-[10px] text-blue-200/60 uppercase tracking-widest font-mono">Location Archive</p>
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

// 精简版统计项组件
function SmallStat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center md:items-start min-w-[70px]">
      <div className="text-blue-400 mb-1 opacity-80">{icon}</div>
      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">{label}</span>
      <span className="text-sm font-black tracking-tight">{value}</span>
    </div>
  );
}

export default Gallery;
