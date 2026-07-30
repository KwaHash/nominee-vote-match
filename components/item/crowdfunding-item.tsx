import Link from 'next/link'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import StatusItem from './status-item'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type Crowdfunding, type CrowdfundingLegalStatus } from '@/types/crowdfunding.d'

const chipBaseClassName = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

const legalChipClassName: Record<CrowdfundingLegalStatus, string> = {
  未確認: 'bg-gray-100 text-gray-700',
  確認中: 'bg-amber-100 text-amber-700',
  承認済み: 'bg-emerald-100 text-emerald-700',
}

const themeChipClassName = 'bg-violet-100 text-violet-700'
const regionChipClassName = 'bg-gray-100 text-gray-700'
const periodChipClassName = 'bg-blue-100 text-blue-700'
const supportTypeChipClassName = 'bg-green-100 text-green-700'

const MAX_LENGTH = 100

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`

// Cap free-text fields, appending an ellipsis when truncated.
const truncate = (value: string) =>
  value.length > MAX_LENGTH ? `${value.slice(0, MAX_LENGTH)}…` : value

// Date columns come back as yyyy-MM-dd; the app displays yyyy/MM/dd.
const displayDate = (value: string | null) => (value ? value.replace(/-/g, '/') : '')

interface CrowdfundingItemProps {
  project: Crowdfunding
  handleDelete: (id: string) => void
}

const CrowdfundingItem = ({ project, handleDelete }: CrowdfundingItemProps) => {
  const period = [displayDate(project.start_date), displayDate(project.end_date)].filter(Boolean).join(' 〜 ')
  const region = [project.region_level, project.region_name].filter(Boolean).join(' / ')
  const planTotal = project.expense_plan.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="w-full flex border-[1px] border-[#ddd]">
      <div className="flex flex-col shrink-0 justify-center items-center w-[70px] border-r-[1px] border-[#ddd]">
        <StatusItem status={project.visibility} />
      </div>
      <div className="flex flex-col p-5 gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className='text-lg font-bold'>{project.title}</h3>
          <span className={cn(chipBaseClassName, legalChipClassName[project.legal_status])}>
            {project.legal_status}
          </span>
        </div>

        <div className='flex items-center flex-wrap gap-2'>
          <span className={cn(chipBaseClassName, themeChipClassName)}>{project.theme_id}</span>
          <span className={cn(chipBaseClassName, regionChipClassName)}>{region}</span>
          {period && <span className={cn(chipBaseClassName, periodChipClassName)}>{period}</span>}
        </div>

        <p className='text-xl font-bold text-m-blue'>
          目標 {yen(project.goal)}
          {project.expense_plan.length > 0 && (
            <span className='ml-2 text-sm font-medium text-gray-500'>
              支出計画 {project.expense_plan.length}件 / {yen(planTotal)}
            </span>
          )}
        </p>

        {project.support_types.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {project.support_types.map((type) => (
              <span key={type} className={cn(chipBaseClassName, supportTypeChipClassName)}>{type}</span>
            ))}
          </div>
        )}

        {project.outcome && (
          <p className='text-sm text-gray-600'>{truncate(project.outcome)}</p>
        )}
      </div>
      <div className="flex flex-col shrink-0 ml-auto pt-5 pr-3 gap-2 w-[100px]">
        <Link href={`/funds/crowdfunding/${project.id}`}
          className="flex items-center justify-center py-1.5 rounded-[1px] text-sm bg-m-blue text-white hover:opacity-90 transition-all duration-300"
        >
          <FaPencilAlt className="text-sm mr-1" />
          <span className="text-sm">編集</span>
        </Link>
        <Button onClick={() => handleDelete(project.id)}
          className="flex items-center justify-center h-auto py-1.5 rounded-[1px] text-sm bg-m-red hover:bg-m-hover-red text-white hover:opacity-90 transition-all duration-300"
        >
          <FaTrashAlt className="text-sm mr-1" />
          <span className="text-sm">削除</span>
        </Button>
      </div>
    </div>
  )
}

export default CrowdfundingItem
