import * as React from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const navButtonClass = cn(
  buttonVariants({ variant: 'ghost' }),
  'h-7 w-7 p-0 !rounded-full opacity-70 hover:!bg-green-600 hover:!text-white hover:opacity-100'
)

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  navLayout = 'around',
  components,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout={navLayout}
      className={cn('calendar-root p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-4',
        // With navLayout="around" the prev/next buttons are siblings of the caption
        // inside the month; positioning them absolutely at the grid's top corners
        // keeps the header exactly as wide as the day grid (no stretched empty area).
        month: 'relative flex w-fit flex-col items-center gap-4',
        month_caption: 'flex h-9 items-center justify-center pt-1',
        caption_label: 'inline-flex items-center gap-0.5 px-1 py-0.5 text-sm font-medium',
        dropdowns: 'flex items-center justify-center gap-3',
        dropdown_root: 'relative inline-flex items-center',
        dropdown: 'absolute inset-0 z-[1] h-full w-full cursor-pointer opacity-0 text-sm',
        nav: 'flex items-center gap-1',
        button_previous: cn(navButtonClass, 'absolute left-1 top-1'),
        button_next: cn(navButtonClass, 'absolute right-1 top-1'),
        month_grid: 'border-collapse space-y-1',
        weekdays: 'flex [&>th:first-child]:!text-red-600',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        // Colour the Sunday column (first cell of each week) red, like the header.
        week: 'flex mt-2 [&>td:first-child]:!text-red-600',
        // In v9+ the day cell (`day`) is the wrapper and `day_button` is the
        // interactive element. Selection/modifier styles land on the cell, so we
        // reach the button with the `[&>button]` variant to keep the round pill.
        day: 'relative h-9 w-9 p-0 text-center text-sm !rounded-full focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal !rounded-full hover:bg-gray-200 hover:text-gray-900'
        ),
        range_end: 'day-range-end',
        selected:
          '!rounded-full [&>button]:!bg-green-600 [&>button]:!text-white [&>button]:hover:!bg-green-600 [&>button]:hover:!text-white',
        today:
          '!rounded-full [&>button]:bg-gray-200 [&>button]:text-gray-900 [&>button]:hover:bg-gray-200',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-green-600/20 aria-selected:text-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className='h-4 w-4' />
          if (orientation === 'right') return <ChevronRight className='h-4 w-4' />
          return <ChevronDown className='ml-1 h-3 w-3 text-muted-foreground' />
        },
        ...components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
