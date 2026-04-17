/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Trophy, 
  Settings2, 
  X, 
  History as HistoryIcon,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Option {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

const DEFAULT_OPTIONS: Option[] = [
  { id: '1', text: '披薩', color: COLORS[0] },
  { id: '2', text: '漢堡', color: COLORS[1] },
  { id: '3', text: '壽司', color: COLORS[2] },
  { id: '4', text: '拉麵', color: COLORS[3] },
  { id: '5', text: '火鍋', color: COLORS[4] },
  { id: '6', text: '牛排', color: COLORS[5] },
  { id: '7', text: '水餃', color: COLORS[6] },
  { id: '8', text: '便當', color: COLORS[7] },
  { id: '9', text: '炸雞', color: COLORS[0] },
  { id: '10', text: '煎包', color: COLORS[1] },
];

export default function App() {
  const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
  const [newOption, setNewOption] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Option | null>(null);
  const [history, setHistory] = useState<Option[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const wheelRef = useRef<HTMLDivElement>(null);

  const addOption = () => {
    if (newOption.trim() && options.length < 20) {
      const option: Option = {
        id: Math.random().toString(36).substr(2, 9),
        text: newOption.trim(),
        color: COLORS[options.length % COLORS.length],
      };
      setOptions([...options, option]);
      setNewOption('');
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(o => o.id !== id));
    }
  };

  const spin = useCallback(() => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    // Calculate random spin
    const spins = 5 + Math.floor(Math.random() * 5); // 5 to 10 full spins
    const extraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + (spins * 360) + extraDegrees;
    
    setRotation(newRotation);

    // Determine winner after transition
    setTimeout(() => {
      const normalizedDegrees = (newRotation % 360);
      // The pointer is at the top (90 degrees in SVG coordinate if 0 is right, but we adjust)
      // Actually, let's keep it simple: 0 degrees is the start of the first slice.
      // Pointer is at the top (270 degrees in SVG circle).
      // We rotate the wheel CLOCKWISE. So if wheel moves by R, the pointer relative to wheel moves ANTI-CLOCKWISE by R.
      // Pointer starts at 270. Relative pos = (270 - R) mod 360.
      
      const sliceAngle = 360 / options.length;
      const pointerPos = (360 - (normalizedDegrees % 360)) % 360;
      const winnerIndex = Math.floor(pointerPos / sliceAngle);
      
      const win = options[winnerIndex];
      setWinner(win);
      setHistory(prev => [win, ...prev].slice(0, 10));
      setIsSpinning(false);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [win.color, '#ffffff']
      });
    }, 4000);
  }, [isSpinning, options, rotation]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-indigo-100 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <RotateCcw className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">幸運大轉盤</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full hover:bg-stone-200 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2.5 rounded-full hover:bg-stone-200 transition-colors relative"
          >
            <HistoryIcon size={20} />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <button 
            onClick={() => setShowConfig(true)}
            className="p-2.5 rounded-full hover:bg-stone-200 transition-colors"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl gap-16 relative">
        {/* The Wheel */}
        <div className="relative group">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div className="w-8 h-10 bg-stone-800 clip-path-pointer shadow-xl rounded-t-sm" 
                 style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
          </div>

          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.15, 0, 0.15, 1] }}
            className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border-[12px] border-white bg-white"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {options.map((option, i) => {
                const angle = 360 / options.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;
                
                // SVG arc path
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                
                return (
                  <g key={option.id}>
                    <path d={pathData} fill={option.color} className="transition-all duration-300" />
                    <g transform={`rotate(${startAngle + angle / 2} 50 50)`}>
                      <text
                        x="75"
                        y="50"
                        fill="white"
                        fontSize="4"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        className="pointer-events-none drop-shadow-sm"
                        style={{ userSelect: 'none' }}
                      >
                        {option.text.length > 8 ? option.text.slice(0, 8) + '...' : option.text}
                      </text>
                    </g>
                  </g>
                );
              })}
              {/* Center Cap */}
              <circle cx="50" cy="50" r="4" fill="white" className="shadow-lg" />
              <circle cx="50" cy="50" r="2" fill="#d6d3d1" />
            </svg>
          </motion.div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-stone-900 text-white flex flex-col items-center justify-center shadow-2xl transition-all z-30 ${isSpinning ? 'scale-90 opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <Play className={`w-8 h-8 ${isSpinning ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold mt-1 tracking-widest uppercase">{isSpinning ? '轉動中' : '開始'}</span>
          </button>
        </div>

        {/* Winner Banner */}
        <AnimatePresence>
          {winner && !isSpinning && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white px-8 py-5 rounded-3xl shadow-2xl shadow-indigo-100 flex flex-col items-center gap-2 border border-stone-100"
            >
              <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-sm mb-1">
                <Trophy size={16} />
                恭喜抽中
              </div>
              <h2 className="text-4xl font-black" style={{ color: winner.color }}>
                {winner.text}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Config Overlay */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings2 className="text-indigo-600" />
                  設定選項 ({options.length}/20)
                </h3>
                <button onClick={() => setShowConfig(false)} className="p-2 hover:bg-stone-200 rounded-full">
                  <X />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    placeholder="輸入新選項..."
                    className="flex-1 bg-stone-100 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <button
                    onClick={addOption}
                    className="bg-indigo-600 text-white px-5 rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <Plus />
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl group border border-transparent hover:border-stone-200 transition-all">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: opt.color }} />
                      <span className="flex-1 font-medium">{opt.text}</span>
                      <button
                        onClick={() => removeOption(opt.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                        disabled={options.length <= 2}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-stone-50/50 border-t border-stone-100">
                <button
                  onClick={() => setShowConfig(false)}
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold tracking-wide hover:bg-stone-800 transition-all shadow-lg"
                >
                  確認
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0.9, x: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <HistoryIcon className="text-indigo-600" />
                  最近抽中
                </h3>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-stone-200 rounded-full">
                  <X />
                </button>
              </div>
              
              <div className="p-6 min-h-[200px] max-h-[400px] overflow-y-auto">
                {history.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-stone-400 gap-2">
                    <RotateCcw size={40} className="opacity-20" />
                    <p>尚未有任何紀錄</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl animate-in slide-in-from-right duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: h.color }}>
                          {history.length - i}
                        </div>
                        <span className="font-bold flex-1">{h.text}</span>
                        <span className="text-[10px] text-stone-400 font-medium">剛剛</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full max-w-4xl text-center py-8 text-stone-400 text-sm font-medium">
        點擊中心按鈕或轉盤開始轉動 • 做出決定，不再糾結
      </footer>
    </div>
  );
}
