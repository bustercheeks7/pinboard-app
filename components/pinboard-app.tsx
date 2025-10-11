"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Palette, Columns3, Download, Upload } from "lucide-react"
import { CategorySection } from "@/components/category-section"
import { AddServiceDialog } from "@/components/add-service-dialog"
import { EditCategoryDialog } from "@/components/edit-category-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface Service {
  id: string
  name: string
  url: string
  description: string
  categories: string[]
  flags: string[]
  tags: string[]
  categoryTags?: { [categoryName: string]: string[] }
  ratings: { [categoryName: string]: number }
  order: number
  colorIntensity?: "default" | "lighter" | "light" | "bright"
}

export interface Category {
  id: string
  name: string
  order: number
  hue?: number
  tags: string[]
}

export interface PinboardData {
  title: string
  services: Service[]
  categories: Category[]
  availableFlags: string[]
}

const initialData: PinboardData = {
  title: "My Pinboard",
  services: [
    {
      id: "1",
      name: "ChatGPT",
      url: "https://chat.openai.com",
      description: "OpenAI conversational AI",
      categories: ["AI Assistants & Chatbots"],
      flags: [],
      tags: [],
      ratings: {},
      order: 0,
    },
  ],
  categories: [
    { id: "1", name: "AI Assistants & Chatbots", order: 0, tags: [] },
    { id: "2", name: "Image & Video Generation", order: 1, tags: [] },
    { id: "3", name: "Video Editing", order: 2, tags: [] },
    { id: "4", name: "Audio & Music Generation", order: 3, tags: [] },
    { id: "5", name: "Google AI Platforms", order: 4, tags: [] },
    { id: "6", name: "Web App Development", order: 5, tags: ["Coding", "Hosting"] },
    { id: "7", name: "Writing", order: 6, tags: [] },
    { id: "8", name: "Miscellaneous", order: 7, tags: [] },
  ],
  availableFlags: ["paid", "untested", "deprecated"],
}

export function PinboardApp() {
  const [data, setData] = useState<PinboardData>(initialData)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(data.title)
  const [textColor, setTextColor] = useState("#9ca3af")
  const [columnCount, setColumnCount] = useState(2)
  const [hideDescriptions, setHideDescriptions] = useState(false)
  const [showTags, setShowTags] = useState(true)
  const [showRatings, setShowRatings] = useState(true)
  const [hideUrls, setHideUrls] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("pinboard-data")
    if (saved) {
      try {
        const loadedData = JSON.parse(saved)
        if (loadedData.categories) {
          loadedData.categories = loadedData.categories.map((category: any) => {
            if (!category.tags) {
              return {
                ...category,
                tags: [],
              }
            }
            return category
          })
        }
        if (loadedData.services) {
          loadedData.services = loadedData.services.map((service: any) => {
            if (typeof service.rating === "number" && !service.ratings) {
              return {
                ...service,
                ratings: {},
                rating: undefined,
              }
            }
            if (!service.ratings) {
              return {
                ...service,
                ratings: {},
              }
            }
            if (!service.categoryTags) {
              return {
                ...service,
                categoryTags: {},
              }
            }
            return service
          })
        }
        setData(loadedData)
      } catch (e) {
        console.error("Failed to load data:", e)
      }
    }
    const savedTextColor = localStorage.getItem("pinboard-text-color")
    if (savedTextColor) {
      setTextColor(savedTextColor)
    }
    const savedColumns = localStorage.getItem("pinboard-column-count")
    if (savedColumns) {
      setColumnCount(Number.parseInt(savedColumns))
    }
    const savedHideDescriptions = localStorage.getItem("pinboard-hide-descriptions")
    if (savedHideDescriptions) {
      setHideDescriptions(savedHideDescriptions === "true")
    }
    const savedShowTags = localStorage.getItem("pinboard-show-tags")
    if (savedShowTags !== null) {
      setShowTags(savedShowTags === "true")
    }
    const savedShowRatings = localStorage.getItem("pinboard-show-ratings")
    if (savedShowRatings !== null) {
      setShowRatings(savedShowRatings === "true")
    }
    const savedHideUrls = localStorage.getItem("pinboard-hide-urls")
    if (savedHideUrls !== null) {
      setHideUrls(savedHideUrls === "true")
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("pinboard-data", JSON.stringify(data))
  }, [data])

  useEffect(() => {
    localStorage.setItem("pinboard-text-color", textColor)
  }, [textColor])

  useEffect(() => {
    localStorage.setItem("pinboard-column-count", columnCount.toString())
  }, [columnCount])

  useEffect(() => {
    localStorage.setItem("pinboard-hide-descriptions", hideDescriptions.toString())
  }, [hideDescriptions])

  useEffect(() => {
    localStorage.setItem("pinboard-show-tags", showTags.toString())
  }, [showTags])

  useEffect(() => {
    localStorage.setItem("pinboard-show-ratings", showRatings.toString())
  }, [showRatings])

  useEffect(() => {
    localStorage.setItem("pinboard-hide-urls", hideUrls.toString())
  }, [hideUrls])

  const handleTitleSave = () => {
    setData({ ...data, title: tempTitle })
    setIsEditingTitle(false)
  }

  const addService = (service: Omit<Service, "id" | "order">) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      order: data.services.filter((s) => s.categories.some((c) => service.categories.includes(c))).length,
    }
    setData({ ...data, services: [...data.services, newService] })
  }

  const updateService = (id: string, updates: Partial<Service>) => {
    const updatedServices = data.services.map((s) => (s.id === id ? { ...s, ...updates } : s))

    const usedFlags = new Set<string>()
    updatedServices.forEach((service) => {
      service.flags.forEach((flag) => usedFlags.add(flag))
    })
    const cleanedFlags = data.availableFlags.filter((flag) => usedFlags.has(flag))

    setData({
      ...data,
      services: updatedServices,
      availableFlags: cleanedFlags,
    })
  }

  const deleteService = (id: string) => {
    const updatedServices = data.services.filter((s) => s.id !== id)

    const usedFlags = new Set<string>()
    updatedServices.forEach((service) => {
      service.flags.forEach((flag) => usedFlags.add(flag))
    })
    const cleanedFlags = data.availableFlags.filter((flag) => usedFlags.has(flag))

    setData({
      ...data,
      services: updatedServices,
      availableFlags: cleanedFlags,
    })
  }

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      order: data.categories.length,
      tags: [],
    }
    setData({ ...data, categories: [...data.categories, newCategory] })
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setData({
      ...data,
      categories: data.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })
  }

  const deleteCategory = (id: string) => {
    const categoryName = data.categories.find((c) => c.id === id)?.name
    if (!categoryName) return

    setData({
      ...data,
      categories: data.categories.filter((c) => c.id !== id),
      services: data.services.map((s) => ({
        ...s,
        categories: s.categories.filter((c) => c !== categoryName),
      })),
    })
  }

  const reorderServices = (categoryName: string, services: Service[]) => {
    const updatedServices = services.map((s, index) => ({ ...s, order: index }))
    const otherServices = data.services.filter((s) => !s.categories.includes(categoryName))
    setData({ ...data, services: [...otherServices, ...updatedServices] })
  }

  const addFlag = (flag: string) => {
    if (!data.availableFlags.includes(flag)) {
      setData({ ...data, availableFlags: [...data.availableFlags, flag] })
    }
  }

  const reorderCategories = (categories: Category[]) => {
    setData({ ...data, categories })
  }

  const addTagToCategory = (categoryId: string, tag: string) => {
    setData({
      ...data,
      categories: data.categories.map((c) => (c.id === categoryId ? { ...c, tags: [...(c.tags || []), tag] } : c)),
    })
  }

  const addMultipleTagsToCategory = (categoryId: string, tags: string[]) => {
    setData({
      ...data,
      categories: data.categories.map((c) => (c.id === categoryId ? { ...c, tags: [...(c.tags || []), ...tags] } : c)),
    })
  }

  const removeTagFromCategory = (categoryId: string, tag: string) => {
    setData({
      ...data,
      categories: data.categories.map((c) =>
        c.id === categoryId ? { ...c, tags: (c.tags || []).filter((t) => t !== tag) } : c,
      ),
    })
  }

  const handleExport = () => {
    const exportData = {
      data,
      settings: {
        textColor,
        columnCount,
        hideDescriptions,
        showTags,
        showRatings,
        hideUrls,
      },
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pinboard-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)

        if (importData.data) {
          setData(importData.data)
        }

        if (importData.settings) {
          if (importData.settings.textColor) setTextColor(importData.settings.textColor)
          if (importData.settings.columnCount) setColumnCount(importData.settings.columnCount)
          if (typeof importData.settings.hideDescriptions === "boolean") {
            setHideDescriptions(importData.settings.hideDescriptions)
          }
          if (typeof importData.settings.showTags === "boolean") {
            setShowTags(importData.settings.showTags)
          }
          if (typeof importData.settings.showRatings === "boolean") {
            setShowRatings(importData.settings.showRatings)
          }
          if (typeof importData.settings.hideUrls === "boolean") {
            setHideUrls(importData.settings.hideUrls)
          }
        }

        alert("Data imported successfully!")
      } catch (error) {
        console.error("Failed to import data:", error)
        alert("Failed to import data. Please check the file format.")
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-3xl font-bold bg-transparent border-b border-border rounded-none px-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave()
                  if (e.key === "Escape") {
                    setTempTitle(data.title)
                    setIsEditingTitle(false)
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleTitleSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTempTitle(data.title)
                  setIsEditingTitle(false)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1
                className="text-3xl font-bold cursor-pointer hover:text-muted-foreground transition-colors flex items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {data.title}
                <Edit2 className="w-5 h-5 opacity-50" />
              </h1>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                    <Palette className="w-5 h-5" style={{ color: textColor }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Text Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                    <div className="grid grid-cols-5 gap-2">
                      {["#9ca3af", "#6b7280", "#d1d5db", "#a78bfa", "#60a5fa"].map((color) => (
                        <button
                          key={color}
                          className="w-full h-8 rounded border-2 border-border hover:border-foreground transition-colors"
                          style={{ backgroundColor: color }}
                          onClick={() => setTextColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="hidden md:flex items-center gap-2">
                <Columns3 className="w-5 h-5 text-muted-foreground" />
                <Select
                  value={columnCount.toString()}
                  onValueChange={(value) => setColumnCount(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-16 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                variant={hideDescriptions ? "default" : "ghost"}
                onClick={() => setHideDescriptions(!hideDescriptions)}
                className="h-9"
              >
                {hideDescriptions ? "Show" : "Hide"} Descriptions
              </Button>
              <Button
                size="sm"
                variant={!showTags ? "default" : "ghost"}
                onClick={() => setShowTags(!showTags)}
                className="h-9"
              >
                {showTags ? "Hide" : "Show"} Tags
              </Button>
              <Button
                size="sm"
                variant={!showRatings ? "default" : "ghost"}
                onClick={() => setShowRatings(!showRatings)}
                className="h-9"
              >
                {showRatings ? "Hide" : "Show"} Ratings
              </Button>
              <Button
                size="sm"
                variant={hideUrls ? "default" : "ghost"}
                onClick={() => setHideUrls(!hideUrls)}
                className="h-9"
              >
                {hideUrls ? "Show" : "Hide"} URLs
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} title="Export data">
              <Upload className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} title="Import data">
              <Download className="w-4 h-4" />
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <AddServiceDialog
              categories={data.categories.map((c) => c.name)}
              availableFlags={data.availableFlags}
              onAdd={addService}
              onAddFlag={addFlag}
            />
            <EditCategoryDialog
              categories={data.categories}
              onAdd={addCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
              onReorder={reorderCategories}
            />
          </div>
        </div>

        <div className="space-y-8">
          {data.categories
            .sort((a, b) => a.order - b.order)
            .map((category) => {
              const categoryServices = data.services
                .filter((s) => s.categories.includes(category.name))
                .sort((a, b) => a.order - b.order)

              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  services={categoryServices}
                  allServices={data.services}
                  availableFlags={data.availableFlags}
                  allCategories={data.categories.map((c) => c.name)}
                  columnCount={columnCount}
                  textColor={textColor}
                  hideDescriptions={hideDescriptions}
                  showTags={showTags}
                  showRatings={showRatings}
                  hideUrls={hideUrls}
                  onUpdateService={updateService}
                  onDeleteService={deleteService}
                  onReorderServices={reorderServices}
                  onUpdateCategory={updateCategory}
                  onAddFlag={addFlag}
                  onAddCategory={addCategory}
                  onAddTagToCategory={addTagToCategory}
                  onAddMultipleTagsToCategory={addMultipleTagsToCategory}
                  onRemoveTagFromCategory={removeTagFromCategory}
                />
              )
            })}

          {(() => {
            const uncategorizedServices = data.services
              .filter((s) => s.categories.length === 0)
              .sort((a, b) => a.order - b.order)

            if (uncategorizedServices.length === 0) return null

            return (
              <CategorySection
                key="uncategorized"
                category={{ id: "uncategorized", name: "Uncategorized", order: 999, tags: [] }}
                services={uncategorizedServices}
                allServices={data.services}
                availableFlags={data.availableFlags}
                allCategories={data.categories.map((c) => c.name)}
                columnCount={columnCount}
                textColor={textColor}
                hideDescriptions={hideDescriptions}
                showTags={showTags}
                showRatings={showRatings}
                hideUrls={hideUrls}
                onUpdateService={updateService}
                onDeleteService={deleteService}
                onReorderServices={(_, services) => {
                  const updatedServices = services.map((s, index) => ({ ...s, order: index }))
                  const otherServices = data.services.filter((s) => s.categories.length > 0)
                  setData({ ...data, services: [...otherServices, ...updatedServices] })
                }}
                onUpdateCategory={() => {}}
                onAddFlag={addFlag}
                onAddCategory={addCategory}
                onAddTagToCategory={() => {}}
                onAddMultipleTagsToCategory={() => {}}
                onRemoveTagFromCategory={() => {}}
              />
            )
          })()}
        </div>
      </div>
    </div>
  )
}
