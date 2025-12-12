import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomString } from "@/app/lib/randomString";
import { connectToDatabase } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const returnPath = state ? decodeURIComponent(state) : "";

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/login`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/google/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/login`
      );
    }

    // Get user profile from Google
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const profile = await profileResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/login`
      );
    }

    const sessionId = randomString(48);
    const db = await connectToDatabase("accounts");
    const accounts = db.collection("accounts");
    // Check if account exists
    let account = await accounts.findOne({ googleId: profile.id });
    if (!account) {
      // Check if email exists (for account linking)
      account = await accounts.findOne({
        email: profile.email.toLowerCase(),
      });
    }
    if (!account) {
      // Create new account
      const hashedPassword = await bcrypt.hash(randomString(48), 10);
      const newAccount = {
        googleId: profile.id,
        email: profile.email.toLowerCase(),
        password: hashedPassword,
        sessionId: sessionId,
        avatar: profile.picture,
        createdAt: new Date(),
        lastActive: new Date(),
      };
      await accounts.insertOne(newAccount);
    } else {
      // Update existing account
      const updateData: any = {
        sessionId: sessionId,
        lastActive: new Date(),
      };
      if (!account.googleId) {
        updateData.googleId = profile.id;
      }
      if (profile.picture) {
        updateData.avatar = profile.picture;
      }
      await accounts.updateOne({ _id: account._id }, { $set: updateData });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    // Redirect to original page or homepage
    const redirectPath = returnPath || "/";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}${redirectPath}`
    );
  } catch (error) {
    // Redirect to login
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/login`
    );
  }
}
