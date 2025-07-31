import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, CurrencyCode } from '@/lib/currency';
import { useT } from '@/lib/i18n';
import { ClientSegment } from '@/types/advancedAnalytics';

interface ClientSegmentationProps {
  segments: ClientSegment[];
  userCurrency: CurrencyCode;
}

const ClientSegmentation: React.FC<ClientSegmentationProps> = ({
  segments,
  userCurrency,
}) => {
  const t = useT();

  const getSegmentEmoji = (segment: string) => {
    switch (segment) {
      case 'champion': return '🏆';
      case 'growing': return '🌱';
      case 'stable': return '⚖️';
      case 'at-risk': return '⚠️';
      case 'one-time': return '1️⃣';
      default: return '👤';
    }
  };

  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'champion': return 'Champions';
      case 'growing': return 'Growing';
      case 'stable': return 'Stable';
      case 'at-risk': return 'At Risk';
      case 'one-time': return 'One-time';
      default: return segment;
    }
  };

  const chartData = segments.map(segment => ({
    name: getSegmentLabel(segment.segment),
    value: segment.count,
    totalValue: segment.totalValue,
    avgValue: segment.avgValue,
    color: segment.color,
  }));

  const chartConfig = {
    count: { label: "Clients", color: "hsl(var(--chart-1))" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="card-flat">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
            📊 Client Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[250px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.value} clients
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.totalValue, userCurrency)} total value
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Segment Details */}
      <Card className="card-flat">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-primary">
            Segment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getSegmentEmoji(segment.segment)}
                  </span>
                  <div>
                    <p className="font-medium text-sm">
                      {getSegmentLabel(segment.segment)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {segment.count} clients
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatCurrency(segment.totalValue, userCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(segment.avgValue, userCurrency)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSegmentation;