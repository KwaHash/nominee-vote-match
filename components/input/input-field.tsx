'use client'

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ThisFCProps<TFieldValues extends FieldValues> {
  id: Path<TFieldValues>;
  value?: string;
  placeholder?: string;
  isPassword?: boolean;
  className?: string;
  disabled?: boolean;
  control?: Control<TFieldValues>;
}

const InputField = <TFieldValues extends FieldValues>({
  id,
  placeholder,
  isPassword = false,
  value = '',
  className,
  disabled,
  control,
}: ThisFCProps<TFieldValues>) => {
  return (
    <Controller
      name={id}
      control={control}
      defaultValue={value as never}
      render={({ field }) => (
        <Input
          {...field}
          id={id}
          disabled={disabled}
          className={cn('rounded-none focus-visible:ring-[#777] focus-visible:ring-offset-0', className)}
          placeholder={placeholder}
          type={isPassword === false ? 'text' : 'password'}
        />
      )}
    />
  )
}

export default InputField
