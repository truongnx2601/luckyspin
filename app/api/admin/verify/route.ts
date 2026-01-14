import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const admin = await prisma.adminUser.findUnique({
    where: { username },
  })

  if (!admin) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const rawPassword = password.trim()
  const ok = await bcrypt.compare(rawPassword, admin.password)

  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
