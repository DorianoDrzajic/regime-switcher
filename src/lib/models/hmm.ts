
// Simple HMM implementation for frontend demonstration
// In a real-world scenario, this would be implemented in Python using PyMC3 or similar

export type MarketRegime = "Bull" | "Bear" | "Neutral" | "Volatile";

export interface HMMState {
  regimeProbabilities: Record<MarketRegime, number>;
  currentRegime: MarketRegime;
  history: Array<{ date: string; regime: MarketRegime; probability: number }>;
}

/**
 * A simplified HMM model for frontend demonstration purposes
 * This simulates the output of a proper Bayesian HMM that would be trained with PyMC3 or similar
 */
export class SimplifiedHMM {
  private transitionMatrix: Record<MarketRegime, Record<MarketRegime, number>> = {
    Bull: { Bull: 0.8, Bear: 0.05, Neutral: 0.1, Volatile: 0.05 },
    Bear: { Bull: 0.05, Bear: 0.8, Neutral: 0.05, Volatile: 0.1 },
    Neutral: { Bull: 0.2, Bear: 0.2, Neutral: 0.5, Volatile: 0.1 },
    Volatile: { Bull: 0.1, Bear: 0.2, Neutral: 0.1, Volatile: 0.6 },
  };

  private initialState: Record<MarketRegime, number> = {
    Bull: 0.25,
    Bear: 0.25,
    Neutral: 0.25,
    Volatile: 0.25,
  };

  private regimeColor: Record<MarketRegime, string> = {
    Bull: "#22c55e",
    Bear: "#ef4444",
    Neutral: "#f59e0b",
    Volatile: "#8b5cf6",
  };

  getRegimeColor(regime: MarketRegime): string {
    return this.regimeColor[regime];
  }

  // This simulates the Bayesian inference step
  private inferRegimeProbabilities(returns: number[], volatility: number): Record<MarketRegime, number> {
    // In a real model, this would use Bayesian inference with proper emission probabilities
    // Here we use a simplified heuristic approach for demonstration
    
    // Average recent returns
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    // Simple rules-based approach for demonstration
    let probs: Record<MarketRegime, number> = { Bull: 0, Bear: 0, Neutral: 0, Volatile: 0 };
    
    // High volatility indicates Volatile regime
    if (volatility > 0.025) {
      probs.Volatile += 0.6;
      probs.Bear += 0.2;
      probs.Bull += 0.1;
      probs.Neutral += 0.1;
    } 
    // Strong positive returns indicate Bull regime
    else if (avgReturn > 0.01) {
      probs.Bull += 0.7;
      probs.Neutral += 0.2;
      probs.Volatile += 0.05;
      probs.Bear += 0.05;
    } 
    // Strong negative returns indicate Bear regime
    else if (avgReturn < -0.01) {
      probs.Bear += 0.7;
      probs.Volatile += 0.15;
      probs.Neutral += 0.1;
      probs.Bull += 0.05;
    } 
    // Low volatility and low returns indicate Neutral regime
    else {
      probs.Neutral += 0.6;
      probs.Bull += 0.2;
      probs.Bear += 0.1;
      probs.Volatile += 0.1;
    }
    
    return probs;
  }

  // Determine the most likely regime from probabilities
  private getMostLikelyRegime(probabilities: Record<MarketRegime, number>): MarketRegime {
    return Object.entries(probabilities).reduce(
      (max, [regime, prob]) => (prob > max.prob ? { regime: regime as MarketRegime, prob } : max),
      { regime: "Neutral" as MarketRegime, prob: 0 }
    ).regime;
  }

  // Process market data to detect regimes
  detectRegimes(marketData: {
    date: string;
    returns: number[];
    volatility: number;
  }[]): HMMState[] {
    let currentProbs = { ...this.initialState };
    let stateHistory: HMMState[] = [];

    marketData.forEach(({ date, returns, volatility }) => {
      // Get observation probabilities from market data
      const observationProbs = this.inferRegimeProbabilities(returns, volatility);
      
      // Update probabilities using simplified Bayesian update
      // In a real implementation, this would use proper Bayesian inference
      let newProbs: Record<MarketRegime, number> = { Bull: 0, Bear: 0, Neutral: 0, Volatile: 0 };
      
      Object.entries(currentProbs).forEach(([fromRegime, fromProb]) => {
        Object.entries(this.transitionMatrix[fromRegime as MarketRegime]).forEach(([toRegime, transProb]) => {
          newProbs[toRegime as MarketRegime] += fromProb * transProb * observationProbs[toRegime as MarketRegime];
        });
      });
      
      // Normalize probabilities
      const total = Object.values(newProbs).reduce((sum, p) => sum + p, 0);
      Object.keys(newProbs).forEach(regime => {
        newProbs[regime as MarketRegime] /= total;
      });
      
      currentProbs = newProbs;
      const currentRegime = this.getMostLikelyRegime(currentProbs);
      
      stateHistory.push({
        regimeProbabilities: { ...currentProbs },
        currentRegime,
        history: [{ date, regime: currentRegime, probability: currentProbs[currentRegime] }]
      });
    });

    return stateHistory;
  }
}
