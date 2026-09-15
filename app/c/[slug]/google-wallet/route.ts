import { NextRequest, NextResponse } from 'next/server';
import { generateGoogleWalletJWT, isGoogleWalletConfigured } from '@/lib/google-wallet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {
    if (!isGoogleWalletConfigured()) {
      return NextResponse.json(
        { error: 'Google Wallet is not configured' },
        { status: 503 }
      );
    }

    const passData = {
      name: 'DRK Mitglied',
      title: 'Deutsches Rotes Kreuz',
      email: 'contact@drk.de',
      phone: '+49 241 123456',
    };

    const isOwner = true;
    const jwt = generateGoogleWalletJWT(slug, passData, isOwner);

    return NextResponse.json({ jwt });
  } catch (error) {
    console.error('Google Wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Google Wallet JWT' },
      { status: 500 }
    );
  }
}