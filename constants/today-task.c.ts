import { type TaskFilter, type TaskStatus, type TaskStatusMeta } from '@/types/today-task.d'

export const taskCategories = [
  '告示準備', '広報', '街頭活動', '事務所', 'SNS', '政策', 'その他',
] as const

export const taskStatuses: TaskStatus[] = ['todo', 'doing', 'done']

export const taskFilters: TaskFilter[] = ['all', 'todo', 'doing', 'done']

// Tapping the badge cycles 未着手 → 進行中 → 完了 → 未着手.
export const taskStatusMeta: Record<TaskStatus, TaskStatusMeta> = {
  todo: { label: '未着手', chipClassName: 'bg-gray-100 text-gray-600 hover:bg-gray-200', next: 'doing' },
  doing: { label: '進行中', chipClassName: 'bg-amber-100 text-amber-700 hover:bg-amber-200', next: 'done' },
  done: { label: '完了', chipClassName: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', next: 'todo' },
}
