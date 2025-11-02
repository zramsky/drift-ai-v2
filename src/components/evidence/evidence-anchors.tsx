'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw,
  FileText,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Eye,
  MapPin
} from 'lucide-react'
import type { EvidenceAnchor, Finding } from '@/lib/api'

interface EvidenceAnchorsProps {
  findings: Finding[]
  onAnchorClick: (anchor: EvidenceAnchor) => void
  onRefreshAnchors?: () => Promise<void>
  activeAnchor?: EvidenceAnchor
  isRefreshing?: boolean
  className?: string
}

export function EvidenceAnchors({
  findings,
  onAnchorClick,
  onRefreshAnchors,
  activeAnchor,
  isRefreshing = false,
  className = ''
}: EvidenceAnchorsProps) {
  const [groupedFindings, setGroupedFindings] = useState<{
    high: Finding[]
    medium: Finding[]
    low: Finding[]
  }>({ high: [], medium: [], low: [] })

  useEffect(() => {
    // Group findings by priority as per PRD requirements
    const grouped = findings.reduce((acc, finding) => {
      acc[finding.type].push(finding)
      return acc
    }, { high: [] as Finding[], medium: [] as Finding[], low: [] as Finding[] })

    setGroupedFindings(grouped)
  }, [findings])

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-error border-error bg-error/5'
      case 'medium': return 'text-warning border-warning bg-warning/5'
      case 'low': return 'text-info border-info bg-info/5'
    }
  }

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-error" />
      case 'medium': return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'low': return <CheckCircle className="h-4 w-4 text-info" />
    }
  }

  const getDocumentIcon = (docType: 'contract' | 'invoice') => {
    return docType === 'contract' 
      ? <FileText className="h-4 w-4 text-blue-600" />
      : <Receipt className="h-4 w-4 text-green-600" />
  }

  const handleAnchorClick = (anchor: EvidenceAnchor) => {
    onAnchorClick(anchor)
  }

  const renderFindingGroup = (priority: 'high' | 'medium' | 'low', findings: Finding[]) => {
    if (findings.length === 0) return null

    return (
      <div key={priority} className="space-y-3">
        <div className="flex items-center gap-2">
          {getPriorityIcon(priority)}
          <h4 className={`font-semibold capitalize ${getPriorityColor(priority).split(' ')[0]}`}>
            {priority} Priority ({findings.length})
          </h4>
        </div>
        
        <div className="space-y-2">
          {findings.map((finding) => (
            <div
              key={finding.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                activeAnchor?.quoted_text === finding.evidence_anchor.quoted_text
                  ? 'ring-2 ring-brand-steel bg-brand-steel/5'
                  : getPriorityColor(finding.type)
              }`}
              onClick={() => handleAnchorClick(finding.evidence_anchor)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getDocumentIcon(finding.evidence_anchor.doc)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {finding.evidence_anchor.doc}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Page {finding.evidence_anchor.page}
                    </Badge>
                    {finding.evidence_anchor.bbox && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Precise Location
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-foreground mb-2">
                    {finding.description}
                  </p>
                  
                  <div className="bg-white/50 rounded px-2 py-1 mb-2">
                    <p className="text-xs font-mono text-muted-foreground line-clamp-2">
                      "{finding.evidence_anchor.quoted_text}"
                    </p>
                  </div>
                  
                  {finding.amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Impact:</span>
                      <span className={`text-sm font-semibold ${
                        finding.type === 'high' ? 'text-error' : 
                        finding.type === 'medium' ? 'text-warning' : 'text-info'
                      }`}>
                        ${finding.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAnchorClick(finding.evidence_anchor)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Variance Review</CardTitle>
            <CardDescription>
              Findings grouped by priority with clickable evidence links
            </CardDescription>
          </div>
          
          {onRefreshAnchors && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshAnchors}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Evidence
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {findings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
            <p>All invoice items appear to comply with contract terms.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render findings grouped High → Medium → Low as per PRD */}
            {renderFindingGroup('high', groupedFindings.high)}
            {renderFindingGroup('medium', groupedFindings.medium)}
            {renderFindingGroup('low', groupedFindings.low)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}