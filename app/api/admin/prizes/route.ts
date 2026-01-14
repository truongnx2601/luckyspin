import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/* ===== CREATE PRIZE ===== */
export async function POST(req: Request) {
  const body = await req.json()
  const campaignId = String(body.campaignId || '')
  const name = String(body.name || '')
  const total = Number(body.total)
  const weight = Number(body.weight)

  if (
    !campaignId ||
    !name.trim() ||
    !Number.isInteger(total) ||
    total <= 0 ||
    !Number.isInteger(weight) ||
    weight <= 0
  ) {
    return NextResponse.json(
      { error: 'INVALID_INPUT' },
      { status: 400 }
    )
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    return NextResponse.json(
      { error: 'CAMPAIGN_NOT_FOUND' },
      { status: 404 }
    )
  }

  const prize = await prisma.prize.create({
    data: {
      campaignId,
      name,
      total,
      remaining: total,
      weight,
      isActive: true,
    },
  })

  return NextResponse.json(prize)
}

/* ===== LIST PRIZES ===== */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaignId')

  if (!campaignId) {
    return NextResponse.json(
      { error: 'MISSING_CAMPAIGN_ID' },
      { status: 400 }
    )
  }

  const prizes = await prisma.prize.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(prizes)
}
