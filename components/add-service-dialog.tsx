"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X, Loader2, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/components/pinboard-app"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddServiceDialogProps {
  categories: string[]
  availableFlags: string[]
  onAdd: (service: Omit<Service, "id" | "order">) => void
  onAddFlag: (flag: string) => void
}

export function AddServiceDialog({ categories, availableFlags, onAdd, onAddFlag }: AddServiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [newFlag, setNewFlag] = useState("")
  const [isFetching, setIsFetching] = useState(false)
  const [showHttpsPrompt, setShowHttpsPrompt] = useState(false)

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value && !value.startsWith("http://") && !value.startsWith("https://") && value.includes(".")) {
      setShowHttpsPrompt(true)
    } else {
      setShowHttpsPrompt(false)
    }
  }

  const handleAddHttps = () => {
    setUrl(`https://${url}`)
    setShowHttpsPrompt(false)
  }

  const handleFetchMetadata = async () => {
    if (!url) return

    setIsFetching(true)
    try {
      const response = await fetch("/api/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.title && !name) {
          setName(data.title)
        }
        if (data.description && !description) {
          setDescription(data.description)
        }
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = () => {
    if (!name || !url || selectedCategories.length === 0) return

    onAdd({
      name,
      url,
      description,
      categories: selectedCategories,
      flags: selectedFlags,
      tags,
      ratings: {},
      colorIntensity: "default",
    })

    setName("")
    setUrl("")
    setDescription("")
    setSelectedCategories([])
    setSelectedFlags([])
    setTags([])
    setShowHttpsPrompt(false)
    setOpen(false)
  }

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleAddFlag = () => {
    if (newFlag && !availableFlags.includes(newFlag)) {
      onAddFlag(newFlag)
      setSelectedFlags([...selectedFlags, newFlag])
      setNewFlag("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">URL *</label>
            <div className="flex gap-2">
              <Input value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://example.com" />
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchMetadata}
                disabled={!url || isFetching}
                className="shrink-0 bg-transparent"
              >
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the service"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Categories * (select at least one)</label>
            <div className="space-y-2">
              {categories.map((category) => {
                const checkboxId = `add-category-${category}`
                return (
                  <div key={category} className="flex items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category])
                        } else {
                          setSelectedCategories(selectedCategories.filter((c) => c !== category))
                        }
                      }}
                    />
                    <label htmlFor={checkboxId} className="text-sm cursor-pointer">
                      {category}
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Flags</label>
            <div className="space-y-2">
              {availableFlags.map((flag) => {
                const checkboxId = `add-flag-${flag}`
                return (
                  <div key={flag} className="flex items-center gap-2">
                    <Checkbox
                      id={checkboxId}
                      checked={selectedFlags.includes(flag)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFlags([...selectedFlags, flag])
                        } else {
                          setSelectedFlags(selectedFlags.filter((f) => f !== flag))
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
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag (e.g., React, DALL-E 3)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button size="sm" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name || !url || selectedCategories.length === 0}>
              Add Service
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
