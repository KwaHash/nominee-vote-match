'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FaPlus, FaXmark } from 'react-icons/fa6'
import { MdOutlineAddTask, MdOutlineChecklist } from 'react-icons/md'
import CampaignDateField from '@/components/campaign-date-field'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { taskCategories, taskFilters, taskStatusMeta } from '@/constants/today-task.c'
import { cn } from '@/lib/utils'
import { updateDeleteDialog } from '@/stores/dialogs/dialogs.slice'
import { useAppDispatch } from '@/stores/store'
import { type Task, type TaskFilter, type TaskForm } from '@/types/today-task.d'

const toFormDate = (value: string | null) => (value ? value.replace(/-/g, '/') : '')

const toForm = (task: Task): TaskForm => ({
  title: task.title,
  category: task.category,
  due_date: toFormDate(task.due_date),
  status: task.status,
})

const TodayTaskPage = () => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>(taskCategories[0])
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get<{ tasks: Task[] }>('/api/today-task')
        setTasks(data.tasks)
      } catch (err) {
        const message = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error ?? 'タスクの取得に失敗しました。' : 'タスクの取得に失敗しました。'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchTasks()
  }, [])

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks])

  const progress = tasks.length ? Math.round((counts.done / tasks.length) * 100) : 0
  const shown = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  const addTask = async () => {
    if (!title.trim() || isSaving) return
    setError('')
    setIsSaving(true)
    try {
      const form: TaskForm = { title: title.trim(), category, due_date: due, status: 'todo' }
      const { data } = await axios.post<{ task: Task }>('/api/today-task', form)
      setTasks((prev) => [data.task, ...prev])
      setTitle('')
      setDue('')
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? 'タスクの登録に失敗しました。' : 'タスクの登録に失敗しました。'
      setError(message)
    }
    setIsSaving(false)
  }

  // Tapping the status badge advances 未着手 → 進行中 → 完了 → 未着手.
  const cycleStatus = async (task: Task) => {
    const next = taskStatusMeta[task.status].next
    setError('')
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)))
    try {
      await axios.put(`/api/today-task/${task.id}`, { ...toForm(task), status: next })
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? 'ステータスの更新に失敗しました。' : 'ステータスの更新に失敗しました。'
      setError(message)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)))
    }
  }

  const handleDelete = (id: string) => {
    dispatch(updateDeleteDialog({
      isOpen: true,
      title: '削除',
      description: 'このタスクを削除しますか？',
      onDelete: async () => {
        setError('')
        try {
          setIsLoading(true)
          await axios.delete(`/api/today-task/${id}`)
          setTasks((prev) => prev.filter((t) => t.id !== id))
        } catch (err) {
          const message = axios.isAxiosError<{ error?: string }>(err)
            ? err.response?.data?.error ?? 'タスクの削除に失敗しました。' : 'タスクの削除に失敗しました。'
          setError(message)
        } finally {
          setIsLoading(false)
        }
      }
    }))
  }

  if (isLoading) return <Loading />

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='タスク管理'
        description='選挙・政策活動のタスクを未着手/進行中/完了で管理します。'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        {error && (
          <p className='mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
        )}

        {/* Overview */}
        <div className='mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4'>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>未着手</p>
            <p className='mt-1 text-xl font-bold text-gray-900'>{counts.todo}件</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>進行中</p>
            <p className='mt-1 text-xl font-bold text-amber-600'>{counts.doing}件</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>完了</p>
            <p className='mt-1 text-xl font-bold text-emerald-600'>{counts.done}件</p>
          </div>
        </div>

        {/* Progress */}
        <div className='mb-8 rounded-lg border border-gray-200 bg-white p-4'>
          <div className='mb-2 flex items-center justify-between text-sm'>
            <span className='font-medium text-gray-700'>完了 {counts.done} / {tasks.length} 件</span>
            <span className='font-bold text-green-700'>{progress}%</span>
          </div>
          <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
            <div className='h-full rounded-full bg-green-600 transition-all duration-300' style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Add task */}
        <div className='mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
            <MdOutlineAddTask className='h-5 w-5' />
            <h2 className='text-base font-bold'>タスクを追加</h2>
          </div>
          <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-4'>
            <div className='flex flex-col gap-2 md:col-span-2'>
              <Label htmlFor='task-title' className='text-sm font-medium text-gray-800'>タスク名</Label>
              <Input
                id='task-title'
                value={title}
                placeholder='例: ポスター掲示の手配'
                className='rounded-none'
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void addTask()
                  }
                }}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label className='text-sm font-medium text-gray-800'>分類</Label>
              <Select value={category} onValueChange={(value) => value && setCategory(value)}>
                <SelectTrigger className='rounded-none'>
                  <SelectValue placeholder='分類を選択' />
                </SelectTrigger>
                <SelectContent>
                  {taskCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <Label htmlFor='task-due' className='text-sm font-medium text-gray-800'>期限（任意）</Label>
              <CampaignDateField id='task-due' value={due} onChange={setDue} />
            </div>

            <div className='md:col-span-4'>
              <Button
                type='button'
                onClick={() => void addTask()}
                disabled={isSaving || title.trim() === ''}
                className='w-full gap-1.5 rounded bg-m-blue hover:bg-m-hover-blue transition-all duration-300 md:w-fit md:px-8'
              >
                <FaPlus className='h-3.5 w-3.5' />
                <span>{isSaving ? '追加中...' : 'タスクを追加'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className='mb-4 flex flex-col gap-2'>
          <Label className='text-sm font-medium text-gray-800'>表示するステータス</Label>
          <ToggleGroup
            type='single'
            value={filter}
            onValueChange={(value) => value && setFilter(value as TaskFilter)}
            className='flex-wrap justify-start gap-2'
          >
            {taskFilters.map((option) => (
              <ToggleGroupItem
                key={option}
                value={option}
                variant='outline'
                size='sm'
                className='px-3 rounded-full data-[state=on]:bg-green-600 data-[state=on]:text-white hover:bg-gray-400 hover:text-white transition-colors duration-300'
              >
                {option === 'all' ? 'すべて' : taskStatusMeta[option].label}（{counts[option]}）
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Task list */}
        {shown.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {shown.map((task) => (
              <div key={task.id} className='flex w-full items-center gap-3 border-[1px] border-[#ddd] p-3'>
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  onClick={() => void cycleStatus(task)}
                  className={cn(
                    'shrink-0 h-auto rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300',
                    taskStatusMeta[task.status].chipClassName
                  )}
                >
                  {taskStatusMeta[task.status].label}
                </Button>

                <div className='min-w-0 flex-1'>
                  <p className={cn(
                    'text-sm font-medium',
                    task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'
                  )}>
                    {task.title}
                  </p>
                  <p className='mt-0.5 text-xs text-gray-400'>
                    {task.category}{task.due_date ? ` ・ 期限 ${toFormDate(task.due_date)}` : ''}
                  </p>
                </div>

                <Button
                  type='button'
                  size='icon'
                  variant='ghost'
                  onClick={() => handleDelete(task.id)}
                  aria-label='タスクを削除'
                  className='shrink-0 w-auto h-auto p-2 rounded-full text-gray-400 hover:bg-transparent hover:text-m-red transform duration-300'
                >
                  <FaXmark className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className='bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 rounded'>
            {tasks.length === 0 ? 'タスクがありません。' : 'このステータスのタスクはありません。'}
          </p>
        )}

        <p className='mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400'>
          <MdOutlineChecklist className='h-4 w-4' />
          ステータスのバッジを押すと、未着手 → 進行中 → 完了 と切り替わります。
        </p>
      </section>
    </div>
  )
}

export default TodayTaskPage
