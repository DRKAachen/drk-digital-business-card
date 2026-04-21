import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { CardRow } from '@/lib/types'
import CardForm from '@/components/editor/CardForm'

export const metadata = {
  title: 'Visitenkarte bearbeiten',
}

/**
 * Editor page: fetches the user's existing card (if any) from the database
 * and renders the CardForm for create or update.
 */
export default async function EditPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const card: CardRow | null = await prisma.card.findFirst({
    where: { user_id: session.user.id },
  })

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
      <CardForm existingCard={card} />
    </div>
  )
}
