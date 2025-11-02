'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface VarianceDataPoint {
  month: string
  variance: number
  baseline: number
  savings: number
}

interface VarianceTrendlineChartProps {
  vendorName: string
  data: VarianceDataPoint[]
  totalVariance: number
  trendDirection: 'up' | 'down' | 'stable'
  trendPercentage: number
  className?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: $${entry.value?.toLocaleString() || 0}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const getTrendIcon = (direction: VarianceTrendlineChartProps['trendDirection']) => {
  switch (direction) {
    case 'up':
      return <TrendingUp className="h-4 w-4" />
    case 'down':
      return <TrendingDown className="h-4 w-4" />
    default:
      return <BarChart3 className="h-4 w-4" />
  }
}

const getTrendColor = (direction: VarianceTrendlineChartProps['trendDirection']) => {
  switch (direction) {
    case 'up':
      return 'text-error'
    case 'down':
      return 'text-success'
    default:
      return 'text-muted-foreground'
  }
}

export function VarianceTrendlineChart({
  vendorName,
  data,
  totalVariance,
  trendDirection,
  trendPercentage,
  className
}: VarianceTrendlineChartProps) {
  const maxVariance = Math.max(...data.map(d => d.variance))
  const avgVariance = data.reduce((sum, d) => sum + d.variance, 0) / data.length
  
  return (
    <Card className={`p-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Variance Trendline - {vendorName}
          </h3>
          <p className="text-sm text-muted-foreground">
            12-month variance analysis with baseline comparison
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trendDirection)}`}>
              {getTrendIcon(trendDirection)}
              {trendDirection === 'stable' ? 'Stable' : `${trendPercentage.toFixed(1)}%`}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: ${totalVariance.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-surface-secondary/50 rounded-lg">
          <div className="text-lg font-semibold text-foreground">
            ${maxVariance.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Peak Month</div>
        </div>
        
        <div className="text-center p-3 bg-surface-secondary/50 rounded-lg">
          <div className="text-lg font-semibold text-foreground">
            ${avgVariance.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Monthly Avg</div>
        </div>
        
        <div className="text-center p-3 bg-surface-secondary/50 rounded-lg">
          <div className="text-lg font-semibold text-success">
            ${data.reduce((sum, d) => sum + d.savings, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Saved</div>
        </div>
      </div>
      
      {/* Trendline Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="varianceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EAB308" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.3} />
            
            <XAxis
              dataKey="month"
              stroke="#C9C9C9"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis
              stroke="#C9C9C9"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              wrapperStyle={{ color: '#C9C9C9', fontSize: '12px' }}
            />
            
            {/* Baseline line */}
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#64748B"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              name="Baseline"
            />
            
            {/* Variance area */}
            <Area
              type="monotone"
              dataKey="variance"
              stroke="#EAB308"
              strokeWidth={3}
              fill="url(#varianceGradient)"
              name="Variance Amount"
            />
            
            {/* Savings area */}
            <Area
              type="monotone"
              dataKey="savings"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#savingsGradient)"
              name="Savings Achieved"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Trend Analysis */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Badge 
              variant="secondary" 
              className={`${
                trendDirection === 'up' ? 'bg-error/10 text-error' :
                trendDirection === 'down' ? 'bg-success/10 text-success' :
                'bg-muted/10 text-muted-foreground'
              }`}
            >
              {trendDirection === 'up' ? 'Increasing Variance' :
               trendDirection === 'down' ? 'Decreasing Variance' :
               'Stable Pattern'}
            </Badge>
            
            <span className="text-muted-foreground">
              Last 3 months vs. previous 3 months
            </span>
          </div>
          
          <div className="text-muted-foreground">
            Updated {new Date().toLocaleDateString()} • Real-time data
          </div>
        </div>
      </div>
    </Card>
  )
}