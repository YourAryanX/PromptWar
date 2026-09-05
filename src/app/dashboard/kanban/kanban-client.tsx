'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  sort_order: number
}

interface Props {
  initialTasks: Task[]
  projectId: string
  projectTitle: string
}

interface SortableItemProps {
  task: Task
  onMoveLeft?: () => void
  onMoveRight?: () => void
}

function SortableItem({ task, onMoveLeft, onMoveRight }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
      <Card className="glass-card bg-white/60 dark:bg-zinc-900/60 cursor-grab active:cursor-grabbing border-white/20 hover:border-primary/40 transition-colors group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-sm leading-snug">{task.title}</p>
            {task.status === 'done' && <Check className="w-4 h-4 text-green-500 flex-shrink-0" />}
          </div>
          {task.difficulty && (
            <Badge
              variant={task.difficulty === 'Hard' ? 'destructive' : task.difficulty === 'Medium' ? 'default' : 'secondary'}
              className="text-[10px] mt-2"
            >
              {task.difficulty}
            </Badge>
          )}
          <div className="flex gap-1 mt-3 justify-end">
            {onMoveLeft && (
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onMoveLeft(); }}>
                <ArrowLeft className="w-3 h-3" />
                <span className="sr-only">Move left</span>
              </Button>
            )}
            {onMoveRight && (
              <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onMoveRight(); }}>
                <ArrowRight className="w-3 h-3" />
                <span className="sr-only">Move right</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function KanbanClient({ initialTasks, projectId, projectTitle }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingToCol, setAddingToCol] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // Memoize client to prevent recreation
  const [supabase] = useState(() => createClient())

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)
    const newTasks = arrayMove(tasks, oldIndex, newIndex)
    setTasks(newTasks)

    // Persist the new sort order to Supabase
    startTransition(async () => {
      const updates = newTasks.map((t, i) => supabase.from('tasks').update({ sort_order: i }).eq('id', t.id))
      await Promise.all(updates)
    })
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  const addTask = async (col: string) => {
    if (!newTaskTitle.trim()) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({ project_id: projectId, title: newTaskTitle.trim(), status: col, sort_order: tasks.length })
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) => [...prev, data as Task])
    }
    setNewTaskTitle('')
    setAddingToCol(null)
  }

  const columns: Array<{ key: Task['status']; label: string }> = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
  ]

  return (
    <div className="h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-glow mb-2">Build Roadmap</h1>
          <p className="text-muted-foreground">{projectTitle}</p>
        </div>
        {isPending && (
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Saving changes...
          </div>
        )}
      </motion.div>

      <div className="flex-1 overflow-x-auto">
        <p className="sr-only" id="kanban-desc">Use arrow keys or move buttons to reorder and transition tasks.</p>
        <div className="flex gap-6 min-w-max h-full pb-4" aria-describedby="kanban-desc">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            {columns.map((col, idx) => (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="w-80 flex flex-col"
              >
                <div className="glass-panel p-4 rounded-t-2xl border-b-0 border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground/90">{col.label}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/10 dark:bg-white/10">
                      {tasks.filter((t) => t.status === col.key).length}
                    </Badge>
                    <button
                      onClick={() => setAddingToCol(addingToCol === col.key ? null : col.key)}
                      className="w-6 h-6 rounded-full bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="glass flex-1 rounded-b-2xl p-4 border-t-0 border-white/10 bg-black/5 dark:bg-white/5 flex flex-col">
                  <SortableContext
                    items={tasks.filter((t) => t.status === col.key).map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasks.filter((t) => t.status === col.key).map((task) => (
                      <SortableItem 
                        key={task.id} 
                        task={task} 
                        onMoveLeft={idx > 0 ? () => handleStatusChange(task.id, columns[idx - 1].key) : undefined}
                        onMoveRight={idx < columns.length - 1 ? () => handleStatusChange(task.id, columns[idx + 1].key) : undefined}
                      />
                    ))}
                  </SortableContext>

                  {addingToCol === col.key && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-2">
                      <Input
                        autoFocus
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') addTask(col.key); if (e.key === 'Escape') setAddingToCol(null) }}
                        placeholder="Task title..."
                        className="rounded-xl h-10 bg-white/30 dark:bg-black/30 border-white/20 text-sm"
                      />
                      <Button size="sm" onClick={() => addTask(col.key)} className="w-full rounded-xl h-8 text-xs">
                        Add Task
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </DndContext>
        </div>
      </div>
    </div>
  )
}
