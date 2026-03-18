import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/cards – Creates a new card for the authenticated user.
 * PATCH /api/cards – Updates an existing card owned by the authenticated user.
 */

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const body = await request.json()

  try {
    const card = await prisma.card.create({
      data: {
        ...body,
        user_id: session.user.id,
      },
    })

    return NextResponse.json(card)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2002') {
      return NextResponse.json(
        { error: 'Dieser URL-Slug ist bereits vergeben.' },
        { status: 409 },
      )
    }
    console.error('Card creation error:', err)
    return NextResponse.json(
      { error: 'Visitenkarte konnte nicht erstellt werden.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: 'Karten-ID fehlt.' }, { status: 400 })
  }

  const existing = await prisma.card.findFirst({
    where: { id, user_id: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Karte nicht gefunden.' }, { status: 404 })
  }

  try {
    const updated = await prisma.card.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (err: unknown) {
    const prismaErr = err as { code?: string }
    if (prismaErr.code === 'P2002') {
      return NextResponse.json(
        { error: 'Dieser URL-Slug ist bereits vergeben.' },
        { status: 409 },
      )
    }
    console.error('Card update error:', err)
    return NextResponse.json(
      { error: 'Visitenkarte konnte nicht aktualisiert werden.' },
      { status: 500 },
    )
  }
}
