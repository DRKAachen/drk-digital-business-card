import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/account/delete
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Implements DSGVO Art. 17 "Recht auf Löschung" (right to erasure).
 *
 * Deletion order:
 * 1. Fetch user's cards to find photo paths
 * 2. Delete photos from Supabase Storage
 * 3. Delete the auth user (cascades to delete cards via FK constraint)
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert.' },
        { status: 401 },
      )
    }

    const adminClient = createAdminClient()

    const { data: cards } = await adminClient
      .from('cards')
      .select('photo_path')
      .eq('user_id', user.id)

    if (cards && cards.length > 0) {
      const photoPaths = cards
        .map((c) => c.photo_path)
        .filter((p): p is string => !!p)

      if (photoPaths.length > 0) {
        await adminClient.storage.from('photos').remove(photoPaths)
      }
    }

    // Delete all files in the user's storage folder (catches orphaned uploads)
    const { data: userFiles } = await adminClient.storage
      .from('photos')
      .list(user.id)

    if (userFiles && userFiles.length > 0) {
      const filePaths = userFiles.map((f) => `${user.id}/${f.name}`)
      await adminClient.storage.from('photos').remove(filePaths)
    }

    // Delete the auth user -- cascades to delete all cards (FK: on delete cascade)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Account deletion failed:', deleteError.message)
      return NextResponse.json(
        { error: 'Konto konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account deletion error:', err)
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 },
    )
  }
}
