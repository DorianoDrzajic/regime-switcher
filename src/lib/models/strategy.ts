
import { MarketRegime } from './hmm';

export interface StrategyPerformance {
  name: string;
  returns: number[];
  sharpe: number;
  drawdown: number;
  volatility: number;
  regimePerformance: Record<MarketRegime, {
    returns: number;
    sharpe: number;
  }>;
}

export interface StrategyAllocation {
  name: string;
  weight: number;
  color: string;
}

// Different strategies perform differently in different market regimes
const REGIME_PERFORMANCE_FACTORS: Record<string, Record<MarketRegime, number>> = {
  momentum: {
    Bull: 1.5,  // Momentum works well in bull markets
    Bear: 0.6,  // Momentum struggles in bear markets
    Neutral: 0.9, // Momentum is moderate in neutral markets
    Volatile: 0.7, // Momentum struggles in volatile markets
  },
  meanReversion: {
    Bull: 0.7,  // Mean reversion underperforms in bull markets
    Bear: 1.2,  // Mean reversion works well in bear markets
    Neutral: 1.4, // Mean reversion works well in neutral markets
    Volatile: 0.8, // Mean reversion moderate in volatile markets
  },
  volatility: {
    Bull: 0.5,  // Volatility strategies underperform in bull markets
    Bear: 1.0,  // Volatility strategies are decent in bear markets
    Neutral: 0.7, // Volatility strategies underperform in neutral markets
    Volatile: 1.8, // Volatility strategies excel in volatile markets
  },
  valueInvesting: {
    Bull: 0.9,  // Value investing is moderate in bull markets
    Bear: 1.1,  // Value investing is relatively resilient in bear markets
    Neutral: 1.2, // Value investing works well in neutral markets
    Volatile: 1.0, // Value investing is moderate in volatile markets
  },
};

const STRATEGY_COLORS = {
  momentum: "#3b82f6",      // Blue
  meanReversion: "#f43f5e",  // Pink
  volatility: "#8b5cf6",     // Purple
  valueInvesting: "#10b981", // Emerald
};

export class StrategyManager {
  // Calculate optimal strategy allocation based on regime probabilities
  calculateAllocation(regimeProbabilities: Record<MarketRegime, number>): StrategyAllocation[] {
    // In a real application, this would use Bayesian portfolio optimization
    // Here we use a simplified approach for demonstration
    
    let rawWeights: Record<string, number> = {
      momentum: 0,
      meanReversion: 0,
      volatility: 0,
      valueInvesting: 0,
    };
    
    // Calculate weights based on regime probabilities and strategy performance in each regime
    Object.entries(regimeProbabilities).forEach(([regime, probability]) => {
      Object.keys(rawWeights).forEach(strategy => {
        rawWeights[strategy] += probability * REGIME_PERFORMANCE_FACTORS[strategy][regime as MarketRegime];
      });
    });
    
    // Normalize weights
    const totalWeight = Object.values(rawWeights).reduce((sum, w) => sum + w, 0);
    
    Object.keys(rawWeights).forEach(strategy => {
      rawWeights[strategy] = rawWeights[strategy] / totalWeight;
    });
    
    return Object.entries(rawWeights).map(([name, weight]) => ({
      name,
      weight,
      color: STRATEGY_COLORS[name as keyof typeof STRATEGY_COLORS],
    }));
  }

  // Simulate strategy performance based on market data and regimes
  simulatePerformance(
    marketData: Array<{ date: string; returns: number; volatility: number }>,
    regimes: MarketRegime[]
  ): StrategyPerformance[] {
    // Return simulated performance for each strategy
    const strategies = ['momentum', 'meanReversion', 'volatility', 'valueInvesting'];
    
    return strategies.map(strategy => {
      // Simulate returns based on market data and regime-specific performance
      const returns = marketData.map((data, i) => {
        const regime = regimes[i];
        const baseReturn = data.returns;
        const factor = REGIME_PERFORMANCE_FACTORS[strategy][regime];
        
        // Add some noise to make it realistic
        const noise = (Math.random() - 0.5) * 0.005;
        return baseReturn * factor + noise;
      });
      
      // Calculate performance metrics
      const sharpe = this.calculateSharpe(returns);
      const drawdown = this.calculateMaxDrawdown(returns);
      const volatility = this.calculateVolatility(returns);
      
      // Calculate performance by regime
      const regimePerformance: Record<MarketRegime, { returns: number; sharpe: number }> = {
        Bull: { returns: 0, sharpe: 0 },
        Bear: { returns: 0, sharpe: 0 },
        Neutral: { returns: 0, sharpe: 0 },
        Volatile: { returns: 0, sharpe: 0 },
      };
      
      const regimeReturns: Record<MarketRegime, number[]> = {
        Bull: [],
        Bear: [],
        Neutral: [],
        Volatile: [],
      };
      
      returns.forEach((ret, i) => {
        const regime = regimes[i];
        regimeReturns[regime].push(ret);
      });
      
      Object.entries(regimeReturns).forEach(([regime, rets]) => {
        if (rets.length > 0) {
          regimePerformance[regime as MarketRegime].returns = 
            rets.reduce((sum, r) => sum + r, 0) / rets.length;
          regimePerformance[regime as MarketRegime].sharpe = 
            this.calculateSharpe(rets);
        }
      });
      
      return {
        name: strategy,
        returns,
        sharpe,
        drawdown,
        volatility,
        regimePerformance,
      };
    });
  }

  private calculateSharpe(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    // Assuming risk-free rate is 0 for simplicity
    return stdDev === 0 ? 0 : mean / stdDev * Math.sqrt(252); // Annualized
  }

  private calculateMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    // Convert returns to equity curve
    const equity = [1];
    returns.forEach(r => {
      equity.push(equity[equity.length - 1] * (1 + r));
    });
    
    let maxDrawdown = 0;
    let peak = equity[0];
    
    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
      } else {
        const drawdown = (peak - equity[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized
  }
}
