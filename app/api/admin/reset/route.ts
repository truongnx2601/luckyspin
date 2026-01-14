import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Reset voucher
      await tx.voucher.updateMany({
        data: {
          isUsed: false,
          usedAt: null,
        },
      })

      await tx.$executeRaw`
        UPDATE "Prize"
        SET "remaining" = "total"
      `

      await tx.spinResult.deleteMany()
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Reset thất bại' },
      { status: 500 }
    )
  }
}
