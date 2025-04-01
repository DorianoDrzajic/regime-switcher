
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StrategyPerformance } from '@/lib/models/strategy';
import { MarketRegime } from '@/lib/models/hmm';
import { marketRegimeColors } from '@/lib/utils';

interface StrategyPerformanceTableProps {
  strategies: StrategyPerformance[];
}

// Format strategy names for display
const formatStrategyName = (name: string) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
};

const StrategyPerformanceTable: React.FC<StrategyPerformanceTableProps> = ({ strategies }) => {
  // All possible regimes
  const regimes: MarketRegime[] = ['Bull', 'Bear', 'Neutral', 'Volatile'];

  return (
    <Card className="border-gray-800">
      <CardHeader>
        <CardTitle>Strategy Performance by Regime</CardTitle>
        <CardDescription>
          Sharpe ratio and average returns across different market conditions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead>Overall Sharpe</TableHead>
              <TableHead>Max Drawdown</TableHead>
              {regimes.map(regime => (
                <TableHead key={regime}>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: marketRegimeColors[regime] }}
                    ></div>
                    {regime}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {strategies.map(strategy => (
              <TableRow key={strategy.name}>
                <TableCell className="font-medium">{formatStrategyName(strategy.name)}</TableCell>
                <TableCell className={strategy.sharpe > 1 ? 'text-green-400' : strategy.sharpe > 0 ? 'text-amber-400' : 'text-red-400'}>
                  {strategy.sharpe.toFixed(2)}
                </TableCell>
                <TableCell className={strategy.drawdown < 0.1 ? 'text-green-400' : strategy.drawdown < 0.2 ? 'text-amber-400' : 'text-red-400'}>
                  {(strategy.drawdown * 100).toFixed(1)}%
                </TableCell>
                {regimes.map(regime => (
                  <TableCell key={`${strategy.name}-${regime}`}>
                    <div className="flex flex-col">
                      <span className={strategy.regimePerformance[regime].returns > 0 ? 'text-green-400' : 'text-red-400'}>
                        {(strategy.regimePerformance[regime].returns * 100).toFixed(2)}%
                      </span>
                      <span className="text-xs text-gray-400">
                        SR: {strategy.regimePerformance[regime].sharpe.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StrategyPerformanceTable;
