import Link from 'next/link'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import StatusItem from './status-item'
import { cn } from '@/lib/utils'
import { type Supporter, type SupporterKind } from '@/types/supporter.d'

const chipBaseClassName = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

const kindChipClassName: Record<SupporterKind, string> = {
  個人: 'bg-blue-100 text-blue-700',
  団体: 'bg-amber-100 text-amber-700',
}

const regionChipClassName = 'bg-gray-100 text-gray-700'
const typeChipClassName = 'bg-green-100 text-green-700'
const interestChipClassName = 'bg-violet-100 text-violet-700'

const MAX_LENGTH = 100

// Cap free-text fields, appending an ellipsis when truncated.
const truncate = (value: string) =>
  value.length > MAX_LENGTH ? `${value.slice(0, MAX_LENGTH)}…` : value

interface SupporterItemProps {
  supporter: Supporter
}

const SupporterItem = ({ supporter }: SupporterItemProps) => {
  return (
    <div className="w-full flex border-[1px] border-[#ddd]">
      <div className="flex flex-col shrink-0 justify-center items-center w-[70px] border-r-[1px] border-[#ddd]">
        <StatusItem status={supporter.visibility} />
      </div>
      <div className="flex flex-col p-5 gap-2">
        <div className="flex items-center gap-2">
          <h3 className='text-lg font-bold'>{supporter.name}</h3>
          <span className={cn(chipBaseClassName, kindChipClassName[supporter.kind])}>
            {supporter.kind}
          </span>
          <span className={cn(chipBaseClassName, regionChipClassName)}>{supporter.region || '—'}</span>
        </div>
        {supporter.support_types.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {supporter.support_types.map((type) => (
              <span key={type} className={cn(chipBaseClassName, typeChipClassName)}>{type}</span>
            ))}
          </div>
        )}
        {supporter.interests?.length > 0 && (
          <div className='flex gap-2 mb-2'>
            <div className='flex flex-wrap gap-2'>
              {supporter.interests.map((interest) => (
                <span key={interest} className={cn(chipBaseClassName, interestChipClassName)}>{interest}</span>
              ))}
            </div>
          </div>
        )}
        <div className='flex flex-col gap-1'>
          {supporter.contact_note && (
            <p className="text-sm text-[#EA9B54]">{truncate(supporter.contact_note)}</p>
          )}

          {supporter.next_action && (
            <p className="text-sm text-m-red">{truncate(supporter.next_action)}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col shrink-0 ml-auto pt-5 pr-3 gap-2 w-[100px]">
        <Link href={`/supporters/${supporter.id}`}
          className="flex items-center justify-center py-1.5 rounded-[1px] text-sm bg-m-blue text-white hover:opacity-90 transition-all duration-300"
        >
          <FaPencilAlt className="text-sm mr-1" />
          <span className="text-sm">編集</span>
        </Link>
        <div className="flex items-center justify-center py-1.5 rounded-[1px] text-sm bg-m-red text-white hover:opacity-90 transition-all duration-300">
          <FaTrashAlt className="text-sm mr-1" />
          <span className="text-sm">削除</span>
        </div>
      </div>
    </div>
  )
}

export default SupporterItem
