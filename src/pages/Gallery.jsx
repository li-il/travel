import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

function Gallery() {
  const { id } = useParams();

  // 这里可以放你的照片链接，后续可以根据 id 筛选
  const photos = [
    { url: "https://images.unsplash.com", title: "City View" },
    { url: "https://images.unsplash.com", title: "Nature" },
    { url: "https://images.unsplash.com", title: "Forest" },
    // 更多照片...
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-12">
          <ArrowLeft size={20} className="mr-2" /> Back to World Map
        </Link>

        <header className="mb-12">
          <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">{id} Memories</h1>
          <div className="h-1 w-20 bg-blue-600"></div>
        </header>

        {/* 瀑布流网格 */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-2xl border border-slate-800"
            >
              <img 
                src={photo.url} 
                alt={photo.title}
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <p className="text-sm font-mono text-blue-400">{photo.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Gallery;
