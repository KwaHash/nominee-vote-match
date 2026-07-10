import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse, type NextRequest } from 'next/server'
import { EXPENSE_RECEIPT_MIME_EXT, MAX_EXPENSE_RECEIPT_SIZE_BYTES } from '@/utils/funds.u'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const FILES_DIR = path.join(process.cwd(), 'public', 'files')

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
        { error: 'ファイルを選択してください。' },
        { status: 400 }
      )
    }

    const ext = EXPENSE_RECEIPT_MIME_EXT[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'JPEG、PNG、WebP、GIF、PDF形式のファイルを選択してください。' },
        { status: 400 }
      )
    }
    if (file.size > MAX_EXPENSE_RECEIPT_SIZE_BYTES) {
      return NextResponse.json(
        { error: '10MB以下のファイルを選択してください。' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${randomUUID()}.${ext}`
    await mkdir(FILES_DIR, { recursive: true })
    await writeFile(path.join(FILES_DIR, fileName), buffer)

    return NextResponse.json({ path: `/files/${fileName}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}
