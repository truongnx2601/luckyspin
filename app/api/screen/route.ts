import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  /* ===== LƯỢT QUAY MỚI NHẤT ===== */
  const latestSpin = await prisma.spinResult.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      voucher: {
        include: {
          employee: true,
        },
      },
      prize: true,
    },
  })

  const latest = latestSpin
    ? {
        employeeCode: latestSpin.voucher.employee.employeeCode,
        fullName: latestSpin.voucher.employee.fullName,
        center: latestSpin.voucher.employee.center,
        voucherCode: latestSpin.voucher.code,
        prizeName: latestSpin.prize.name,
        createdAt: latestSpin.createdAt,
      }
    : null

  /* ===== THỐNG KÊ GIẢI THƯỞNG ===== */
  const prizes = await prisma.prize.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      name: true,
      total: true,
      remaining: true,
    },
  })

  const stats = prizes.map(
  (p: { name: string; total: number; remaining: number }) => ({
    prizeName: p.name,
    total: p.total,
    remaining: p.remaining,
    used: p.total - p.remaining,
  })
)

  return NextResponse.json({
    latest,
    stats,
  })
}
