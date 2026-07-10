import { format, isValid, parse } from 'date-fns'

export const EXPENSE_DATE_FORMAT = 'yyyy/MM/dd'
export const EXPENSE_DATE_FROM_YEAR = new Date().getFullYear() - 10
export const EXPENSE_DATE_TO_YEAR = new Date().getFullYear()

export function parseExpenseDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, EXPENSE_DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

export function formatExpenseDate(date: Date): string {
  return format(date, EXPENSE_DATE_FORMAT)
}

/* Receipt upload */
export const MAX_EXPENSE_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024
export const EXPENSE_RECEIPT_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,application/pdf'
export const EXPENSE_RECEIPT_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}
