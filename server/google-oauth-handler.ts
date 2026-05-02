import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { exchangeCodeForTokens, getGoogleUserInfo } from "./google-oauth";
import { upsertUser, getUserByOpenId } from "./db";
import { TRPCError } from "@trpc/server";

/**
 * Google OAuth handler router
 * Manages OAuth callback and token exchange
 */
export const googleOAuthRouter = router({
  /**
   * Exchange authorization code for tokens and create/update user session
   */
  exchange: publicProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(input.code);

        if (!tokens.access_token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to obtain access token",
          });
        }

        // Get user info from Google
        const googleUser = await getGoogleUserInfo(tokens.access_token);

        // Upsert user in database (create if doesn't exist, update if does)
        await upsertUser({
          openId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });

        // Get the user to verify creation
        const user = await getUserByOpenId(googleUser.id);

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user session",
          });
        }

        // Set session cookie
        const sessionToken = Buffer.from(JSON.stringify({ userId: user.id, openId: user.openId })).toString(
          "base64"
        );

        ctx.res.setHeader("Set-Cookie", `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=None`);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication failed";
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message,
        });
      }
    }),

  /**
   * Get Google OAuth login URL
   */
  getLoginUrl: publicProcedure
    .input(
      z.object({
        returnPath: z.string().optional(),
      })
    )
    .query(({ input }) => {
      // Generate state parameter for CSRF protection
      const state = Buffer.from(
        JSON.stringify({
          returnPath: input.returnPath || "/",
          timestamp: Date.now(),
        })
      ).toString("base64");

      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const redirectUri = `${process.env.OAUTH_SERVER_URL}/auth/google/callback`;
      const scope = "openid email profile";

      const params = new URLSearchParams({
        client_id: clientId || "",
        redirect_uri: redirectUri || "",
        response_type: "code",
        scope,
        state,
        access_type: "offline",
        prompt: "consent",
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      };
    }),
});
