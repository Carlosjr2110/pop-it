'use client'

import { useEffect, useRef, useState } from "react";
import logo from '../../public/LogoDev.png';

const totalButtons = 13;


const getButtonsToLight = (phase: number): number => {
  if (phase >= 1 && phase <= 5) return 3;
  if (phase >= 6 && phase <= 10) return 4;
  if (phase >= 11 && phase <= 15) return 5;
  if (phase >= 16 && phase <= 20) return 6;
  return 3; 
};

const getRandomIndexes = (count: number): number[] => {
  const indexes = new Set<number>();
  while (indexes.size < count) {
    const randomIndex = Math.floor(Math.random() * totalButtons);
    indexes.add(randomIndex);
  }
  return Array.from(indexes);
};

const App = () => {
  const [poppedStates, setPoppedStates] = useState<boolean[]>(Array(totalButtons).fill(false));
  const [phase, setPhase] = useState<number>(1);
  const [litButtons, setLitButtons] = useState<Set<number>>(new Set());
  const [pressedButtons, setPressedButtons] = useState<Set<number>>(new Set());
  const [isTopPressed, setIsTopPressed] = useState<boolean>(false);
  const [init, setInit] = useState<boolean>(false);
  const [isAdvanceButtonActive, setIsAdvanceButtonActive] = useState<boolean>(false);
  const [isAdvanceButton1Pressed, setIsAdvanceButton1Pressed] = useState<boolean>(false);
  const [isAdvanceButton2Pressed, setIsAdvanceButton2Pressed] = useState<boolean>(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(5);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const modalBackdropRef = useRef<HTMLDivElement>(null);

  const playPopitSound = () => {
    const sound = new Audio('/popit-sound.wav');
    sound.playbackRate = 4;
    sound.play();
  };

  const handleGameInit = () => {
    setInit(true);
    setPhase(1);
    setPoppedStates(Array(totalButtons).fill(false));
    setPressedButtons(new Set());
    setLitButtons(new Set());
    setIsAdvanceButton1Pressed(false);
    setIsAdvanceButton2Pressed(false);
    setTimeRemaining(5);
    setIsModalVisible(false);
  };

  const resetGame = () => {
    setInit(false);
    setPhase(1);
    setPoppedStates(Array(totalButtons).fill(false));
    setPressedButtons(new Set());
    setLitButtons(new Set());
    setIsAdvanceButton1Pressed(false);
    setIsAdvanceButton2Pressed(false);
    setTimeRemaining(5);
    if (timerInterval) clearInterval(timerInterval);
  };

  useEffect(() => {
    if (timeRemaining === 0) {
      setIsModalVisible(true);
      setModalMessage('Perdeu!! Tempo esgotado!!');
      resetGame();
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (phase === 21) {
      setIsModalVisible(true);
      setModalMessage('Ganhou! Você completou todas as fases!');
      resetGame();
    }
  }, [phase]);

  useEffect(() => {
    if (init) {
      const count = getButtonsToLight(phase);
      const newLitButtons = new Set(getRandomIndexes(count));
      setLitButtons(newLitButtons);
      playPopitSound();
      setTimeRemaining(5);
      if (timerInterval) clearInterval(timerInterval);
      const intervalId = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setTimerInterval(intervalId);
    }
  }, [phase, init]);

  useEffect(() => {
    const allLitButtonsPressed = Array.from(litButtons).every(index => pressedButtons.has(index));
    setIsAdvanceButtonActive(allLitButtonsPressed);
  }, [litButtons, pressedButtons]);

  useEffect(() => {
    if (isAdvanceButton1Pressed && isAdvanceButton2Pressed && isAdvanceButtonActive && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setPhase(prev => {
          const nextPhase = prev < 20 ? prev + 1 : 1;
          const count = getButtonsToLight(nextPhase);
          const newLitButtons = new Set(getRandomIndexes(count));
          setPoppedStates(Array(totalButtons).fill(false));
          setLitButtons(newLitButtons);
          setPressedButtons(new Set());
          playPopitSound();
          setTimeRemaining(4); 
          if (timerInterval) clearInterval(timerInterval);
          const intervalId = setInterval(() => {
            setTimeRemaining(prevTime => {
              if (prevTime <= 1) {
                clearInterval(intervalId);
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);
          setTimerInterval(intervalId);
          return nextPhase;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAdvanceButton1Pressed, isAdvanceButton2Pressed, isAdvanceButtonActive]);

  const togglePop = (index: number) => {
    if (!litButtons.has(index)) {
      setIsModalVisible(true);
      setModalMessage('Perdeu! Pressionou o pop-it errado!');
      resetGame();
      return;
    }

    setPoppedStates(prevStates =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
    setPressedButtons(prevButtons => {
      const newButtons = new Set(prevButtons);
      if (newButtons.has(index)) {
        newButtons.delete(index);
      } else {
        newButtons.add(index);
      }
      return newButtons;
    });
    if (litButtons.has(index)) {
      playPopitSound();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) &&
          modalBackdropRef.current && !modalBackdropRef.current.contains(event.target as Node)) {
        setIsModalVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBackdropClick = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="relative w-full h-screen">
    {isModalVisible && (
       <div
       ref={modalBackdropRef}
       onClick={handleBackdropClick}
       className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50"
     >
       <div
         ref={modalRef}
         className="bg-rose-300 transform rotate-90 p-4 rounded-lg shadow-lg"
         onClick={(e) => e.stopPropagation()}
       >
          <div className="bg-rose-200 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">{modalMessage}</h2>
          </div>
        </div>
      </div>
    )}

                
                <header className="fixed top-8 w-full bg-gray-600 flex items-center justify-center p-4 z-50">
        <div className="flex items-center space-x-2 text-white">
          <button onClick={resetGame} className="bg-red-500 transform rotate-90 rounded-md h-8 w-16">Resetar</button>
          <button onClick={handleGameInit} className="bg-blue-500 transform rotate-90 rounded-md h-8 w-16">Iniciar</button>
          <div className="flex items-center space-x-2">
            <div className='text-white transform rotate-90 text-sm font-semibold'>
              Pop-it Digital
            </div>
            <img src={logo.src} alt="Logo" className="w-8 h-8 rounded-md transform rotate-90" />
          </div>
        </div>
      </header>
      <div className="flex flex-col  items-center justify-center h-screen bg-gray-600">
      <div className="flex relative items-center">
      <button
          className={`relative px-4 py-2 w-36 h-16 ${isAdvanceButtonActive ? 'bg-rose-400 animate-pulse' : 'bg-cyan-300'} text-white border-2 border-double ${isAdvanceButtonActive ? 'border-cyan-200' : 'border-green-500'} rounded-full shadow-lg`}
          onClick={() => setIsAdvanceButton1Pressed(!isAdvanceButton1Pressed)}
          >
          <div className="absolute inset-0 border-2 border-double border-cyan-200 rounded-full"></div>
        </button>
        <div className="transform rotate-90 absolute ml-40 flex flex-col text-white">
        <div className="">Tempo:</div>
        <div className="text-white font-bold text-lg bg-cyan-500 rounded-full flex justify-center items-center p-2 shadow-lg">
                {timeRemaining}
              </div>        
        </div>

        </div>
        <div className="mt-24 mb-24 p-4 w-[400px] bg-slate-300 border-2 border-gray-200 rounded-lg shadow-lg transform rotate-90">
          <div className="flex justify-center mb-2">
            <div className="grid grid-cols-4 gap-2">
              {poppedStates.slice(0, 4).map((isPopped, index) => (
                <button
                  key={index}
                  onClick={() => togglePop(index)}
                  className={`w-16 h-16 rounded-full transition-transform duration-300 ${
                    isPopped
                      ? 'bg-cyan-500 shadow-inner'
                      : 'bg-cyan-200 shadow-lg border-4 border-double border-cyan-400'
                  } ${!isPopped ? 'hover:scale-105' : ''} relative ${
                    litButtons.has(index) && !isPopped ? 'bg-rose-400 animate-pulse border-4' : ''
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full transition-transform duration-200 transform ${
                      isPopped ? 'translate-y-2 scale-95' : '-translate-y-2'
                    }`}
                  />
                  {!isPopped && (
                    <div className="absolute inset-0 w-full h-full rounded-full border-2 border-gray-300"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center mb-2">
            <div className="grid grid-cols-5 gap-2">
              {poppedStates.slice(4, 9).map((isPopped, index) => (
                <button
                  key={index + 4}
                  onClick={() => togglePop(index + 4)}
                  className={`w-16 h-16 rounded-full transition-transform duration-300 ${
                    isPopped
                      ? 'bg-cyan-500 shadow-inner'
                      : 'bg-cyan-200 shadow-lg border-4 border-double border-cyan-400'
                  } ${!isPopped ? 'hover:scale-105' : ''} relative ${
                    litButtons.has(index + 4) && !isPopped ? 'bg-rose-400 animate-pulse border-4' : ''
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full transition-transform duration-200 transform ${
                      isPopped ? 'translate-y-2 scale-95' : '-translate-y-2'
                    }`}
                  />
                  {!isPopped && (
                    <div className="absolute inset-0 w-full h-full rounded-full border-2 border-gray-300"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-2">
              {poppedStates.slice(9, 13).map((isPopped, index) => (
                <button
                  key={index + 9}
                  onClick={() => togglePop(index + 9)}
                  className={`w-16 h-16 rounded-full transition-transform duration-300 ${
                    isPopped
                      ? 'bg-cyan-500 shadow-inner'
                      : 'bg-cyan-200 shadow-lg border-4 border-double border-cyan-400'
                  } ${!isPopped ? 'hover:scale-105' : ''} relative ${
                    litButtons.has(index + 9) && !isPopped ? 'bg-rose-400 animate-pulse border-4' : ''
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full transition-transform duration-200 transform ${
                      isPopped ? 'translate-y-2 scale-95' : '-translate-y-2'
                    }`}
                  />
                  {!isPopped && (
                    <div className="absolute inset-0 w-full h-full rounded-full border-2 border-gray-300"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex relative items-center">
        
        <button
          className={`relative px-4 py-2 w-36 h-16 ${isAdvanceButtonActive ? 'bg-rose-400 animate-pulse' : 'bg-cyan-300'} text-white border-2 border-double ${isAdvanceButtonActive ? 'border-cyan-200' : 'border-green-500'} rounded-full shadow-lg`}
          onClick={() => setIsAdvanceButton2Pressed(!isAdvanceButton2Pressed)}
          >
          <div className="absolute inset-0 border-2 border-double border-cyan-200 rounded-full"></div>
        </button>
        <div className=" absolute transform rotate-90 ml-40 flex flex-col text-white">
        <div className="flex items-center justify-center">Fase:</div>
        <div className="text-white font-bold text-lg bg-cyan-500 rounded-full flex justify-center items-center p-2 pr-5 pl-5 shadow-lg">
                {phase}
        </div>          
        </div>
        </div>
      </div>
      
    </div>
  );
};

export default App