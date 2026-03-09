import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { CardRow } from '@/lib/supabase/types'
import CardForm from '@/components/editor/CardForm'

export const metadata = {
  title: 'Visitenkarte bearbeiten',
}

/**
 * Editor page: fetches the user's existing card (if any) from Supabase
 * and renders the CardForm for create or update.
 * User ID comes from middleware header (already validated with getUser()).
 */
export default async function EditPage() {
  const headerStore = await headers()
  const userId = headerStore.get('x-user-id')
  if (!userId) redirect('/login')

  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const card = data as CardRow | null

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {card ? 'Visitenkarte bearbeiten' : 'Neue Visitenkarte erstellen'}
      </h1>
      <p style={{ color: '#525252', marginBottom: '2rem', fontSize: '0.875rem' }}>
        {card
          ? 'Ändern Sie Ihre Kontaktdaten und speichern Sie die Änderungen.'
          : 'Füllen Sie Ihre Kontaktdaten aus, um Ihre digitale Visitenkarte zu erstellen.'}
      </p>
      <CardForm existingCard={card} userId={userId} />
    </div>
  )
}
