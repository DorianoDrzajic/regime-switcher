
// Generate synthetic market data for demonstration

export interface MarketData {
  date: string;
  price: number;
  returns: number;
  volatility: number;
}

export function generateSyntheticMarketData(days = 500, startDate = '2020-01-01'): MarketData[] {
  const data: MarketData[] = [];
  let price = 100;
  let volatility = 0.01;
  let date = new Date(startDate);
  
  // Define regime periods for demonstration
  const regimePeriods = [
    { start: 0, end: 100, type: 'bull', volatilityBase: 0.01, returnBase: 0.001 },
    { start: 100, end: 150, type: 'volatile', volatilityBase: 0.025, returnBase: 0.0 },
    { start: 150, end: 250, type: 'bear', volatilityBase: 0.018, returnBase: -0.001 },
    { start: 250, end: 300, type: 'neutral', volatilityBase: 0.008, returnBase: 0.0 },
    { start: 300, end: 400, type: 'bull', volatilityBase: 0.012, returnBase: 0.0012 },
    { start: 400, end: 450, type: 'volatile', volatilityBase: 0.03, returnBase: -0.0005 },
    { start: 450, end: 500, type: 'bear', volatilityBase: 0.02, returnBase: -0.0015 },
  ];
  
  // Track returns for rolling volatility calculation
  const rollingReturns: number[] = [];
  const volatilityWindow = 21; // Approximately a month of trading days
  
  for (let i = 0; i < days; i++) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      date = new Date(date.setDate(date.getDate() + 1));
      continue;
    }
    
    // Find current regime
    const regime = regimePeriods.find(period => i >= period.start && i < period.end);
    
    if (!regime) continue;
    
    // Generate daily return based on regime characteristics
    const randomComponent = (Math.random() - 0.5) * 2 * regime.volatilityBase;
    const dailyReturn = regime.returnBase + randomComponent;
    
    // Update price
    price = price * (1 + dailyReturn);
    
    // Store the return for rolling volatility calculation
    rollingReturns.push(dailyReturn);
    if (rollingReturns.length > volatilityWindow) {
      rollingReturns.shift();
    }
    
    // Calculate rolling volatility
    if (rollingReturns.length >= 5) {
      const mean = rollingReturns.reduce((sum, r) => sum + r, 0) / rollingReturns.length;
      volatility = Math.sqrt(
        rollingReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rollingReturns.length
      );
    } else {
      volatility = regime.volatilityBase;
    }
    
    // Add data point
    data.push({
      date: date.toISOString().split('T')[0],
      price,
      returns: dailyReturn,
      volatility
    });
    
    // Increment date
    date = new Date(date.setDate(date.getDate() + 1));
  }
  
  return data;
}

// Generate rolling returns for model input
export function calculateRollingReturns(data: MarketData[], window = 5): {
  date: string;
  returns: number[];
  volatility: number;
}[] {
  const result = [];
  
  for (let i = window; i < data.length; i++) {
    const windowData = data.slice(i - window, i);
    const returns = windowData.map(d => d.returns);
    result.push({
      date: data[i].date,
      returns,
      volatility: data[i].volatility,
    });
  }
  
  return result;
}
