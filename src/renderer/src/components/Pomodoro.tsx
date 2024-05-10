import { useState, useEffect } from 'react'
import { CirclePause, CirclePlay, RotateCcw } from "lucide-react";

function PomodoroTimer() {
  // Настройки таймера (в минутах)
  const workTime = 25
  const breakTime = 5

  // Состояния компонента
  const [secondsLeft, setSecondsLeft] = useState(workTime * 60)
  const [isActive, setIsActive] = useState(false)
  const [onBreak, setOnBreak] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft(secondsLeft => secondsLeft - 1);
      }, 1000);
    } else if (!isActive && secondsLeft !== 0) {
      if (interval) clearInterval(interval);
    }

    if (secondsLeft === 0) {
      if (!onBreak) {
        setSecondsLeft(breakTime * 60);
        setOnBreak(true);
      } else {
        setSecondsLeft(workTime * 60);
        setOnBreak(false);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, onBreak, breakTime, workTime]);

  // Функции для управления таймером
  const startTimer = () => {
    setIsActive(true)
  }

  const stopTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setSecondsLeft(workTime * 60)
    setOnBreak(false)
  }

  // Форматирование отображаемого времени
  const formatTime = () => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className={"text-white bg-red-500 p-3"}>
      <h2 className={"font-semibold"}>Pomodoro Timer</h2>
      <p>{formatTime()}</p>
      <button onClick={startTimer}><CirclePlay /></button>
      <button onClick={stopTimer}><CirclePause /></button>
      <button onClick={resetTimer}><RotateCcw /></button>
      {onBreak && <p>Break Time!</p>}
    </div>
  )
}

export default PomodoroTimer
