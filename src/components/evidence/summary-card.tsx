'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Receipt, MapPin } from 'lucide-react'
import type { EvidenceAnchor } from '@/lib/api'

interface SummaryCardProps {
  narrative: string
  evidenceAnchors: EvidenceAnchor[]
  onAnchorClick: (anchor: EvidenceAnchor) => void
  className?: string
}

interface HighlightedText {
  text: string
  isHighlight: boolean
  anchor?: EvidenceAnchor
}

export function SummaryCard({
  narrative,
  evidenceAnchors,
  onAnchorClick,
  className = ''
}: SummaryCardProps) {
  const [hoveredAnchor, setHoveredAnchor] = useState<EvidenceAnchor | null>(null)

  // Parse narrative text and create clickable highlights
  const highlightedNarrative = useMemo(() => {
    if (!evidenceAnchors.length) {
      return [{ text: narrative, isHighlight: false }] as HighlightedText[]
    }

    let result: HighlightedText[] = []
    let remainingText = narrative
    let lastIndex = 0

    // Sort anchors by their position in the narrative (if they appear in the text)
    const sortedAnchors = evidenceAnchors
      .filter(anchor => narrative.includes(anchor.quoted_text))
      .sort((a, b) => narrative.indexOf(a.quoted_text) - narrative.indexOf(b.quoted_text))

    sortedAnchors.forEach((anchor) => {
      const anchorIndex = narrative.indexOf(anchor.quoted_text, lastIndex)
      
      if (anchorIndex !== -1) {
        // Add text before the anchor
        if (anchorIndex > lastIndex) {
          result.push({
            text: narrative.slice(lastIndex, anchorIndex),
            isHighlight: false
          })
        }

        // Add the highlighted anchor text
        result.push({
          text: anchor.quoted_text,
          isHighlight: true,
          anchor: anchor
        })

        lastIndex = anchorIndex + anchor.quoted_text.length
      }
    })

    // Add remaining text
    if (lastIndex < narrative.length) {
      result.push({
        text: narrative.slice(lastIndex),
        isHighlight: false
      })
    }

    return result
  }, [narrative, evidenceAnchors])

  const getDocumentIcon = (docType: 'contract' | 'invoice') => {
    return docType === 'contract' 
      ? <FileText className="h-3 w-3 text-blue-600" />
      : <Receipt className="h-3 w-3 text-green-600" />
  }

  const getHighlightClassName = (anchor: EvidenceAnchor) => {
    const baseClasses = "relative cursor-pointer rounded px-1 py-0.5 transition-all duration-200 border-b-2 hover:bg-opacity-20"
    const docClasses = anchor.doc === 'contract' 
      ? "text-blue-800 bg-blue-100 border-blue-400 hover:bg-blue-200"
      : "text-green-800 bg-green-100 border-green-400 hover:bg-green-200"
    
    return `${baseClasses} ${docClasses}`
  }

  const handleHighlightClick = (anchor: EvidenceAnchor) => {
    onAnchorClick(anchor)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
        <CardDescription>
          AI narrative with inline clickable highlights to evidence
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Highlighted Narrative Text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed">
            {highlightedNarrative.map((segment, index) => (
              segment.isHighlight && segment.anchor ? (
                <span
                  key={index}
                  className={getHighlightClassName(segment.anchor)}
                  onClick={() => segment.anchor && handleHighlightClick(segment.anchor)}
                  onMouseEnter={() => segment.anchor && setHoveredAnchor(segment.anchor)}
                  onMouseLeave={() => setHoveredAnchor(null)}
                  title={`Click to view evidence in ${segment.anchor.doc} (Page ${segment.anchor.page})`}
                >
                  {segment.text}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {segment.anchor.doc} • Page {segment.anchor.page}
                  </span>
                </span>
              ) : (
                <span key={index}>{segment.text}</span>
              )
            ))}
          </p>
        </div>

        {/* Evidence Summary */}
        {evidenceAnchors.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Referenced Evidence ({evidenceAnchors.length})
            </h4>
            
            <div className="grid gap-2">
              {evidenceAnchors.map((anchor, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all hover:bg-surface-secondary/50 ${
                    hoveredAnchor === anchor ? 'ring-2 ring-brand-steel bg-brand-steel/5' : ''
                  }`}
                  onClick={() => handleHighlightClick(anchor)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getDocumentIcon(anchor.doc)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {anchor.doc}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Page {anchor.page}
                        </Badge>
                        {anchor.bbox && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Precise
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        "{anchor.quoted_text}"
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleHighlightClick(anchor)
                    }}
                  >
                    <span className="sr-only">View evidence</span>
                    →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}