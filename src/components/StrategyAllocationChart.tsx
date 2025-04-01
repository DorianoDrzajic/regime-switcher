
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StrategyAllocation } from '@/lib/models/strategy';

interface StrategyAllocationChartProps {
  allocation: StrategyAllocation[];
  title?: string;
  description?: string;
}

// Format strategy names for display
const formatStrategyName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
};

// Custom tooltip
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p className="font-medium">{formatStrategyName(data.name)}</p>
        <p>{(data.weight * 100).toFixed(1)}% allocation</p>
      </div>
    );
  }
  return null;
};

const StrategyAllocationChart: React.FC<StrategyAllocationChartProps> = ({ 
  allocation,
  title = "Strategy Allocation",
  description = "Optimal strategy weights based on current regime probabilities"
}) => {
  // Format data for the pie chart
  const data = allocation.map(item => ({
    name: item.name,
    weight: item.weight,
    color: item.color
  }));

  return (
    <Card className="border-gray-800">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="weight"
                nameKey="name"
                label={({ name, weight }) => `${formatStrategyName(name)}: ${(weight * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value) => formatStrategyName(value)}
                layout="horizontal"
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyAllocationChart;
