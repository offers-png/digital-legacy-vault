import { OAuth2Client } from 'google-auth-library';
import { ENV } from './_core/env';

/**
 * Google OAuth configuration and helpers
 */

const oauth2Client = new OAuth2Client(
  ENV.googleOAuthClientId,
  ENV.googleOAuthClientSecret,
  `${ENV.oAuthServerUrl}/auth/google/callback`
);

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Generate Google OAuth login URL
 */
export function getGoogleLoginUrl(state: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent',
  });

  return url;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUser> {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw new Error('Failed to fetch user information');
  }
}

/**
 * Verify Google ID token (for frontend-initiated auth)
 */
export async function verifyGoogleIdToken(idToken: string) {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken,
      audience: [ENV.googleOAuthClientId],
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    throw new Error('Failed to verify token');
  }
}
