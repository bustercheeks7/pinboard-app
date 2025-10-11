"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Plus, Edit2, Trash2, GripVertical } from "lucide-react"
import type { Category } from "@/components/pinboard-app"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface EditCategoryDialogProps {
  categories: Category[]
  onAdd: (name: string) => void
  onUpdate: (id: string, updates: Partial<Category>) => void
  onDelete: (id: string) => void
  onReorder: (categories: Category[]) => void
}

function SortableCategoryItem({
  category,
  editingId,
  editingName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditNameChange,
}: {
  category: Category
  editingId: string | null
  editingName: string
  onStartEdit: (id: string, name: string) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
  onEditNameChange: (name: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 border border-border rounded bg-card">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      {editingId === category.id ? (
        <>
          <Input
            value={editingName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit(category.id)
              if (e.key === "Escape") onCancelEdit()
            }}
            autoFocus
          />
          <Button size="sm" onClick={() => onSaveEdit(category.id)}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1">{category.name}</span>
          <Button size="sm" variant="ghost" onClick={() => onStartEdit(category.id, category.name)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm(`Delete category "${category.name}"? Services in this category will not be deleted.`)) {
                onDelete(category.id)
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  )
}

export function EditCategoryDialog({ categories, onAdd, onUpdate, onDelete, onReorder }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAdd(newCategoryName.trim())
      setNewCategoryName("")
    }
  }

  const handleUpdate = (id: string) => {
    if (editingName.trim()) {
      onUpdate(id, { name: editingName.trim() })
      setEditingId(null)
      setEditingName("")
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id)
      const newIndex = categories.findIndex((c) => c.id === over.id)
      const reordered = arrayMove(categories, oldIndex, newIndex).map((cat, index) => ({
        ...cat,
        order: index,
      }))
      onReorder(reordered)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {categories.map((category) => (
                  <SortableCategoryItem
                    key={category.id}
                    category={category}
                    editingId={editingId}
                    editingName={editingName}
                    onStartEdit={(id, name) => {
                      setEditingId(id)
                      setEditingName(name)
                    }}
                    onSaveEdit={handleUpdate}
                    onCancelEdit={() => {
                      setEditingId(null)
                      setEditingName("")
                    }}
                    onDelete={onDelete}
                    onEditNameChange={setEditingName}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
