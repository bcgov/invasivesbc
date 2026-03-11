import { useEffect, useState } from 'react';
import './endlessLoadingBar.css';

const EndlessLoadingBar = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prev) => (prev + 1) % 20);
    }, 400);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div id="loading-bar-main">
      <p>Initializing Application</p>
      <div className="bar">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="progress" />
          ))}
      </div>
    </div>
  );
};

export default EndlessLoadingBar;
