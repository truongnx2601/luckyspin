import { prisma } from '@/lib/prisma'
import { weightedRandom } from '@/lib/random'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

type PrizeSpin = {
  id: string
  name: string
  weight: number
  remaining: number
}

export async function POST(req: Request) {
  const { code } = await req.json()

  const voucher = await prisma.voucher.findUnique({
    where: { code },
    include: { campaign: true },
  })

  if (!voucher || voucher.isUsed || !voucher.campaign.isActive) {
    return NextResponse.json(
      { error: 'Voucher không hợp lệ' },
      { status: 400 }
    )
  }

  try {
    const prizeName = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const prizes = (await tx.prize.findMany({
        where: {
          campaignId: voucher.campaignId,
          remaining: { gt: 0 },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          weight: true,
          remaining: true,
        },
      })) as PrizeSpin[]

      if (!prizes.length) {
        throw new Error('NO_PRIZE')
      }

      const prize = weightedRandom(prizes)

      const updated = await tx.prize.updateMany({
        where: {
          id: prize.id,
          remaining: { gt: 0 },
        },
        data: {
          remaining: { decrement: 1 },
        },
      })

      if (updated.count === 0) {
        throw new Error('RETRY')
      }

      await tx.voucher.update({
        where: { id: voucher.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      })

      await tx.spinResult.create({
        data: {
          voucherId: voucher.id,
          prizeId: prize.id,
          prizeName: prize.name,
        },
      })

      return prize.name
    })

    return NextResponse.json({ prize: prizeName })
  } catch (err: any) {
    if (err.message === 'NO_PRIZE') {
      return NextResponse.json({ error: 'Hết giải' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Có người quay cùng lúc, vui lòng thử lại' },
      { status: 409 }
    )
  }
}
