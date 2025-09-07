import { memo } from "react";

interface MiniChartProps {
  data: number[];
  type: 'line' | 'bar' | 'progress';
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

function MiniChart({ 
  data, 
  type, 
  color = '#3b82f6', 
  height = 30, 
  width = 80,
  className = ""
}: MiniChartProps) {
  if (!data || data.length === 0) {
    return <div className={`${className}`} style={{ width, height }} />;
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  if (type === 'progress') {
    const percentage = Math.min(100, Math.max(0, data[0] || 0));
    return (
      <div className={`bg-gray-200 rounded-full ${className}`} style={{ width, height: 6 }}>
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  }

  if (type === 'bar') {
    const barWidth = Math.max(2, width / data.length - 1);
    return (
      <div className={`flex items-end gap-0.5 ${className}`} style={{ width, height }}>
        {data.map((value, index) => {
          const barHeight = range > 0 ? ((value - minValue) / range) * height : height / 2;
          return (
            <div
              key={index}
              className="transition-all duration-300"
              style={{
                width: barWidth,
                height: Math.max(2, barHeight),
                backgroundColor: color,
                opacity: 0.8,
                borderRadius: '1px'
              }}
            />
          );
        })}
      </div>
    );
  }

  // Line chart (default)
  if (data.length < 2) {
    return <div className={`${className}`} style={{ width, height }} />;
  }

  const points: string[] = [];
  const stepX = width / (data.length - 1);

  data.forEach((value, index) => {
    const x = index * stepX;
    const y = range > 0 ? height - ((value - minValue) / range) * height : height / 2;
    points.push(`${x},${y}`);
  });

  const pathD = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point}` : ` L ${point}`);
  }, '');

  return (
    <svg 
      className={`${className}`} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    >
      <path
        d={pathD}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ 
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
        }}
      />
      {/* Optional dots */}
      {points.map((point, index) => {
        const [x, y] = point.split(',').map(Number);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}

export default memo(MiniChart);