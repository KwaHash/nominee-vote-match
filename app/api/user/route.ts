import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUser } from '@/utils/supabase/user'

export async function GET() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが指定されていません' }, { status: 400 })
    }

    return NextResponse.json(
      { user: {
          user_id: user.id,
          user_name: user.user_metadata.display_name as string,
          user_email: user.email,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('ユーザー情報変更エラー: ', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ユーザー情報変更に失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'ユーザーが指定されていません' }, { status: 400 })
    }
    
    // Use supabase.auth to update the currently logged-in user
    const supabaseClient = createClient()
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { is_onboarded: true },
    })

    if (error) throw error

    return NextResponse.json({ user: data.user }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ユーザー情報変更に失敗しました' },
      { status: 500 }
    )
  }
}
