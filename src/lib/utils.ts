
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MarketRegime } from "./models/hmm"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Color mapping for market regimes
export const marketRegimeColors: Record<MarketRegime, string> = {
  Bull: "#22c55e",    // Green
  Bear: "#ef4444",    // Red
  Neutral: "#f59e0b", // Amber
  Volatile: "#8b5cf6" // Purple
}

// Create cumulative returns from an array of individual returns
export function calculateCumulativeReturns(returns: number[]): number[] {
  let cumulative = 1;
  return returns.map(ret => {
    cumulative *= (1 + ret);
    return cumulative - 1;
  });
}

// Calculate portfolio returns based on strategy allocations and individual strategy returns
export function calculatePortfolioReturns(
  strategyReturns: Record<string, number[]>,
  allocations: Array<{ date: string; allocations: Record<string, number> }>
): number[] {
  const portfolioReturns: number[] = [];
  
  // Get strategy names
  const strategyNames = Object.keys(strategyReturns);
  
  // For each time period
  for (let t = 0; t < allocations.length; t++) {
    // Skip if we don't have returns data for this period
    if (strategyNames.some(strategy => !strategyReturns[strategy][t])) {
      continue;
    }
    
    // Get allocations for this period
    const currentAllocations = allocations[t].allocations;
    
    // Calculate weighted return
    let periodReturn = 0;
    for (const strategy of strategyNames) {
      periodReturn += (strategyReturns[strategy][t] || 0) * (currentAllocations[strategy] || 0);
    }
    
    portfolioReturns.push(periodReturn);
  }
  
  return portfolioReturns;
}

// Format a number as a percentage
export function formatPercent(value: number, decimals = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}

// Format a date
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
