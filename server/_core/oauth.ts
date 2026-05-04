import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { exchangeCodeForTokens, getGoogleUserInfo } from "../google-oauth";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Google state is base64-encoded JSON with a returnPath field.
// Manus state is base64-encoded plain URL string.
function isGoogleState(state: string): boolean {
  try {
    const decoded = Buffer.from(state, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    return typeof parsed === "object" && parsed !== null && "returnPath" in parsed;
  } catch {
    return false;
  }
}

async function handleGoogleCallback(code: string, req: Request, res: Response) {
  const tokens = await exchangeCodeForTokens(code);
  if (!tokens.access_token) throw new Error("No access token returned from Google");

  const googleUser = await getGoogleUserInfo(tokens.access_token);
  try {
    await db.upsertUser({
      openId: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      loginMethod: "google",
      lastSignedIn: new Date(),
    });
  } catch (dbError) {
    console.error("[OAuth] DB upsert failed (non-fatal, proceeding with session):", dbError);
  }

  const sessionToken = await sdk.createSessionToken(googleUser.id, {
    name: googleUser.name || "",
    expiresInMs: ONE_YEAR_MS,
  });

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
  res.redirect(302, "/");
}

async function handleManusCallback(code: string, state: string, req: Request, res: Response) {
  const tokenResponse = await sdk.exchangeCodeForToken(code, state);
  const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

  if (!userInfo.openId) throw new Error("openId missing from user info");

  await db.upsertUser({
    openId: userInfo.openId,
    name: userInfo.name || null,
    email: userInfo.email ?? null,
    loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
    lastSignedIn: new Date(),
  });

  const sessionToken = await sdk.createSessionToken(userInfo.openId, {
    name: userInfo.name || "",
    expiresInMs: ONE_YEAR_MS,
  });

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
  res.redirect(302, "/");
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      if (state && isGoogleState(state)) {
        console.log("[OAuth] Handling Google callback");
        await handleGoogleCallback(code, req, res);
      } else {
        if (!state) {
          res.status(400).json({ error: "state is required for Manus OAuth" });
          return;
        }
        console.log("[OAuth] Handling Manus callback");
        await handleManusCallback(code, state, req, res);
      }
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.redirect("/?error=auth_failed");
    }
  });
}
