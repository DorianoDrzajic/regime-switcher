
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import RegimeChart from '@/components/RegimeChart';
import ProbabilityChart from '@/components/ProbabilityChart';
import StrategyAllocationChart from '@/components/StrategyAllocationChart';
import StrategyPerformanceTable from '@/components/StrategyPerformanceTable';
import PortfolioPerformanceChart from '@/components/PortfolioPerformanceChart';
import PerformanceMetricsCard from '@/components/PerformanceMetricsCard';
import { SimplifiedHMM, MarketRegime } from '@/lib/models/hmm';
import { StrategyManager } from '@/lib/models/strategy';
import { generateSyntheticMarketData, calculateRollingReturns } from '@/lib/data/market-data';
import { calculateCumulativeReturns } from '@/lib/utils';

const Index = () => {
  // Generate sample market data
  const [marketData, setMarketData] = useState(() => generateSyntheticMarketData());
  const [hmmModel] = useState(() => new SimplifiedHMM());
  const [strategyManager] = useState(() => new StrategyManager());
  
  // State for processed data
  const [regimeStates, setRegimeStates] = useState<any[]>([]);
  const [regimeProbabilities, setRegimeProbabilities] = useState<any[]>([]);
  const [currentAllocation, setCurrentAllocation] = useState<any[]>([]);
  const [strategyPerformance, setStrategyPerformance] = useState<any[]>([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    volatility: 0,
  });

  // Process data on component mount
  useEffect(() => {
    // Calculate rolling returns for model input
    const rollingData = calculateRollingReturns(marketData);
    
    // Detect regimes using HMM
    const hmmStates = hmmModel.detectRegimes(rollingData);
    setRegimeStates(hmmStates);
    
    // Extract regime probabilities for visualization
    const probData = hmmStates.map((state, i) => ({
      date: marketData[i + 5].date, // +5 because we used a window of 5 for rolling returns
      ...state.regimeProbabilities,
    }));
    setRegimeProbabilities(probData);
    
    // Extract regimes for strategy simulation
    const regimeSequence = hmmStates.map(state => state.currentRegime);
    
    // Calculate strategy performance in different regimes
    const marketDataForStrategies = marketData.slice(5).map(d => ({
      date: d.date,
      returns: d.returns,
      volatility: d.volatility,
    }));
    
    const strategyPerf = strategyManager.simulatePerformance(
      marketDataForStrategies,
      regimeSequence
    );
    setStrategyPerformance(strategyPerf);
    
    // Calculate strategy allocations based on regime probabilities
    const allocations = hmmStates.map((state, i) => ({
      date: marketData[i + 5].date,
      allocations: strategyManager.calculateAllocation(state.regimeProbabilities)
        .reduce((obj, item) => ({ ...obj, [item.name]: item.weight }), {})
    }));
    
    // Get the latest allocation for the pie chart
    const latestAllocation = strategyManager.calculateAllocation(
      hmmStates[hmmStates.length - 1].regimeProbabilities
    );
    setCurrentAllocation(latestAllocation);
    
    // Calculate portfolio performance
    const strategyReturns = strategyPerf.reduce((obj, strategy) => {
      return { ...obj, [strategy.name]: strategy.returns };
    }, {});
    
    // Benchmark returns (just use the market data)
    const benchmarkReturns = marketData.slice(5).map(d => d.returns);
    const benchmarkCumulative = calculateCumulativeReturns(benchmarkReturns);
    
    // Adaptive portfolio returns
    const portfolioReturns = [];
    
    // For each time period, calculate the weighted return based on strategy allocations
    for (let t = 0; t < benchmarkReturns.length; t++) {
      const currentAlloc = allocations[t].allocations;
      let periodReturn = 0;
      
      // Sum up the weighted strategy returns
      Object.entries(currentAlloc).forEach(([strategy, weight]) => {
        if (strategyReturns[strategy] && strategyReturns[strategy][t] !== undefined) {
          periodReturn += strategyReturns[strategy][t] * weight;
        }
      });
      
      portfolioReturns.push(periodReturn);
    }
    
    const portfolioCumulative = calculateCumulativeReturns(portfolioReturns);
    
    // Create the combined performance data
    const performanceData = benchmarkCumulative.map((benchValue, i) => ({
      date: marketData[i + 5].date,
      benchmark: benchValue,
      adaptivePortfolio: portfolioCumulative[i],
      regimeLabel: regimeSequence[i],
    }));
    
    setPortfolioPerformance(performanceData);
    
    // Calculate overall performance metrics
    const lastPortfolioValue = portfolioCumulative[portfolioCumulative.length - 1];
    
    // Calculate Sharpe ratio (simplified)
    const meanReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const variance = portfolioReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / portfolioReturns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = meanReturn / stdDev * Math.sqrt(252); // Annualized
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = 1;
    const equity = [1];
    
    portfolioReturns.forEach(r => {
      equity.push(equity[equity.length - 1] * (1 + r));
    });
    
    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
      } else {
        const drawdown = (peak - equity[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    // Annualized volatility
    const annualizedVolatility = stdDev * Math.sqrt(252);
    
    setPerformanceMetrics({
      totalReturn: lastPortfolioValue,
      sharpeRatio,
      maxDrawdown,
      volatility: annualizedVolatility,
    });
    
  }, [marketData, hmmModel, strategyManager]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <RegimeChart 
            priceData={marketData.map(d => ({ date: d.date, price: d.price }))} 
            regimeData={regimeStates.map((state, i) => ({
              date: marketData[i + 5].date,
              regime: state.currentRegime,
              probability: state.regimeProbabilities[state.currentRegime],
            }))}
          />
          <ProbabilityChart data={regimeProbabilities} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StrategyAllocationChart allocation={currentAllocation} />
          <div className="md:col-span-2">
            <PerformanceMetricsCard {...performanceMetrics} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <PortfolioPerformanceChart data={portfolioPerformance} />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <StrategyPerformanceTable strategies={strategyPerformance} />
        </div>
      </main>
    </div>
  );
};

export default Index;
