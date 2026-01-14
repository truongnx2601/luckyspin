import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await prisma.$transaction([
      // 1. Reset voucher
      prisma.voucher.updateMany({
        data: {
          isUsed: false,
          usedAt: null,
        },
      }),

      // 2. Reset số lượng giải về total
      prisma.prize.updateMany({
        data: {
          remaining: prisma.prize.fields.total,
        },
      }),

      // 3. Xoá lịch sử quay
      prisma.spinResult.deleteMany(),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Reset thất bại' },
      { status: 500 }
    )
  }
}
