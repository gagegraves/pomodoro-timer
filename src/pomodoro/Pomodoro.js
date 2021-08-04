import React, { useState } from "react";
import useInterval from "../utils/useInterval";
import DurationButtons from "./DurationButtons";
import TimerControls from "./TimerControls";
import ClockData from "./ClockData";

// These functions are defined outside of the component to insure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  const timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === "Focusing") {
      return {
        label: "On Break",
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: "Focusing",
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [session, setSession] = useState(null);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  const displayDuration = (label) => {
    if (label === "Focusing") {
      return focusDuration;
    } else return breakDuration;
  };

  const handleStop = (evt) => {
    evt.preventDefault();
    setIsTimerRunning(false);
    setSession(null);
  };

  const updateAria = (time, label) => {
    return 100 - (time / (displayDuration(label) * 60)) * 100;
  };
  const updatedAria = updateAria(session?.timeRemaining, session?.label);

  useInterval(
    () => {
      if (session.timeRemaining === 0) {
        new Audio("https://bigsoundbank.com/UPLOAD/mp3/1482.mp3").play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );

  const handleFocusIncrease = () => {
    setFocusDuration(Math.min(Math.max(parseInt(focusDuration + 5), 5), 60));
  };

  const handleFocusDecrease = () => {
    setFocusDuration(Math.min(Math.max(parseInt(focusDuration - 5), 5), 60));
  };

  const handleBreakIncrease = () => {
    setBreakDuration(Math.min(Math.max(parseInt(breakDuration + 1), 1), 15));
  };

  const handleBreakDecrease = () => {
    setBreakDuration(Math.min(Math.max(parseInt(breakDuration - 1), 1), 15));
  };

  /**
   * Called whenever the play/pause button is clicked.
   */

  function playPause() {
    setIsTimerRunning((prevState) => {
      const nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: "Focusing",
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  return (
    <div className="pomodoro">
      <DurationButtons
        session={session}
        focusDuration={focusDuration}
        breakDuration={breakDuration}
        handleFocusIncrease={handleFocusIncrease}
        handleFocusDecrease={handleFocusDecrease}
        handleBreakIncrease={handleBreakIncrease}
        handleBreakDecrease={handleBreakDecrease}
      />
      <TimerControls
        playPause={playPause}
        isTimerRunning={isTimerRunning}
        handleStop={handleStop}
        session={session}
      />
      <ClockData
        session={session}
        updatedAria={updatedAria}
        isTimerRunning={isTimerRunning}
        displayDuration={displayDuration}
      />
    </div>
  );
}

export default Pomodoro;
