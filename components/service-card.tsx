"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GripVertical, Star, Edit2, Trash2, ExternalLink, X, Plus, Download, Loader2, AlertCircle } from "lucide-react"
import type { Service } from "@/components/pinboard-app"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ServiceCardProps {
  service: Service
  availableFlags: string[]
  allCategories: string[]
  allCategoriesData: Array<{ id: string; name: string; tags: string[] }>
  allServices: Service[]
  currentCategory: string
  categoryHue?: number
  textColor: string
  hideDescriptions: boolean
  showTags: boolean
  showRatings: boolean
  hideUrls: boolean
  onUpdate: (id: string, updates: Partial<Service>) => void
  onDelete: (id: string) => void
  onAddFlag: (flag: string) => void
  onAddCategory: (name: string) => void
  isDraggable: boolean
}

function getServiceBackgroundColor(categoryHue: number | undefined, intensity: string | undefined): string {
  if (!categoryHue) {
    return "#1a1a1a"
  }

  switch (intensity) {
    case "bright":
      return `hsl(${categoryHue} 50% 35%)`
    case "light":
      return `hsl(${categoryHue} 40% 25%)`
    case "lighter":
      return `hsl(${categoryHue} 35% 20%)`
    case "default":
    default:
      return `hsl(${categoryHue} 30% 15%)`
  }
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "")
}

export function ServiceCard({
  service,
  availableFlags,
  allCategories,
  allCategoriesData,
  allServices,
  currentCategory,
  categoryHue,
  textColor,
  hideDescriptions,
  showTags,
  showRatings,
  hideUrls,
  onUpdate,
  onDelete,
  onAddFlag,
  onAddCategory,
  isDraggable,
}: ServiceCardProps) {
  const serviceWithRatings = {
    ...service,
    ratings: service.ratings || {},
    categoryTags: service.categoryTags || {},
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editedService, setEditedService] = useState(serviceWithRatings)
  const [newFlag, setNewFlag] = useState("")
  const [newTag, setNewTag] = useState("")
  const [categoryTagInputs, setCategoryTagInputs] = useState<{ [category: string]: string }>({})
  const [newCategory, setNewCategory] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [showHttpsPrompt, setShowHttpsPrompt] = useState(false)
  const justClosedRef = useRef(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.id,
    disabled: !isDraggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const backgroundColor = getServiceBackgroundColor(categoryHue, service.colorIntensity)

  const usedFlags = Array.from(
    new Set([
      ...availableFlags.filter((flag) => allServices.some((s) => s.flags.includes(flag))),
      ...editedService.flags,
    ]),
  )

  const currentRating = serviceWithRatings.ratings[currentCategory] || 0

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setEditedService(serviceWithRatings)
    } else {
      justClosedRef.current = true
      setTimeout(() => {
        justClosedRef.current = false
      }, 100)
    }
    setIsEditing(open)
  }

  const handleSave = () => {
    onUpdate(service.id, editedService)
    setIsEditing(false)
  }

  const handleAddFlag = () => {
    if (newFlag && !editedService.flags.includes(newFlag)) {
      setEditedService({ ...editedService, flags: [...editedService.flags, newFlag] })
      onAddFlag(newFlag)
      setNewFlag("")
    }
  }

  const handleAddTag = () => {
    if (newTag && !editedService.tags.includes(newTag)) {
      setEditedService({ ...editedService, tags: [...editedService.tags, newTag] })
      setNewTag("")
    }
  }

  const handleAddCategoryTag = (category: string) => {
    const tagValue = categoryTagInputs[category] || ""
    if (tagValue && !(editedService.categoryTags?.[category] || []).includes(tagValue)) {
      const updatedCategoryTags = {
        ...editedService.categoryTags,
        [category]: [...(editedService.categoryTags?.[category] || []), tagValue],
      }
      setEditedService({ ...editedService, categoryTags: updatedCategoryTags })
      setCategoryTagInputs({ ...categoryTagInputs, [category]: "" })
    }
  }

  const handleRemoveCategoryTag = (category: string, tag: string) => {
    const updatedCategoryTags = { ...editedService.categoryTags }
    if (updatedCategoryTags[category]) {
      updatedCategoryTags[category] = updatedCategoryTags[category].filter((t) => t !== tag)
      if (updatedCategoryTags[category].length === 0) {
        delete updatedCategoryTags[category]
      }
    }
    setEditedService({ ...editedService, categoryTags: updatedCategoryTags })
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim())
      setEditedService({ ...editedService, categories: [...editedService.categories, newCategory.trim()] })
      setNewCategory("")
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isEditing && !justClosedRef.current && e.button === 0) {
      e.preventDefault()
      window.open(service.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleUrlChange = (value: string) => {
    setEditedService({ ...editedService, url: value })
    if (value && !value.startsWith("http://") && !value.startsWith("https://") && value.includes(".")) {
      setShowHttpsPrompt(true)
    } else {
      setShowHttpsPrompt(false)
    }
  }

  const handleAddHttps = () => {
    setEditedService({ ...editedService, url: `https://${editedService.url}` })
    setShowHttpsPrompt(false)
  }

  const handleFetchMetadata = async () => {
    if (!editedService.url) return

    setIsFetching(true)
    try {
      const response = await fetch("/api/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editedService.url }),
      })

      if (response.ok) {
        const data = await response.json()
        setEditedService({
          ...editedService,
          name: editedService.name || data.title || "",
          description: editedService.description || data.description || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
    } finally {
      setIsFetching(false)
    }
  }

  const hasDisplayContent =
    service.flags.length > 0 || (showTags && service.tags.length > 0) || (showRatings && currentRating > 0) || !hideUrls

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor }}
      className="border border-border rounded-lg bg-card hover:border-muted-foreground/50 transition-colors"
    >
      <div className="flex items-start gap-3 p-4">
        {isDraggable && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={!isEditing ? handleCardClick : undefined}
          className={`flex-1 min-w-0 group ${!isEditing ? "cursor-pointer" : ""}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-semibold group hover:text-muted-foreground transition-colors inline-flex items-center gap-1">
              {service.name}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <Dialog open={isEditing} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle>Edit Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Name</label>
                    <Input
                      value={editedService.name}
                      onChange={(e) => setEditedService({ ...editedService, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={editedService.url}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFetchMetadata}
                        disabled={!editedService.url || isFetching}
                      >
                        {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </Button>
                    </div>
                    {showHttpsPrompt && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span className="text-sm">Add https:// to URL?</span>
                          <Button size="sm" variant="outline" onClick={handleAddHttps}>
                            Add https://
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea
                      value={editedService.description}
                      onChange={(e) => setEditedService({ ...editedService, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categories (select at least one)</label>
                    <div className="space-y-2">
                      {allCategories.map((category) => {
                        const checkboxId = `category-${category}`
                        return (
                          <div key={category} className="flex items-center gap-2">
                            <Checkbox
                              id={checkboxId}
                              checked={editedService.categories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEditedService({
                                    ...editedService,
                                    categories: [...editedService.categories, category],
                                  })
                                } else {
                                  setEditedService({
                                    ...editedService,
                                    categories: editedService.categories.filter((c) => c !== category),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={checkboxId} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        )
                      })}
                      <div className="flex gap-2 pt-2">
                        <Input
                          placeholder="Create new category"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                        />
                        <Button size="sm" onClick={handleAddCategory}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {editedService.categories.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ratings (per category)</label>
                      <div className="space-y-3">
                        {editedService.categories.map((category) => (
                          <div key={category} className="space-y-1">
                            <div className="text-sm text-muted-foreground">{category}</div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Star
                                  key={rating}
                                  className={`w-6 h-6 cursor-pointer transition-colors ${
                                    rating <= (editedService.ratings[category] || 0)
                                      ? "fill-foreground text-foreground"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                  onClick={() => {
                                    const currentRating = editedService.ratings[category] || 0
                                    const newRatings = { ...editedService.ratings }
                                    if (rating === currentRating) {
                                      delete newRatings[category]
                                    } else {
                                      newRatings[category] = rating
                                    }
                                    setEditedService({
                                      ...editedService,
                                      ratings: newRatings,
                                    })
                                  }}
                                />
                              ))}
                              {(editedService.ratings[category] || 0) > 0 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="ml-2 h-6 text-xs"
                                  onClick={() => {
                                    const newRatings = { ...editedService.ratings }
                                    delete newRatings[category]
                                    setEditedService({ ...editedService, ratings: newRatings })
                                  }}
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Background Intensity</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: "default", label: "Default" },
                        { value: "lighter", label: "Little Lighter" },
                        { value: "light", label: "Lighter" },
                        { value: "bright", label: "Bright" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={`h-16 rounded border-2 transition-all flex items-center justify-center text-xs ${
                            (editedService.colorIntensity || "default") === option.value
                              ? "border-foreground scale-105"
                              : "border-border hover:border-muted-foreground"
                          }`}
                          style={{
                            backgroundColor: getServiceBackgroundColor(
                              categoryHue,
                              option.value as Service["colorIntensity"],
                            ),
                          }}
                          onClick={() =>
                            setEditedService({
                              ...editedService,
                              colorIntensity: option.value as Service["colorIntensity"],
                            })
                          }
                        >
                          <span className="text-muted-foreground">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Flags</label>
                    <div className="space-y-2">
                      {usedFlags.map((flag) => {
                        const checkboxId = `flag-${flag}`
                        return (
                          <div key={flag} className="flex items-center gap-2">
                            <Checkbox
                              id={checkboxId}
                              checked={editedService.flags.includes(flag)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEditedService({ ...editedService, flags: [...editedService.flags, flag] })
                                } else {
                                  setEditedService({
                                    ...editedService,
                                    flags: editedService.flags.filter((f) => f !== flag),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={checkboxId} className="text-sm cursor-pointer">
                              {flag}
                            </label>
                          </div>
                        )
                      })}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom flag"
                          value={newFlag}
                          onChange={(e) => setNewFlag(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddFlag()}
                        />
                        <Button size="sm" onClick={handleAddFlag}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">General Tags (shown in all categories)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editedService.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                          {tag}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setEditedService({
                                ...editedService,
                                tags: editedService.tags.filter((t) => t !== tag),
                              })
                            }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add general tag (e.g., React, DALL-E 3)"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button size="sm" onClick={handleAddTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {editedService.categories.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category-Specific Tags</label>
                      <div className="space-y-3">
                        {editedService.categories.map((category) => {
                          const categoryData = allCategoriesData.find((c) => c.name === category)
                          const categoryTagsList = categoryData?.tags || []
                          const inputValue = categoryTagInputs[category] || ""
                          const filteredSuggestions = inputValue
                            ? categoryTagsList.filter(
                                (tag) =>
                                  tag.toLowerCase().includes(inputValue.toLowerCase()) &&
                                  !(editedService.categoryTags?.[category] || []).includes(tag)
                              )
                            : []

                          return (
                            <div key={category} className="space-y-2">
                              <div className="text-sm text-muted-foreground">{category}</div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {(editedService.categoryTags?.[category] || []).map((tag) => (
                                  <Badge key={tag} variant="outline" className="gap-1 pr-1">
                                    {tag}
                                    <button
                                      type="button"
                                      className="ml-1 hover:text-destructive"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleRemoveCategoryTag(category, tag)
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="relative">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder={`Add tag for ${category}`}
                                    value={inputValue}
                                    onChange={(e) =>
                                      setCategoryTagInputs({ ...categoryTagInputs, [category]: e.target.value })
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && handleAddCategoryTag(category)}
                                  />
                                  <Button size="sm" onClick={() => handleAddCategoryTag(category)}>
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                                {filteredSuggestions.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-40 overflow-auto">
                                    {filteredSuggestions.map((suggestion) => (
                                      <button
                                        key={suggestion}
                                        type="button"
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                        onClick={() => {
                                          const updatedCategoryTags = {
                                            ...editedService.categoryTags,
                                            [category]: [
                                              ...(editedService.categoryTags?.[category] || []),
                                              suggestion,
                                            ],
                                          }
                                          setEditedService({ ...editedService, categoryTags: updatedCategoryTags })
                                          setCategoryTagInputs({ ...categoryTagInputs, [category]: "" })
                                        }}
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 justify-between pt-4 border-t border-border">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete(service.id)
                        setIsEditing(false)
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Service
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={editedService.categories.length === 0}>
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            {!hideUrls && (
              <div className="text-xs font-mono truncate" style={{ color: textColor, opacity: 0.7 }}>
                {stripProtocol(service.url)}
              </div>
            )}
            {!hideDescriptions && (
              <p className="text-sm leading-relaxed" style={{ color: textColor }}>
                {service.description}
              </p>
            )}
          </div>

          {hasDisplayContent && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {service.flags.map((flag) => (
                <Badge key={flag} variant="outline" className="text-xs">
                  {flag}
                </Badge>
              ))}
              {showTags &&
                service.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-mono">
                    {tag}
                  </Badge>
                ))}
              {showTags &&
                (service.categoryTags?.[currentCategory] || []).map((tag) => (
                  <Badge key={`cat-${tag}`} variant="outline" className="text-xs font-mono">
                    {tag}
                  </Badge>
                ))}
              {showRatings && currentRating > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`w-4 h-4 ${
                        rating <= currentRating ? "fill-foreground text-foreground" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </a>
      </div>
    </div>
  )
}
