import { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  useGrouping?: boolean;
}

const CountUp = ({ 
  end, 
  duration = 1.5, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  useGrouping = true
}: CountUpProps) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const tick = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / (duration * 1000);
      
      if (progress < 1) {
        // Ease out expo: 1 - Math.pow(2, -10 * progress)
        const easeOut = 1 - Math.pow(2, -10 * progress);
        setValue(end * easeOut);
        animationFrame = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formattedValue = value;
  
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping
  };

  const finalString = new Intl.NumberFormat('pt-BR', options).format(formattedValue);

  return (
    <span>{prefix}{finalString}{suffix}</span>
  );
};

export default CountUp;
