import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

type RouteCtx = {
  params: Promise<{ id: string }>
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteCtx
) {
  const { id } = await params
  const { name, total, weight, isActive } = await req.json()

  const prize = await prisma.prize.findUnique({
    where: { id },
  })

  if (!prize) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const newTotal = total ?? prize.total
  const diff = newTotal - prize.total

  const updated = await prisma.prize.update({
    where: { id },
    data: {
      name,
      total: newTotal,
      remaining: prize.remaining + diff,
      weight,
      isActive,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteCtx
) {
  const { id } = await params

  await prisma.prize.delete({
    where: { id },
  })

  return NextResponse.json({ ok: true })
}
