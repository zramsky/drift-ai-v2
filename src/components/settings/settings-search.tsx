'use client'

import { useState, useMemo } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SETTINGS_CATEGORIES, SETTINGS_ICONS } from '@/lib/settings-config'
import { SettingsCategory, SettingsSection, SettingSetting } from '@/types/settings'

interface SearchResult {
  category: SettingsCategory
  section: SettingsSection
  setting: SettingSetting
  matchType: 'name' | 'description' | 'category' | 'section'
  matchText: string
}

interface SettingsSearchProps {
  onResultSelect: (categoryId: string, sectionId: string, settingId: string) => void
  className?: string
}

export function SettingsSearch({ onResultSelect, className }: SettingsSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase().trim()

    SETTINGS_CATEGORIES.forEach(category => {
      category.sections.forEach(section => {
        section.settings.forEach(setting => {
          // Check setting name
          if (setting.label.toLowerCase().includes(searchTerm)) {
            results.push({
              category,
              section,
              setting,
              matchType: 'name',
              matchText: setting.label
            })
          }
          // Check setting description
          else if (setting.description.toLowerCase().includes(searchTerm)) {
            results.push({
              category,
              section,
              setting,
              matchType: 'description',
              matchText: setting.description
            })
          }
          // Check category name
          else if (category.name.toLowerCase().includes(searchTerm)) {
            results.push({
              category,
              section,
              setting,
              matchType: 'category',
              matchText: category.name
            })
          }
          // Check section name
          else if (section.title.toLowerCase().includes(searchTerm)) {
            results.push({
              category,
              section,
              setting,
              matchType: 'section',
              matchText: section.title
            })
          }
        })
      })
    })

    // Filter by active filter
    if (activeFilter !== 'all') {
      return results.filter(result => result.category.id === activeFilter)
    }

    return results.slice(0, 10) // Limit to 10 results
  }, [query, activeFilter])

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result.category.id, result.section.id, result.setting.id)
    setQuery('')
    setIsOpen(false)
  }

  const filters = [
    { id: 'all', name: 'All Settings', count: searchResults.length },
    ...SETTINGS_CATEGORIES.map(category => ({
      id: category.id,
      name: category.name,
      count: searchResults.filter(r => r.category.id === category.id).length
    })).filter(f => f.count > 0)
  ]

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search settings..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(e.target.value.length > 0)
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Filter by category</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {filters.map(filter => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "text-xs h-6 px-2",
                    activeFilter === filter.id && "bg-[#FF6B35] hover:bg-[#E55A2B]"
                  )}
                >
                  {filter.name}
                  <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 min-w-[16px] h-4">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((result, index) => {
                  const IconComponent = SETTINGS_ICONS[result.category.icon as keyof typeof SETTINGS_ICONS]
                  
                  return (
                    <button
                      key={`${result.category.id}-${result.section.id}-${result.setting.id}-${index}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 mb-1">
                            {highlightMatch(result.setting.label, query)}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2 mb-1">
                            {highlightMatch(result.setting.description, query)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>
                              {highlightMatch(result.category.name, query)}
                            </span>
                            <span>•</span>
                            <span>
                              {highlightMatch(result.section.title, query)}
                            </span>
                            {result.matchType && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {result.matchType === 'name' && 'Setting name'}
                                  {result.matchType === 'description' && 'Description'}
                                  {result.matchType === 'category' && 'Category'}
                                  {result.matchType === 'section' && 'Section'}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No settings found for "{query}"</p>
                <p className="text-xs mt-1">Try different keywords or check spelling</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </span>
                <span>
                  Press Enter to select first result
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}