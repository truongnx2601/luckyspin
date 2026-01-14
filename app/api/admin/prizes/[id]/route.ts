import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, total, weight, isActive } = await req.json()

  const prize = await prisma.prize.findUnique({
    where: { id: params.id },
  })

  if (!prize) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const newTotal = total ?? prize.total
  const diff = newTotal - prize.total

  const updated = await prisma.prize.update({
    where: { id: params.id },
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
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.prize.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ ok: true })
}
