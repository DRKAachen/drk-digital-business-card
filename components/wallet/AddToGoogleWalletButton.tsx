'use client';

import { useEffect, useState } from 'react';
import styles from './AddToGoogleWalletButton.module.scss';

interface AddToGoogleWalletButtonProps {
  cardSlug: string;
  alwaysShow?: boolean;
}

export function AddToGoogleWalletButton({
  cardSlug,
  alwaysShow = false,
}: AddToGoogleWalletButtonProps) {
  const [isAndroid, setIsAndroid] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent) || alwaysShow);
    fetchJWT();
  }, [cardSlug, alwaysShow]);

  const fetchJWT = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/c/${cardSlug}/google-wallet`);
      const data = await response.json();
      if (data.jwt) {
        setJwt(data.jwt);
      }
    } catch (error) {
      console.error('Failed to fetch Google Wallet JWT:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAndroid) {
    return null;
  }

  const addToWalletUrl = jwt ? `https://pay.google.com/gp/v/save/${jwt}` : null;

  return (
    <div className={styles.container}>
      {addToWalletUrl ? (
        <a href={addToWalletUrl} className={styles.button} target="_blank" rel="noopener noreferrer">
          <img src="https://pay.google.com/about/static/images/brand/wallet_save_button.png" alt="Save to Google Wallet" className={styles.image} />
        </a>
      ) : (
        <button className={styles.button} disabled>
          <img src="https://pay.google.com/about/static/images/brand/wallet_save_button.png" alt="Save to Google Wallet" className={styles.image} />
        </button>
      )}
    </div>
  );
}