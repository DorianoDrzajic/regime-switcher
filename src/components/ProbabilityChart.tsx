
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { marketRegimeColors } from '@/lib/utils';
import { MarketRegime } from '@/lib/models/hmm';

interface ProbabilityChartProps {
  data: Array<{
    date: string;
    Bull: number;
    Bear: number;
    Neutral: number;
    Volatile: number;
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
            <span>{entry.name}: {(entry.value * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ data }) => {
  return (
    <Card className="border-gray-800">
      <CardHeader>
        <CardTitle>Regime Probabilities</CardTitle>
        <CardDescription>
          Bayesian posterior probabilities of each market regime
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              stackOffset="expand"
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
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area 
                type="monotone" 
                dataKey="Bull" 
                stackId="1" 
                stroke={marketRegimeColors.Bull} 
                fill={marketRegimeColors.Bull} 
              />
              <Area 
                type="monotone" 
                dataKey="Bear" 
                stackId="1" 
                stroke={marketRegimeColors.Bear} 
                fill={marketRegimeColors.Bear} 
              />
              <Area 
                type="monotone" 
                dataKey="Neutral" 
                stackId="1" 
                stroke={marketRegimeColors.Neutral} 
                fill={marketRegimeColors.Neutral} 
              />
              <Area 
                type="monotone" 
                dataKey="Volatile" 
                stackId="1" 
                stroke={marketRegimeColors.Volatile} 
                fill={marketRegimeColors.Volatile} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProbabilityChart;
