import { memo, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/currency";

interface ChartDataPoint {
  value: number;
  label: string;
  date?: string;
  currency?: string;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'progress';
  color?: string;
  height?: number;
  width?: number;
  className?: string;
  showTooltip?: boolean;
  animated?: boolean;
  gradientFill?: boolean;
}

function InteractiveChart({ 
  data, 
  type, 
  color = '#3b82f6', 
  height = 120, 
  width = 200,
  className = "",
  showTooltip = true,
  animated = true,
  gradientFill = false
}: InteractiveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null);

  const handleMouseEnter = useCallback((index: number, event: React.MouseEvent) => {
    if (showTooltip) {
      setHoveredIndex(index);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltipPosition(null);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center text-gray-400 ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Progress Chart
  if (type === 'progress') {
    const percentage = Math.min(100, Math.max(0, values[0] || 0));
    return (
      <div className={`relative ${className}`} style={{ width, height: 8 }}>
        <div className="bg-gray-200 rounded-full h-full">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${animated ? 'animate-pulse' : ''}`}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color,
              transition: animated ? 'width 0.8s ease-out' : 'none'
            }}
          />
        </div>
        {showTooltip && hoveredIndex !== null && tooltipPosition && (
          <div className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
               style={{ left: tooltipPosition.x, top: tooltipPosition.y - 30 }}>
            {data[0]?.label}: {percentage.toFixed(1)}%
          </div>
        )}
      </div>
    );
  }

  // Pie/Donut Chart
  if (type === 'pie' || type === 'donut') {
    const total = values.reduce((sum, value) => sum + value, 0);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = type === 'donut' ? radius * 0.6 : 0;

    let currentAngle = -90;
    
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <svg width={width} height={height} className="cursor-pointer">
          {gradientFill && (
            <defs>
              {data.map((_, index) => {
                const segmentColor = `hsl(${(index * 60) % 360}, 70%, 50%)`;
                return (
                  <radialGradient key={index} id={`${gradientId}-${index}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={segmentColor} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={segmentColor} stopOpacity="0.5" />
                  </radialGradient>
                );
              })}
            </defs>
          )}
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            let pathData = `M ${centerX} ${centerY}`;
            pathData += ` L ${x1} ${y1}`;
            pathData += ` A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
            pathData += ` Z`;
            
            if (type === 'donut') {
              const ix1 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const iy1 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
              const ix2 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const iy2 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
              
              pathData = `M ${x1} ${y1}`;
              pathData += ` A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
              pathData += ` L ${ix2} ${iy2}`;
              pathData += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}`;
              pathData += ` Z`;
            }
            
            currentAngle += angle;
            
            const segmentColor = `hsl(${(index * 60) % 360}, 70%, 50%)`;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={gradientFill ? `url(#${gradientId}-${index})` : segmentColor}
                stroke="white"
                strokeWidth="2"
                className={`transition-all duration-300 ${animated ? 'hover:scale-105' : ''}`}
                style={{
                  opacity: hoveredIndex === index ? 1 : 0.8,
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`,
                  filter: hoveredIndex === index ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>
        
        {showTooltip && hoveredIndex !== null && tooltipPosition && (
          <div className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded text-sm whitespace-nowrap pointer-events-none"
               style={{ left: tooltipPosition.x - 50, top: tooltipPosition.y - 60 }}>
            <div className="font-medium">{data[hoveredIndex].label}</div>
            <div>{data[hoveredIndex].currency ? 
              formatCurrency(data[hoveredIndex].value, data[hoveredIndex].currency as 'USD' | 'EUR' | 'GBP') : 
              data[hoveredIndex].value.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Bar Chart
  if (type === 'bar') {
    const barWidth = Math.max(8, (width - (data.length + 1) * 4) / data.length);
    const chartHeight = height - 20;
    
    return (
      <div className={`relative ${className}`} style={{ width, height }}>
        <svg width={width} height={height}>
          {gradientFill && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="0.3" />
              </linearGradient>
            </defs>
          )}
          {data.map((item, index) => {
            const barHeight = range > 0 ? ((item.value - minValue) / range) * chartHeight : chartHeight / 2;
            const x = index * (barWidth + 4) + 4;
            const y = height - barHeight - 10;
            
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barHeight)}
                fill={gradientFill ? `url(#${gradientId})` : color}
                className={`transition-all duration-300 cursor-pointer ${animated ? 'hover:opacity-80' : ''}`}
                style={{
                  opacity: hoveredIndex === index ? 0.9 : 0.7,
                  transform: hoveredIndex === index && animated ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom'
                }}
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>
        
        {showTooltip && hoveredIndex !== null && tooltipPosition && (
          <div className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded text-sm whitespace-nowrap pointer-events-none"
               style={{ left: tooltipPosition.x - 40, top: tooltipPosition.y - 60 }}>
            <div className="font-medium">{data[hoveredIndex].label}</div>
            <div>{data[hoveredIndex].currency ? 
              formatCurrency(data[hoveredIndex].value, data[hoveredIndex].currency as 'USD' | 'EUR' | 'GBP') : 
              data[hoveredIndex].value.toLocaleString()}
            </div>
            {data[hoveredIndex].date && (
              <div className="text-xs opacity-75">{data[hoveredIndex].date}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Line/Area Chart
  if (data.length < 2) {
    return <div className={`${className}`} style={{ width, height }} />;
  }

  const points: string[] = [];
  const stepX = (width - 20) / (data.length - 1);
  const chartHeight = height - 20;

  data.forEach((item, index) => {
    const x = index * stepX + 10;
    const y = range > 0 ? chartHeight - ((item.value - minValue) / range) * chartHeight + 10 : height / 2;
    points.push(`${x},${y}`);
  });

  const pathD = points.reduce((path, point, index) => {
    return path + (index === 0 ? `M ${point}` : ` L ${point}`);
  }, '');

  let areaPath = '';
  if (type === 'area') {
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const [lastX] = lastPoint.split(',').map(Number);
    const [firstX] = firstPoint.split(',').map(Number);
    
    areaPath = pathD + ` L ${lastX},${height - 10} L ${firstX},${height - 10} Z`;
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg width={width} height={height}>
        {gradientFill && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
        )}
        
        {type === 'area' && (
          <path
            d={areaPath}
            fill={gradientFill ? `url(#${gradientId})` : color}
            opacity="0.3"
            className={animated ? 'animate-pulse' : ''}
          />
        )}
        
        <path
          d={pathD}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-pulse' : ''}
          style={{ 
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
          }}
        />
        
        {points.map((point, index) => {
          const [x, y] = point.split(',').map(Number);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={hoveredIndex === index ? "5" : "3"}
              fill={color}
              className="cursor-pointer transition-all duration-200"
              style={{
                opacity: hoveredIndex === index ? 1 : 0.8,
                filter: hoveredIndex === index ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
              }}
              onMouseEnter={(e) => handleMouseEnter(index, e)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </svg>
      
      {showTooltip && hoveredIndex !== null && tooltipPosition && (
        <div className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded text-sm whitespace-nowrap pointer-events-none"
             style={{ left: tooltipPosition.x - 50, top: tooltipPosition.y - 70 }}>
          <div className="font-medium">{data[hoveredIndex].label}</div>
          <div>{data[hoveredIndex].currency ? 
            formatCurrency(data[hoveredIndex].value, data[hoveredIndex].currency as 'USD' | 'EUR' | 'GBP') : 
            data[hoveredIndex].value.toLocaleString()}
          </div>
          {data[hoveredIndex].date && (
            <div className="text-xs opacity-75">{data[hoveredIndex].date}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(InteractiveChart);