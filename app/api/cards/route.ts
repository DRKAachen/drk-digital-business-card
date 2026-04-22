import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deletePhoto } from '@/lib/storage'

/**
 * POST /api/cards – Creates a new card for the authenticated user.
 * PATCH /api/cards – Updates an existing card owned by the authenticated user.
 * DELETE /api/cards – Deletes a card and its associated photo from storage.
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

    if (
      typeof data.photo_path === 'string' &&
      existing.photo_path &&
      data.photo_path !== existing.photo_path
    ) {
      await deletePhoto(existing.photo_path)
    }

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

/**
 * Deletes the card identified by `id` in the JSON body, along with its photo
 * from S3 storage. Only the owning user may delete their card.
 */
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
  }

  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Karten-ID fehlt.' }, { status: 400 })
  }

  const card = await prisma.card.findFirst({
    where: { id, user_id: session.user.id },
  })

  if (!card) {
    return NextResponse.json({ error: 'Karte nicht gefunden.' }, { status: 404 })
  }

  try {
    if (card.photo_path) {
      await deletePhoto(card.photo_path)
    }

    await prisma.card.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Card deletion error:', err)
    return NextResponse.json(
      { error: 'Visitenkarte konnte nicht gelöscht werden.' },
      { status: 500 },
    )
  }
}
