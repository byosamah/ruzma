import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy load heavy chart components
const LineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);

const BarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);

const PieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);

const Line = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);

const Bar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);

const Pie = lazy(() => 
  import('recharts').then(module => ({ default: module.Pie }))
);

const Cell = lazy(() => 
  import('recharts').then(module => ({ default: module.Cell }))
);

const XAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);

const YAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);

const CartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);

const Legend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);

// Chart loading fallback
const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className={`w-full h-[${height}px]`} />
  </div>
);

// Optimized chart components with suspense
export const LazyLineChart = React.memo(({ data, config, ...props }: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <LineChart data={data} {...props}>
      <Suspense fallback={null}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Legend />
        {config.lines?.map((lineConfig: any, index: number) => (
          <Line
            key={index}
            type="monotone"
            dataKey={lineConfig.dataKey}
            stroke={lineConfig.stroke}
            strokeWidth={2}
          />
        ))}
      </Suspense>
    </LineChart>
  </Suspense>
));

export const LazyBarChart = React.memo(({ data, config, ...props }: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <BarChart data={data} {...props}>
      <Suspense fallback={null}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={config.xAxisKey || 'month'} />
        <YAxis />
        <Legend />
        {config.bars?.map((barConfig: any, index: number) => (
          <Bar
            key={index}
            dataKey={barConfig.dataKey}
            fill={barConfig.fill}
          />
        ))}
      </Suspense>
    </BarChart>
  </Suspense>
));

export const LazyPieChart = React.memo(({ data, config, ...props }: any) => (
  <Suspense fallback={<ChartSkeleton height={250} />}>
    <PieChart {...props}>
      <Suspense fallback={null}>
        <Pie
          data={data}
          cx="50%"
          cy="50%" 
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={config.dataKey || 'value'}
        >
          {data?.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color || config.colors?.[index % config.colors.length]} />
          ))}
        </Pie>
        <Legend />
      </Suspense>
    </PieChart>
  </Suspense>
));

// Wrapper components for easy replacement
export const OptimizedRevenueChart = ({ revenueData, currency }: { revenueData: any[], currency: string }) => {
  const config = {
    lines: [
      { dataKey: 'revenue', stroke: '#8884d8' },
      { dataKey: 'projects', stroke: '#82ca9d' }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <LazyLineChart
          data={revenueData}
          config={config}
          width={600}
          height={300}
        />
      </CardContent>
    </Card>
  );
};

export const OptimizedMilestoneChart = ({ milestoneData }: { milestoneData: any[] }) => {
  const config = {
    dataKey: 'count',
    colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <LazyPieChart
          data={milestoneData}
          config={config}
          width={400}
          height={300}
        />
      </CardContent>
    </Card>
  );
};

export const OptimizedProgressChart = ({ progressData }: { progressData: any[] }) => {
  const config = {
    xAxisKey: 'month',
    bars: [
      { dataKey: 'completed', fill: '#82ca9d' },
      { dataKey: 'pending', fill: '#8884d8' }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <LazyBarChart
          data={progressData}
          config={config}
          width={600}
          height={300}
        />
      </CardContent>
    </Card>
  );
};