import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Single shared Firebase App initialization
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

// Standard Google Auth Provider for fast, reliable Sign-In & Sign-Up
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Optional Google Chat Scopes Provider
export const SCOPES = [
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',
];

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
      }
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export function formatAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const msg = error instanceof Error ? error.message : String(error);

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please check your credentials or create a new account.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please switch to Log In instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase console yet, or use Continue with Google below.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Browser blocked the sign-in popup. Please allow popups for this site and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a moment or reset your password.';
    default:
      return msg.replace(/^Firebase:\s*/i, '');
  }
}

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    await upsertUserProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw new Error(formatAuthError(error));
  } finally {
    isSigningIn = false;
  }
};

export const emailSignUp = async (
  fullName: string,
  email: string,
  password: string
): Promise<User> => {
  try {
    isSigningIn = true;
    const cleanName = fullName.trim().slice(0, 100) || 'Samjha User';
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: cleanName });
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // Non-fatal if verification email rate-limits
    }
    await upsertUserProfile(cred.user, cleanName);
    return cred.user;
  } catch (error) {
    console.error('Email Sign-Up error:', error);
    throw new Error(formatAuthError(error));
  } finally {
    isSigningIn = false;
  }
};

export const emailSignIn = async (email: string, password: string): Promise<User> => {
  try {
    isSigningIn = true;
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    await upsertUserProfile(cred.user);
    return cred.user;
  } catch (error) {
    console.error('Email Sign-In error:', error);
    throw new Error(formatAuthError(error));
  } finally {
    isSigningIn = false;
  }
};

export const resetUserPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Mandatory Firestore Error Handler (firebase-integration-rpc Section 3)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Safely creates or updates a user's Firestore profile without violating immutable createdAt rules.
 */
export async function upsertUserProfile(user: User, overrideDisplayName?: string): Promise<void> {
  const cleanUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const displayName = (
    overrideDisplayName ||
    user.displayName ||
    user.email?.split('@')[0] ||
    'Samjha User'
  ).slice(0, 100);
  const userRef = doc(db, 'users', cleanUid);

  try {
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        uid: cleanUid,
        displayName,
        language: 'Hinglish',
        preferredMode: 'standard',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${cleanUid}`);
  }
}

/**
 * Safely creates or updates a conversation document in Firestore while preserving createdAt on updates.
 */
export async function upsertConversationDocument(params: {
  conversationId: string;
  ownerUid: string;
  title: string;
  mode: string;
  language: string;
  modelId: string;
  messageCount: number;
  lastMessagePreview: string;
}): Promise<void> {
  const safeConvId = params.conversationId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const safeOwnerId = params.ownerUid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const convRef = doc(db, 'conversations', safeConvId);

  try {
    const existingSnap = await getDoc(convRef);
    if (!existingSnap.exists()) {
      await setDoc(convRef, {
        ownerId: safeOwnerId,
        title: (params.title || 'Session').slice(0, 180),
        mode: params.mode,
        language: params.language,
        modelId: params.modelId.slice(0, 100),
        messageCount: params.messageCount,
        lastMessagePreview: params.lastMessagePreview.slice(0, 480),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(convRef, {
        title: (params.title || 'Session').slice(0, 180),
        mode: params.mode,
        language: params.language,
        modelId: params.modelId.slice(0, 100),
        messageCount: params.messageCount,
        lastMessagePreview: params.lastMessagePreview.slice(0, 480),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `conversations/${safeConvId}`);
  }
}

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();
