
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';

interface PerformanceMetricsCardProps {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({ 
  totalReturn, 
  sharpeRatio, 
  maxDrawdown, 
  volatility 
}) => {
  return (
    <Card className="border-gray-800">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-md ${totalReturn >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {totalReturn >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Return</p>
            <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(totalReturn * 100).toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-md ${sharpeRatio >= 1 ? 'bg-green-500/20' : sharpeRatio >= 0 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
            <BarChart3 className={`h-5 w-5 ${sharpeRatio >= 1 ? 'text-green-500' : sharpeRatio >= 0 ? 'text-amber-500' : 'text-red-500'}`} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Sharpe Ratio</p>
            <p className={`text-xl font-bold ${sharpeRatio >= 1 ? 'text-green-500' : sharpeRatio >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
              {sharpeRatio.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-md ${maxDrawdown < 0.1 ? 'bg-green-500/20' : maxDrawdown < 0.2 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
            <TrendingDown className={`h-5 w-5 ${maxDrawdown < 0.1 ? 'text-green-500' : maxDrawdown < 0.2 ? 'text-amber-500' : 'text-red-500'}`} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Max Drawdown</p>
            <p className={`text-xl font-bold ${maxDrawdown < 0.1 ? 'text-green-500' : maxDrawdown < 0.2 ? 'text-amber-500' : 'text-red-500'}`}>
              {(maxDrawdown * 100).toFixed(2)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-md ${volatility < 0.1 ? 'bg-green-500/20' : volatility < 0.2 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
            <DollarSign className={`h-5 w-5 ${volatility < 0.1 ? 'text-green-500' : volatility < 0.2 ? 'text-amber-500' : 'text-red-500'}`} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Annualized Volatility</p>
            <p className={`text-xl font-bold ${volatility < 0.1 ? 'text-green-500' : volatility < 0.2 ? 'text-amber-500' : 'text-red-500'}`}>
              {(volatility * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
