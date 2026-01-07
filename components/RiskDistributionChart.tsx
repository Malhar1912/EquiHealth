
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface Props {
  riskScore: number;
  uncertainty: number;
  interval: [number, number];
}

const RiskDistributionChart: React.FC<Props> = ({ riskScore, uncertainty, interval }) => {
  // Generate a mock Gaussian distribution centered around riskScore
  // Width of distribution is proportional to uncertainty
  const generateData = () => {
    const data = [];
    const stdDev = Math.max(0.05, uncertainty * 0.2);
    for (let x = 0; x <= 1; x += 0.02) {
      const exponent = -Math.pow(x - riskScore, 2) / (2 * Math.pow(stdDev, 2));
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      data.push({ x: parseFloat(x.toFixed(2)), density: y });
    }
    return data;
  };

  const data = generateData();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[0, 1]} 
            tick={{ fontSize: 12 }} 
            label={{ value: 'Risk Probability P(y|x)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis hide />
          <Tooltip 
            formatter={(value: any) => [parseFloat(value).toFixed(2), 'Density']}
            labelFormatter={(label) => `Risk: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="density" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorDensity)" 
          />
          <ReferenceLine x={riskScore} stroke="#1d4ed8" strokeWidth={2} label={{ value: 'Mean', position: 'top', fontSize: 10 }} />
          <ReferenceLine x={interval[0]} stroke="#ef4444" strokeDasharray="3 3" />
          <ReferenceLine x={interval[1]} stroke="#ef4444" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistributionChart;
