'use client'

import { useMemo } from 'react'
import { FaAngleLeft, FaAngleRight, FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6'
import { cn } from '@/lib/utils'

interface PaginationItemProps {
  totalPages: number
  currentPage: number
  setCurrentPage: (page: number) => void
}

const cellClassName = 'flex h-10 w-10 items-center justify-center border border-gray-200 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-40'

// Build a windowed list of page indices around the current page, with gaps.
const buildPages = (current: number, total: number): (number | 'ellipsis')[] => {
  const pages: (number | 'ellipsis')[] = []
  for (let i = 0; i < total; i++) {
    const withinWindow = i >= current - 1 && i <= current + 1
    if (i === 0 || i === total - 1 || withinWindow) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis')
    }
  }
  return pages
}

const PaginationItem = ({ totalPages, currentPage, setCurrentPage }: PaginationItemProps) => {
  const pages = useMemo(() => buildPages(currentPage, totalPages), [currentPage, totalPages])

  if (totalPages < 1) return null

  const goTo = (page: number) => setCurrentPage(Math.min(Math.max(page, 0), totalPages - 1))

  return (
    <div className='mx-auto flex items-center'>
      <button
        type='button'
        aria-label='最初のページ'
        className={cn(cellClassName, 'rounded-l text-green-700 hover:bg-green-50')}
        disabled={currentPage === 0}
        onClick={() => goTo(0)}
      >
        <FaAnglesLeft className='h-3.5 w-3.5' />
      </button>
      <button
        type='button'
        aria-label='前のページ'
        className={cn(cellClassName, '-ml-px text-green-700 hover:bg-green-50')}
        disabled={currentPage === 0}
        onClick={() => goTo(currentPage - 1)}
      >
        <FaAngleLeft className='h-3.5 w-3.5' />
      </button>

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className={cn(cellClassName, '-ml-px text-gray-400')}>
            …
          </span>
        ) : (
          <button
            key={page}
            type='button'
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              cellClassName,
              '-ml-px',
              page === currentPage
                ? 'z-10 border-green-600 bg-green-600 font-medium text-white'
                : 'text-green-700 hover:bg-green-50',
            )}
            onClick={() => goTo(page)}
          >
            {page + 1}
          </button>
        ),
      )}

      <button
        type='button'
        aria-label='次のページ'
        className={cn(cellClassName, '-ml-px text-green-700 hover:bg-green-50')}
        disabled={currentPage >= totalPages - 1}
        onClick={() => goTo(currentPage + 1)}
      >
        <FaAngleRight className='h-3.5 w-3.5' />
      </button>
      <button
        type='button'
        aria-label='最後のページ'
        className={cn(cellClassName, '-ml-px rounded-r text-green-700 hover:bg-green-50')}
        disabled={currentPage >= totalPages - 1}
        onClick={() => goTo(totalPages - 1)}
      >
        <FaAnglesRight className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}

export default PaginationItem
