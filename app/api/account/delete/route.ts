import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deletePhoto, deleteUserPhotos } from '@/lib/storage'

/**
 * POST /api/account/delete
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Implements DSGVO Art. 17 "Recht auf Löschung" (right to erasure).
 *
 * Deletion order:
 * 1. Fetch user's cards to find photo paths
 * 2. Delete photos from S3/Garage
 * 3. Delete the user (cascades to cards, accounts, sessions via FK)
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 },
      )
    }

    const userId = session.user.id

    const cards = await prisma.card.findMany({
      where: { user_id: userId },
      select: { photo_path: true },
    })

    const photoPaths = cards
      .map((c) => c.photo_path)
      .filter((p): p is string => !!p)

    for (const path of photoPaths) {
      try {
        await deletePhoto(path)
      } catch (err) {
        console.error(`Failed to delete photo ${path}:`, err)
      }
    }

    try {
      await deleteUserPhotos(userId)
    } catch (err) {
      console.error('Failed to clean up user photo folder:', err)
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 },
    )
  }
}
