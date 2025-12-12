import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  let returnPath = "";
  const arr = path.split(`/`);
  const page = arr[arr.length - 1];
  if (page && arr.length === 2) {
    const returnPages = [
      "digits2",
      "digits3",
      "digits4",
      "digits5",
      "digits6",
      "digits7",
    ];
    if (returnPages.includes(page)) {
      returnPath = `/${page}`;
    }
  }
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  googleAuthUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/google/callback`
  );
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("state", encodeURIComponent(returnPath));
  return NextResponse.redirect(googleAuthUrl.toString());
}
