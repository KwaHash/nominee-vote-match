import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse, type NextRequest } from 'next/server'
import { MAX_PROFILE_AVATAR_SIZE_BYTES, PROFILE_AVATAR_MIME_EXT } from '@/utils/profile.u'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const AVATARS_DIR = path.join(process.cwd(), 'public', 'avatars')

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: '画像ファイルを選択してください。' },
        { status: 400 }
      )
    }

    const ext = PROFILE_AVATAR_MIME_EXT[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'JPEG、PNG、WebP、GIF形式の画像を選択してください。' },
        { status: 400 }
      )
    }
    if (file.size > MAX_PROFILE_AVATAR_SIZE_BYTES) {
      return NextResponse.json(
        { error: '2MB以下の画像を選択してください。' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${randomUUID()}.${ext}`
    await mkdir(AVATARS_DIR, { recursive: true })
    await writeFile(path.join(AVATARS_DIR, fileName), buffer)

    return NextResponse.json({ path: `/avatars/${fileName}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
