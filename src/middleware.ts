import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Simplified middleware to avoid header issues
  return NextResponse.next();
}
