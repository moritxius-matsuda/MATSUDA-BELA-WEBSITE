'use client'

import { useState, useEffect } from 'react';

export default function TimerPage() {
  const [time, setTime] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [inputTime, setInputTime] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          let { hours, minutes, seconds } = prevTime;
          
          if (seconds === '00') {
            if (minutes === '00') {
              if (hours === '00') {
                clearInterval(interval);
                setIsActive(false);
                return { hours: '00', minutes: '00', seconds: '00' };
              }
              hours = String(parseInt(hours) - 1).padStart(2, '0');
              minutes = '59';
            } else {
              minutes = String(parseInt(minutes) - 1).padStart(2, '0');
              seconds = '59';
            }
          } else {
            seconds = String(parseInt(seconds) - 1).padStart(2, '0');
          }

          return { hours, minutes, seconds };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hours' | 'minutes' | 'seconds') => {
    const value = e.target.value;
    const parsedValue = value.replace(/[^0-9]/g, '');
    const clampedValue = Math.min(Math.max(parseInt(parsedValue), 0), type === 'hours' ? 23 : 59);
    const formattedValue = clampedValue.toString().padStart(2, '0');
    setInputTime(prev => ({
      ...prev,
      [type]: formattedValue
    }));
  };

  const startTimer = () => {
    setTime(inputTime);
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime({ hours: '00', minutes: '00', seconds: '00' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Glass Timer</h1>
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputTime.hours}
              onChange={(e) => handleInputChange(e, 'hours')}
              placeholder="HH"
              className="glass-input w-24 text-center text-2xl font-bold text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
            <input
              type="text"
              value={inputTime.minutes}
              onChange={(e) => handleInputChange(e, 'minutes')}
              placeholder="MM"
              className="glass-input w-24 text-center text-2xl font-bold text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
            <input
              type="text"
              value={inputTime.seconds}
              onChange={(e) => handleInputChange(e, 'seconds')}
              placeholder="SS"
              className="glass-input w-24 text-center text-2xl font-bold text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>

          <div className="flex justify-center items-center gap-4">
            <div className="text-6xl font-bold text-white">{time.hours}</div>
            <div className="text-6xl font-bold text-white">{time.minutes}</div>
            <div className="text-6xl font-bold text-white">{time.seconds}</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="glass-button px-8 py-4 text-white font-bold hover:shadow-lg transition-all duration-300"
            >
              Start
            </button>
          ) : isPaused ? (
            <button
              onClick={() => setIsPaused(false)}
              className="glass-button px-8 py-4 bg-green-500/20 text-white font-bold hover:shadow-lg transition-all duration-300"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="glass-button px-8 py-4 bg-yellow-500/20 text-white font-bold hover:shadow-lg transition-all duration-300"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="glass-button px-8 py-4 bg-red-500/20 text-white font-bold hover:shadow-lg transition-all duration-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
