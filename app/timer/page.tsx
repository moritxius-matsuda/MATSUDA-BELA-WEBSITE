import { useState, useEffect } from 'react';

export default function TimerPage() {
  const [time, setTime] = useState({
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

  const startTimer = () => {
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
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-auto shadow-lg">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Glass Timer</h1>
        
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="text-6xl font-bold text-white">{time.hours}</div>
          <div className="text-6xl font-bold text-white">{time.minutes}</div>
          <div className="text-6xl font-bold text-white">{time.seconds}</div>
        </div>

        <div className="flex gap-4 justify-center">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="px-8 py-4 bg-blue-500/20 backdrop-blur-lg rounded-full text-white font-bold hover:bg-blue-500/30 transition-all duration-300"
            >
              Start
            </button>
          ) : isPaused ? (
            <button
              onClick={() => setIsPaused(false)}
              className="px-8 py-4 bg-green-500/20 backdrop-blur-lg rounded-full text-white font-bold hover:bg-green-500/30 transition-all duration-300"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-4 bg-yellow-500/20 backdrop-blur-lg rounded-full text-white font-bold hover:bg-yellow-500/30 transition-all duration-300"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={resetTimer}
            className="px-8 py-4 bg-red-500/20 backdrop-blur-lg rounded-full text-white font-bold hover:bg-red-500/30 transition-all duration-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
