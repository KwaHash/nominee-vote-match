import SupporterEditPage from '@/features/main/supporters/supporter-edit'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <SupporterEditPage id={params.id} />
  )
}
