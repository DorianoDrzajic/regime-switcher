
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PortfolioPerformanceChartProps {
  data: Array<{
    date: string;
    benchmark: number;
    adaptivePortfolio: number;
    regimeLabel?: string;
  }>;
}

// Custom tooltip component
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center mt-1">
            <div 
              className="w-3 h-3 mr-1"
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}: {(entry.value * 100).toFixed(2)}%</span>
          </div>
        ))}
        {payload[0]?.payload?.regimeLabel && (
          <p className="mt-1 text-xs">Regime: {payload[0].payload.regimeLabel}</p>
        )}
      </div>
    );
  }

  return null;
};

const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({ data }) => {
  return (
    <Card className="border-gray-800">
      <CardHeader>
        <CardTitle>Cumulative Performance</CardTitle>
        <CardDescription>
          Comparing adaptive regime-switching strategy to market benchmark
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
                }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#94a3b8" 
                name="Market Benchmark" 
                dot={false}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="adaptivePortfolio" 
                stroke="#3b82f6" 
                name="Adaptive Strategy" 
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioPerformanceChart;
