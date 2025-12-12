import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await connectToDatabase("analytics");
    const current_metrics = db.collection("current_metrics");
    const newVisitor = body.newVisitor === true;
    await current_metrics.updateOne(
      { name: "daily_visitors" },
      {
        $inc: {
          new_visitors: newVisitor ? 1 : 0,
          daily_visitors: 1,
        },
      },
      { upsert: true }
    );
    // We don't need to send anything back
    return NextResponse.json({});
  } catch {
    // We don't need to send anything back
    return NextResponse.json({});
  }
}
