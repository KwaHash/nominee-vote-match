import Link from 'next/link'
import { FaFilePdf, FaImage, FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import StatusItem from './status-item'
import { Button } from '@/components/ui/button'
import { txTypeLabels } from '@/constants/funds.c'
import { cn } from '@/lib/utils'
import { type Expense, type TxType } from '@/types/funds.d'

const chipBaseClassName = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

const typeChipClassName: Record<TxType, string> = {
  income: 'bg-emerald-100 text-emerald-700',
  expense: 'bg-rose-100 text-rose-700',
}

const dateChipClassName = 'bg-gray-100 text-gray-700'
const counterpartChipClassName = 'bg-violet-100 text-violet-700'
const relatedPartyChipClassName = 'bg-amber-100 text-amber-700'

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`

interface ExpenseItemProps {
  expense: Expense
  handleDelete: (id: string) => void
}

const ExpenseItem = ({ expense, handleDelete }: ExpenseItemProps) => {
  return (
    <div className="w-full flex border-[1px] border-[#ddd]">
      <div className="flex flex-col shrink-0 justify-center items-center w-[70px] border-r-[1px] border-[#ddd]">
        <StatusItem status={expense.is_public ? '公開' : '非公開'} />
      </div>
      <div className="flex flex-col p-5 gap-2">
        <div className="flex items-center flex-wrap gap-2">
          <span className={cn(chipBaseClassName, typeChipClassName[expense.type])}>
            {txTypeLabels[expense.type]}
          </span>
          <h3 className='text-lg font-bold'>{expense.category}</h3>
          <span className={cn(chipBaseClassName, dateChipClassName)}>
            {expense.date.replace(/-/g, '/')}
          </span>
          {expense.is_related_party && (
            <span className={cn(chipBaseClassName, relatedPartyChipClassName)}>関連当事者</span>
          )}
        </div>

        <p className={cn('text-xl font-bold', expense.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
          {expense.type === 'income' ? '+ ' : '− '}{yen(expense.amount)}
        </p>

        {expense.counterpart && (
          <p className='font-bold'>
            <span className={cn(chipBaseClassName, counterpartChipClassName)}>
              {expense.type === 'income' ? '寄付元 / 相手先' : '支出先'}：{expense.counterpart}
            </span>
          </p>
        )}

        {expense.receipt_url && (
          <Link href={expense.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-500 underline-offset-2 hover:underline"
          >
            {expense.receipt_url.toLowerCase().endsWith('.pdf')
              ? <FaFilePdf className="h-4 w-4 text-rose-500" />
              : <FaImage className="h-4 w-4 text-sky-500" />}
            {expense.receipt_name || '証憑'}
          </Link>
        )}
      </div>
      <div className="flex flex-col shrink-0 ml-auto pt-5 pr-3 gap-2 w-[100px]">
        <Link href={`/funds/expenses/${expense.id}`}
          className="flex items-center justify-center py-1.5 rounded-[1px] text-sm bg-m-blue text-white hover:opacity-90 transition-all duration-300"
        >
          <FaPencilAlt className="text-sm mr-1" />
          <span className="text-sm">編集</span>
        </Link>
        <Button onClick={() => handleDelete(expense.id)}
          className="flex items-center justify-center h-auto py-1.5 rounded-[1px] text-sm bg-m-red hover:bg-m-hover-red text-white hover:opacity-90 transition-all duration-300"
        >
          <FaTrashAlt className="text-sm mr-1" />
          <span className="text-sm">削除</span>
        </Button>
      </div>
    </div>
  )
}

export default ExpenseItem
