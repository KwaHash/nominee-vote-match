import Link from 'next/link'
import { FaArrowRightLong } from 'react-icons/fa6'
import { MdOutlineGavel } from 'react-icons/md'
import MainHero from '@/components/main-hero'
import { menuGroups } from '@/constants/main-home.c'
import { cn } from '@/lib/utils'
import { type MenuAccent } from '@/types/main-home.d'

const accentClassName: Record<MenuAccent, { badge: string; item: string; arrow: string }> = {
  blue: {
    badge: 'bg-blue-50 text-m-blue',
    item: 'hover:border-blue-200 hover:bg-blue-50/60',
    arrow: 'group-hover/item:text-m-blue',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-600',
    item: 'hover:border-emerald-200 hover:bg-emerald-50/60',
    arrow: 'group-hover/item:text-emerald-600',
  },
  sky: {
    badge: 'bg-sky-50 text-sky-600',
    item: 'hover:border-sky-200 hover:bg-sky-50/60',
    arrow: 'group-hover/item:text-sky-600',
  },
  violet: {
    badge: 'bg-violet-50 text-violet-600',
    item: 'hover:border-violet-200 hover:bg-violet-50/60',
    arrow: 'group-hover/item:text-violet-600',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-600',
    item: 'hover:border-amber-200 hover:bg-amber-50/60',
    arrow: 'group-hover/item:text-amber-600',
  },
}

const MainHomePage = () => {
  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='政治活動を、ひとつの画面で。'
        description={
          <>
            政策づくり・発信・支援者管理・資金報告まで。<br />
            あなたの毎日を支える、AI司令塔です。
          </>
        }
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <div className='grid gap-6 md:grid-cols-2'>
          {menuGroups.map((group) => {
            const accent = accentClassName[group.accent]
            const GroupIcon = group.icon
            return (
              <div key={group.title}
                className='flex flex-col rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-300 shadow-md hover:shadow-lg'
              >
                <div className='flex items-center gap-3'>
                  <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', accent.badge)}>
                    <GroupIcon className='h-6 w-6' />
                  </span>
                  <div>
                    <h2 className='text-lg font-bold text-gray-900'>{group.title}</h2>
                    <p className='text-sm text-gray-500'>{group.lead}</p>
                  </div>
                </div>

                <div className='mt-5 flex flex-1 flex-col gap-2'>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        className={cn(
                          'group/item flex items-center gap-3 rounded border border-gray-200 p-3 transition-all duration-300',
                          accent.item
                        )}
                      >
                        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', accent.badge)}>
                          <ItemIcon className='h-4 w-4' />
                        </span>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-bold text-gray-900'>{item.label}</p>
                          <p className='mt-0.5 text-xs leading-relaxed text-gray-500'>{item.note}</p>
                        </div>
                        <FaArrowRightLong
                          className={cn(
                            'h-4 w-4 shrink-0 text-gray-300 transition-all duration-300 group-hover/item:translate-x-1',
                            accent.arrow
                          )}
                        />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Compliance */}
        <div className='mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6'>
          <div className='flex items-start gap-3'>
            <MdOutlineGavel className='h-5 w-5 shrink-0 text-amber-600' />
            <div className='text-xs leading-relaxed text-amber-800'>
              <p className='font-bold'>コンプライアンスに関するご案内</p>
              <p className='mt-1'>
                本サービスは政治活動・選挙運動・献金管理を支援します。公開・送信・献金募集・収支報告にあたっては、
                政治資金規正法・公職選挙法および各選挙管理委員会のルールを必ずご確認ください。
                外国人・匿名・借名による寄付は禁止されており、AIが作成したメールでの選挙運動もできません。
              </p>
            </div>
          </div>
        </div>

        <p className='mt-6 text-center text-xs text-gray-400'>
          AIは「下書き → 確認 → 編集 → 公開／送信」。AIが勝手に公開・送信することはありません。
        </p>
      </section>
    </div>
  )
}

export default MainHomePage
