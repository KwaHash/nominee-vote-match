export type TaskStatus = 'todo' | 'doing' | 'done'

export type TaskFilter = 'all' | TaskStatus

export interface TaskStatusMeta {
  label: string
  chipClassName: string
  next: TaskStatus
}

export interface TaskForm {
  title: string
  category: string
  due_date: string
  status: TaskStatus
}

export interface Task {
  id: string
  candidate_id: string
  title: string
  category: string
  due_date: string | null
  status: TaskStatus
  created_at: string
  updated_at: string
}
