import FundsExpensesEditPage from '@/features/main/funds/expenses-edit'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <FundsExpensesEditPage id={params.id} />
  )
}
