import CrowdfundingEditPage from '@/features/main/funds/crowdfunding-edit'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <CrowdfundingEditPage id={params.id} />
  )
}
