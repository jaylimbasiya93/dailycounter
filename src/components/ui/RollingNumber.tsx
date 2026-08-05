import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface RollingNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const spring = useSpring(value, { mass: 0.8, stiffness: 200, damping: 25 });
  const animatedValue = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = animatedValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [animatedValue]);

  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight tabular-nums ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <motion.span>{displayValue.toLocaleString('en-IN')}</motion.span>
      {suffix && <span className="ml-1 text-sm font-medium">{suffix}</span>}
    </span>
  );
};
