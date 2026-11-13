import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe2, MapPin, Minus, Navigation, Plus, RotateCcw, X } from 'lucide-react';
import { geoContains } from 'd3-geo';
import { ComposableMap, Geographies, Geography, Graticule, Marker, ZoomableGroup } from 'react-simple-maps';
import { travelSpots } from '../data/travelData';

const geoUrl = `${import.meta.env.BASE_URL}world.json`;
const INITIAL_POSITION = { coordinates: [0, 0], zoom: 1 };

function nearbySpots(spot) {
  return travelSpots.filter(other =>
    Math.abs(other.coordinates[0] - spot.coordinates[0]) < 2 &&
    Math.abs(other.coordinates[1] - spot.coordinates[1]) < 2
  );
}

function MapHome() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ left: 16, top: 16 });
  const [queryCity, setQueryCity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hoveredGroup) return;
    const dismiss = event => {
      if (event.key === 'Escape') setHoveredGroup(null);
    };
    const close = () => setHoveredGroup(null);
    window.addEventListener('keydown', dismiss);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('keydown', dismiss);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [hoveredGroup]);

  function showGroup(event, group) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX ?? rect.right;
    const y = event.clientY ?? rect.top;
    setMenuPosition({
      left: Math.max(12, Math.min(x + 12, window.innerWidth - 252)),
      top: Math.max(12, Math.min(y - 20, window.innerHeight - (88 + group.length * 48))),
    });
    setHoveredGroup(group);
  }

  function openSpot(event, spot) {
    const group = nearbySpots(spot);
    if (position.zoom <= 5 && group.length > 1) {
      showGroup(event, group);
    } else {
      navigate(`/gallery/${spot.id}`);
    }
  }

  function changeZoom(multiplier) {
    setHoveredGroup(null);
    setPosition(current => ({ ...current, zoom: Math.min(12, Math.max(1, current.zoom * multiplier)) }));
  }

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
    } catch {
      alert("查询失败，请检查网络");
    }
    setLoading(false);
  };
  return (
    <main className="atlas-page min-h-screen px-4 py-6 sm:px-8 sm:py-8 text-slate-100">
      <div className="mx-auto w-full max-w-6xl">
        <a href="https://li-il.github.io/#/" className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-blue-300">
          <ArrowLeft size={14} /> Back to portfolio
        </a>

        <header className="px-2 pt-10 pb-8 text-center sm:pt-12 sm:pb-10">
          <p className="mb-4 flex items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-blue-400 sm:text-xs">
            <span aria-hidden="true" className="h-px w-8 bg-blue-500/40" />
            Places &amp; Memories
            <span aria-hidden="true" className="h-px w-8 bg-blue-500/40" />
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            My Travel{' '}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text italic text-transparent">Log.</span>
          </h1>
        </header>

        <section aria-label="Interactive travel atlas" className="atlas-panel overflow-hidden rounded-[1.75rem] border border-white/10 sm:rounded-[2.5rem]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-400/10 text-blue-300"><Globe2 size={20} /></span>
              <div>
                <p className="mb-1 text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400">A personal atlas</p>
                <h2 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">Every place, a story<span className="text-emerald-400">.</span></h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/5 px-3 py-2 text-[10px] font-mono text-blue-200">
              <MapPin size={12} className="text-emerald-300" /> {travelSpots.length} destinations
            </span>
          </div>

          <div className="atlas-canvas relative aspect-[4/3] sm:aspect-[16/9]">
            <ComposableMap width={960} height={540} projectionConfig={{ scale: 160 }} className="atlas-map" aria-label="World map with clickable travel destinations">
              <defs>
                <linearGradient id="atlas-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3046" />
                  <stop offset="100%" stopColor="#132034" />
                </linearGradient>
              </defs>
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates}
                minZoom={1}
                maxZoom={12}
                onMoveStart={() => setHoveredGroup(null)}
                onMoveEnd={setPosition}
              >
                <Graticule stroke="#55718c" strokeWidth={0.45} strokeOpacity={0.14} pointerEvents="none" />
                <Geographies geography={geoUrl}>
                  {({ geographies }) => geographies.map(geo => {
                    const visited = travelSpots.some(spot => geoContains(geo, spot.coordinates));
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        tabIndex={-1}
                        fill={visited ? '#193e54' : 'url(#atlas-land)'}
                        stroke={visited ? '#37637c' : '#304158'}
                        strokeWidth={0.55}
                        vectorEffect="non-scaling-stroke"
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: visited ? '#22566b' : '#243b52', outline: 'none' },
                          pressed: { fill: visited ? '#22566b' : '#243b52', outline: 'none' },
                        }}
                      />
                    );
                  })}
                </Geographies>

                {travelSpots.map(spot => {
                  const radius = 4 / Math.sqrt(position.zoom);
                  return (
                    <Marker key={spot.id} coordinates={spot.coordinates}>
                      <Motion.circle
                        r={radius * 2.8}
                        fill="#34d399"
                        pointerEvents="none"
                        animate={reducedMotion ? { opacity: 0.12 } : { opacity: [0.2, 0.04, 0.2] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      />
                      <g
                        className="atlas-marker cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${spot.name} gallery or nearby destinations`}
                        onMouseEnter={event => {
                          const group = nearbySpots(spot);
                          if (position.zoom <= 5 && group.length > 1) showGroup(event, group);
                          else setHoveredGroup(null);
                        }}
                        onClick={event => openSpot(event, spot)}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openSpot(event, spot);
                          }
                        }}
                      >
                        <circle className="atlas-marker-dot" r={radius} fill="#60a5fa" stroke="#d1fae5" strokeWidth={1.4 / Math.sqrt(position.zoom)} />
                        <circle r={radius} fill="transparent" stroke="transparent" strokeWidth={20} vectorEffect="non-scaling-stroke" />
                        <title>{spot.name}</title>
                      </g>
                      {position.zoom > 3 && (
                        <text textAnchor="middle" y={-(radius + 6)} style={{ fontSize: `${11 / Math.sqrt(position.zoom)}px`, fill: '#dbeafe', pointerEvents: 'none' }}>{spot.name}</text>
                      )}
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>

            <div className="absolute right-3 bottom-3 flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/80 p-1.5 shadow-xl backdrop-blur-xl sm:right-6 sm:bottom-6">
              <button type="button" aria-label="Zoom in" disabled={position.zoom >= 12} onClick={() => changeZoom(1.5)} className="atlas-control"><Plus size={17} /></button>
              <button type="button" aria-label="Zoom out" disabled={position.zoom <= 1} onClick={() => changeZoom(1 / 1.5)} className="atlas-control"><Minus size={17} /></button>
              <span className="mx-2 my-0.5 h-px bg-white/10" />
              <button type="button" aria-label="Reset map view" onClick={() => { setHoveredGroup(null); setPosition(INITIAL_POSITION); }} className="atlas-control"><RotateCcw size={15} /></button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa55]" /> Destinations</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-sm border border-emerald-300/40 bg-emerald-300/15" /> Visited countries</span>
            </div>
            <p className="text-[11px] text-slate-500">Drag to explore · Scroll or pinch to zoom</p>
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400 sm:mt-6">Choose a destination to open its gallery. Nearby places appear together.</p>

        <AnimatePresence>
          {hoveredGroup && (
            <Motion.div
              key="destination-picker"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
              onMouseLeave={() => setHoveredGroup(null)}
              style={{ position: 'fixed', ...menuPosition, zIndex: 50 }}
              className="w-60 rounded-3xl border border-blue-300/20 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl"
              role="dialog"
              aria-label="Choose a nearby destination"
            >
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.18em] text-blue-300"><Navigation size={11} /> Nearby places</span>
                <button type="button" aria-label="Close destination picker" onClick={() => setHoveredGroup(null)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><X size={13} /></button>
              </div>
              {hoveredGroup.map(spot => (
                <button key={spot.id} type="button" onClick={() => navigate(`/gallery/${spot.id}`)} className="group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-blue-400/10 hover:text-blue-200 focus-visible:outline-2 focus-visible:outline-blue-400">
                  {spot.name}<ArrowRight size={14} className="text-emerald-300 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </Motion.div>
          )}
        </AnimatePresence>

        {import.meta.env.DEV && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <aside className="fixed right-4 bottom-4 z-40 rounded-3xl border border-blue-400/20 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-3 text-[10px] font-mono uppercase tracking-widest text-blue-300">Smart Coords Finder</h3>
            <div className="flex gap-2">
              <input type="text" value={queryCity} onChange={event => setQueryCity(event.target.value)} placeholder="City, Country" aria-label="Find city coordinates" className="w-40 rounded-full border border-white/10 bg-slate-950 px-4 py-2 text-xs text-white outline-none focus:border-blue-400" />
              <button type="button" onClick={handleSmartSearch} disabled={loading} className="rounded-full bg-blue-600 px-4 py-2 text-[10px] font-bold text-white hover:bg-blue-500 disabled:opacity-50">{loading ? '...' : 'GET CODE'}</button>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

export default MapHome;
