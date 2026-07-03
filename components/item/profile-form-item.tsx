import { type ReactNode } from 'react'
import { type IconType } from 'react-icons'
import RequiredLabel from '@/components/label/required-label'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ThisProps {
  label: string
  htmlFor: string
  icon?: IconType
  required?: boolean
  error?: string
  className?: string
  children: ReactNode
}

const ProfileFormItem = ({
  label,
  htmlFor,
  icon: Icon,
  required,
  error,
  className,
  children,
}: ThisProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='flex items-center gap-1.5'>
        {Icon && <Icon className='h-4 w-4 shrink-0 text-gray-500' />}
        <Label htmlFor={htmlFor} className='text-sm font-medium text-gray-800'>
          {label}
        </Label>
        {required && <RequiredLabel className='ml-1' />}
      </div>
      {children}
      {error && <p className='text-xs text-m-red'>{error}</p>}
    </div>
  )
}

export default ProfileFormItem
