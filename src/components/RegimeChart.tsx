
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { marketRegimeColors } from '@/lib/utils';
import { MarketRegime } from '@/lib/models/hmm';

interface RegimeChartProps {
  priceData: Array<{
    date: string;
    price: number;
  }>;
  regimeData: Array<{
    date: string;
    regime: MarketRegime;
    probability: number;
  }>;
}

// Custom tooltip component
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="font-medium">{label}</p>
        <p>Price: ${payload[0].value.toFixed(2)}</p>
        {payload[1] && (
          <div className="mt-1">
            <p className="font-medium">Regime: {payload[1].payload.regime}</p>
            <div 
              className="w-3 h-3 inline-block mr-1"
              style={{ backgroundColor: marketRegimeColors[payload[1].payload.regime] }}
            />
            <span>Probability: {(payload[1].payload.probability * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

const RegimeChart: React.FC<RegimeChartProps> = ({ priceData, regimeData }) => {
  const [showProbabilities, setShowProbabilities] = useState(false);

  // Combine price and regime data
  const combinedData = priceData.map(pricePoint => {
    const matchingRegime = regimeData.find(r => r.date === pricePoint.date);
    return {
      ...pricePoint,
      regime: matchingRegime?.regime || undefined,
      probability: matchingRegime?.probability || 0
    };
  });

  // Determine regime transitions for reference lines
  const regimeTransitions = regimeData.reduce((transitions, curr, i, arr) => {
    if (i > 0 && curr.regime !== arr[i - 1].regime) {
      transitions.push(curr.date);
    }
    return transitions;
  }, [] as string[]);

  return (
    <Card className="border-gray-800">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Market Price & Detected Regimes</CardTitle>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-finance-bull rounded-full" />
              <span className="text-sm">Bull</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-finance-bear rounded-full" />
              <span className="text-sm">Bear</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-finance-neutral rounded-full" />
              <span className="text-sm">Neutral</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-finance-volatility rounded-full" />
              <span className="text-sm">Volatile</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference lines for regime transitions */}
              {regimeTransitions.map((date, i) => (
                <ReferenceLine 
                  key={i} 
                  x={date} 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeDasharray="3 3" 
                />
              ))}
              
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#priceGradient)" 
                name="Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegimeChart;
