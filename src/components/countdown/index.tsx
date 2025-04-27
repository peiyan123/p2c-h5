import React from 'react';
const CountDown = ({ hours = 0, minutes = 0, seconds = 0 }) => {
  const [paused, setPaused] = React.useState(false);
  const [over, setOver] = React.useState(false);
  // time default value object
  const [time, setTime] = React.useState({
    hours: parseInt(hours),
    minutes: parseInt(minutes),
    seconds: parseInt(seconds),
  });

  const tick = () => {
    // stop
    if (paused || over) return;
    if (time.hours === 0 && time.minutes === 0 && time.seconds === 0)
      setOver(true);
    else if (time.minutes === 0 && time.seconds === 0)
      setTime({
        hours: time.hours - 1,
        minutes: 59,
        seconds: 59,
      });
    else if (time.seconds === 0)
      setTime({
        hours: time.hours,
        minutes: time.minutes - 1,
        seconds: 59,
      });
    else
      setTime({
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds - 1,
      });
  };

  React.useEffect(() => {
    let timerID = setInterval(() => tick(), 1000);
    return () => clearInterval(timerID);
  }, [time]);

  return (
    <div>
      <p>{`${time.minutes.toString().padStart(2, '0')}:${time.seconds
        .toString()
        .padStart(2, '0')}`}</p>
    </div>
  );
};
export default CountDown;
