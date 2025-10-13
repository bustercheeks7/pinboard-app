"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Palette, Plus, X, GripVertical } from "lucide-react"
import { ServiceCard } from "@/components/service-card"
import { Badge } from "@/components/ui/badge"
import type { Service, Category } from "@/components/pinboard-app"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CategorySectionProps {
  category: Category
  services: Service[]
  allServices: Service[]
  availableFlags: string[]
  allCategories: string[]
  allCategoriesData: Category[]
  columnCount: number
  textColor: string
  hideDescriptions: boolean
  showTags: boolean
  showRatings: boolean
  hideUrls: boolean
  onUpdateService: (id: string, updates: Partial<Service>) => void
  onDeleteService: (id: string) => void
  onReorderServices: (categoryName: string, services: Service[]) => void
  onUpdateCategory: (id: string, updates: Partial<Category>) => void
  onAddFlag: (flag: string) => void
  onAddCategory: (name: string) => void
  onAddTagToCategory: (categoryId: string, tag: string) => void
  onAddMultipleTagsToCategory: (categoryId: string, tags: string[]) => void
  onRemoveTagFromCategory: (categoryId: string, tag: string) => void
}

function SortableTagBadge({
  tag,
  isSelected,
  isEditMode,
  onToggle,
  onRemove,
}: {
  tag: string
  isSelected: boolean
  isEditMode: boolean
  onToggle: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      {isEditMode && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
      <Badge
        variant={isSelected ? "default" : "outline"}
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={onToggle}
      >
        {tag}
        {isEditMode && (
          <button
            className="ml-1 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </Badge>
    </div>
  )
}

export function CategorySection({
  category,
  services,
  allServices,
  availableFlags,
  allCategories,
  allCategoriesData,
  columnCount,
  textColor,
  hideDescriptions,
  showTags,
  showRatings,
  hideUrls,
  onUpdateService,
  onDeleteService,
  onReorderServices,
  onUpdateCategory,
  onAddFlag,
  onAddCategory,
  onAddTagToCategory,
  onAddMultipleTagsToCategory,
  onRemoveTagFromCategory,
}: CategorySectionProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [selectedTagsToAdd, setSelectedTagsToAdd] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleTagDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = category.tags.findIndex((tag) => tag === active.id)
      const newIndex = category.tags.findIndex((tag) => tag === over.id)
      const reorderedTags = arrayMove(category.tags, oldIndex, newIndex)
      onUpdateCategory(category.id, { tags: reorderedTags })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = services.findIndex((s) => s.id === active.id)
      const newIndex = services.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(services, oldIndex, newIndex)
      onReorderServices(category.name, reordered)
    }
  }

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleAddTag = () => {
    const tagsToAdd: string[] = []

    selectedTagsToAdd.forEach((tag) => {
      if (!category.tags.includes(tag)) {
        tagsToAdd.push(tag)
      }
    })

    if (newTagName.trim() && !category.tags.includes(newTagName.trim())) {
      tagsToAdd.push(newTagName.trim())
    }

    if (tagsToAdd.length > 0) {
      onAddMultipleTagsToCategory(category.id, tagsToAdd)
    }

    setNewTagName("")
    setSelectedTagsToAdd([])
    setIsAddTagDialogOpen(false)
  }

  const getAvailableServiceTags = () => {
    const serviceTags = new Set<string>()
    services.forEach((service) => {
      service.tags.forEach((tag) => {
        if (!category.tags.includes(tag)) {
          serviceTags.add(tag)
        }
      })
    })
    return Array.from(serviceTags).sort()
  }

  const availableServiceTags = getAvailableServiceTags()

  const filteredServices =
    selectedTags.length > 0
      ? services.filter((service) => service.tags.some((tag) => selectedTags.includes(tag)))
      : services

  if (services.length === 0) return null

  const gridClasses = `grid grid-cols-1 ${
    columnCount === 1
      ? ""
      : columnCount === 2
        ? "md:grid-cols-2"
        : columnCount === 3
          ? "md:grid-cols-3"
          : columnCount === 4
            ? "md:grid-cols-4"
            : columnCount === 5
              ? "md:grid-cols-5"
              : "md:grid-cols-6"
  } gap-3`

  const categoryTags = category.tags || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl font-semibold text-muted-foreground"
          style={category.hue !== undefined ? { color: `hsl(${category.hue} 50% 60%)` } : { color: textColor }}
        >
          {category.name}
        </h2>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Palette className="w-4 h-4 mr-2" />
                  Color
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Category Hue</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={category.hue || 0}
                    onChange={(e) => onUpdateCategory(category.id, { hue: Number.parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div
                    className="w-full h-10 rounded border border-border"
                    style={{ backgroundColor: `hsl(${category.hue || 0} 30% 15%)` }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => onUpdateCategory(category.id, { hue: undefined })}
                  >
                    Reset to Default
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button size="sm" variant={isEditMode ? "default" : "ghost"} onClick={() => setIsEditMode(!isEditMode)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {categoryTags.length > 0 && (
        <div className="mb-4">
          {isEditMode ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTagDragEnd}>
              <SortableContext items={categoryTags}>
                <div className="flex flex-wrap items-center gap-2">
                  {categoryTags.map((tag) => (
                    <SortableTagBadge
                      key={tag}
                      tag={tag}
                      isSelected={selectedTags.includes(tag)}
                      isEditMode={isEditMode}
                      onToggle={() => toggleTagFilter(tag)}
                      onRemove={() => {
                        onRemoveTagFromCategory(category.id, tag)
                        setSelectedTags((prev) => prev.filter((t) => t !== tag))
                      }}
                    />
                  ))}
                  <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Tags to {category.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {availableServiceTags.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Tags from services:</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {availableServiceTags.map((tag) => (
                                <div key={tag} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`tag-${tag}`}
                                    checked={selectedTagsToAdd.includes(tag)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedTagsToAdd((prev) => [...prev, tag])
                                      } else {
                                        setSelectedTagsToAdd((prev) => prev.filter((t) => t !== tag))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`tag-${tag}`} className="cursor-pointer">
                                    {tag}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="new-tag" className="text-sm font-medium">
                            Or create a new tag:
                          </Label>
                          <Input
                            id="new-tag"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Tag name"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddTag()
                            }}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setNewTagName("")
                              setSelectedTagsToAdd([])
                              setIsAddTagDialogOpen(false)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddTag}
                            disabled={selectedTagsToAdd.length === 0 && !newTagName.trim()}
                          >
                            Add Tags
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {categoryTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => toggleTagFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {categoryTags.length === 0 && isEditMode && (
        <div className="mb-4">
          <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent">
                <Plus className="w-3 h-3 mr-1" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Tags to {category.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {availableServiceTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags from services:</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableServiceTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTagsToAdd.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTagsToAdd((prev) => [...prev, tag])
                              } else {
                                setSelectedTagsToAdd((prev) => prev.filter((t) => t !== tag))
                              }
                            }}
                          />
                          <Label htmlFor={`tag-${tag}`} className="cursor-pointer">
                            {tag}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-tag" className="text-sm font-medium">
                    Or create a new tag:
                  </Label>
                  <Input
                    id="new-tag"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Tag name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTag()
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewTagName("")
                      setSelectedTagsToAdd([])
                      setIsAddTagDialogOpen(false)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddTag} disabled={selectedTagsToAdd.length === 0 && !newTagName.trim()}>
                    Add Tags
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isEditMode ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className={gridClasses}>
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  availableFlags={availableFlags}
                  allCategories={allCategories}
                  allCategoriesData={allCategoriesData}
                  allServices={allServices}
                  currentCategory={category.name}
                  categoryHue={category.hue}
                  textColor={textColor}
                  hideDescriptions={hideDescriptions}
                  showTags={showTags}
                  showRatings={showRatings}
                  hideUrls={hideUrls}
                  onUpdate={onUpdateService}
                  onDelete={onDeleteService}
                  onAddFlag={onAddFlag}
                  onAddCategory={onAddCategory}
                  isDraggable={isEditMode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className={gridClasses}>
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              availableFlags={availableFlags}
              allCategories={allCategories}
              allCategoriesData={allCategoriesData}
              allServices={allServices}
              currentCategory={category.name}
              categoryHue={category.hue}
              textColor={textColor}
              hideDescriptions={hideDescriptions}
              showTags={showTags}
              showRatings={showRatings}
              hideUrls={hideUrls}
              onUpdate={onUpdateService}
              onDelete={onDeleteService}
              onAddFlag={onAddFlag}
              onAddCategory={onAddCategory}
              isDraggable={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
