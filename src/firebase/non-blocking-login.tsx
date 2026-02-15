'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import React from 'react';
import Link from 'next/link';

function handleAuthError(error: unknown) {
  let title = 'Authentication Error';
  let description: React.ReactNode =
    'An unknown error occurred. Please try again.';

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':
        description = (
          <>
            This email is not registered or no account exists with this email.{' '}
            <Link href="/signup" className="font-semibold underline">
              Register to login
            </Link>
          </>
        );
        break;
      case 'auth/wrong-password':
        description = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-credential':
        description =
          'The credentials provided are invalid. Please check and try again.';
        break;
      case 'auth/email-already-in-use':
        description =
          'This email address is already in use by another account.';
        break;
      case 'auth/weak-password':
        description = 'Password should be at least 6 characters.';
        break;
      case 'auth/invalid-email':
        description = 'The email address is not valid.';
        break;
      default:
        description = 'An unexpected error occurred. Please try again later.';
        break;
    }
  }

  toast({
    variant: 'destructive',
    title: title,
    description: description,
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(handleAuthError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(
    handleAuthError
  );
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(
    handleAuthError
  );
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
