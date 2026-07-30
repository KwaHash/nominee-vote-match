'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  CAMPAIGN_DATE_FORMAT, CAMPAIGN_DATE_FROM_YEAR, CAMPAIGN_DATE_TO_YEAR,
  formatCampaignDate, parseCampaignDate,
} from '@/utils/crowdfunding.u'

interface CampaignDateFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: (date: Date) => boolean
}

// Campaign period picker: keeps values as yyyy/MM/dd strings.
const CampaignDateField = ({ id, value, onChange, disabled }: CampaignDateFieldProps) => {
  const selectedDate = parseCampaignDate(value)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          id={id}
          className={cn('h-10 w-full justify-start rounded text-left font-normal', !value && 'text-muted-foreground')}
        >
          {selectedDate ? format(selectedDate, CAMPAIGN_DATE_FORMAT, { locale: ja }) : '日付を選択'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          startMonth={new Date(CAMPAIGN_DATE_FROM_YEAR, 0)}
          endMonth={new Date(CAMPAIGN_DATE_TO_YEAR, 11)}
          selected={selectedDate}
          onSelect={(date) => onChange(date ? formatCampaignDate(date) : '')}
          disabled={disabled}
          defaultMonth={selectedDate}
          locale={ja}
          formatters={{
            formatMonthDropdown: (month) => format(month, 'M月', { locale: ja }),
            formatYearDropdown: (year) => format(year, 'yyyy年', { locale: ja }),
          }}
          labels={{
            labelMonthDropdown: () => '月を選択',
            labelYearDropdown: () => '年を選択',
            labelPrevious: () => '前の月',
            labelNext: () => '次の月',
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default CampaignDateField
