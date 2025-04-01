
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitySquare, LineChart, PieChart, TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
      <div className="flex items-center">
        <TrendingUp className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-xl font-bold text-white">Bayesian Regime Switcher</h1>
      </div>
      
      <Tabs defaultValue="dashboard" className="w-fit">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center">
            <ActivitySquare className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="regimes" className="flex items-center">
            <LineChart className="h-4 w-4 mr-2" />
            Regimes
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Strategies
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center">
        <Button variant="outline" size="sm" className="mr-2">
          Reset
        </Button>
        <Button size="sm">Run Simulation</Button>
      </div>
    </header>
  );
};

export default Header;
