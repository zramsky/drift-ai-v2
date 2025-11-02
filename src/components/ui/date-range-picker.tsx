'use client'

import * as React from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface DateRange {
  from?: Date
  to?: Date
  preset?: string
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  className?: string
}

const presets = [
  {
    label: 'Today',
    value: 'today',
    range: () => ({
      from: new Date(),
      to: new Date(),
      preset: 'today'
    })
  },
  {
    label: 'Yesterday',
    value: 'yesterday', 
    range: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        from: yesterday,
        to: yesterday,
        preset: 'yesterday'
      }
    }
  },
  {
    label: 'Last 7 days',
    value: '7d',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return {
        from: start,
        to: end,
        preset: '7d'
      }
    }
  },
  {
    label: 'Last 30 days',
    value: '30d',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return {
        from: start,
        to: end,
        preset: '30d'
      }
    }
  },
  {
    label: 'Current Month (MTD)',
    value: 'mtd',
    range: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        from: start,
        to: now,
        preset: 'mtd'
      }
    }
  },
  {
    label: 'Last Month',
    value: 'last-month',
    range: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return {
        from: start,
        to: end,
        preset: 'last-month'
      }
    }
  },
  {
    label: 'Last 3 months',
    value: '3m',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return {
        from: start,
        to: end,
        preset: '3m'
      }
    }
  },
  {
    label: 'Last 12 months',
    value: '12m',
    range: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 12)
      return {
        from: start,
        to: end,
        preset: '12m'
      }
    }
  }
]

export function DateRangePicker({
  value,
  onChange,
  className
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedRange, setSelectedRange] = React.useState<DateRange>(
    value || presets.find(p => p.value === 'mtd')?.range() || {}
  )

  const formatDateRange = (range: DateRange) => {
    if (!range.from) return 'Select date range'
    
    if (range.preset) {
      const preset = presets.find(p => p.value === range.preset)
      if (preset) return preset.label
    }

    if (range.from && range.to) {
      const sameDay = range.from.toDateString() === range.to.toDateString()
      if (sameDay) {
        return range.from.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
      
      return `${range.from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${range.to.toLocaleDateString('en-US', {
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })}`
    }
    
    return range.from.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    })
  }

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.range()
    setSelectedRange(newRange)
    onChange?.(newRange)
    setIsOpen(false)
  }

  React.useEffect(() => {
    if (value && value !== selectedRange) {
      setSelectedRange(value)
    }
  }, [value, selectedRange])

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "justify-between min-w-[200px] font-normal",
          !selectedRange.from && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {formatDateRange(selectedRange)}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full mt-2 z-50 p-2 shadow-lg min-w-[240px]">
            <div className="grid gap-1">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="ghost"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "justify-start font-normal",
                    selectedRange.preset === preset.value && "bg-accent"
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}