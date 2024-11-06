import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Define your public routes here
const publicRoutes = ['/auth']; // Add more public routes as needed

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/uploadthing (UploadThing routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/uploadthing|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (request.method === "GET") {
    const response = NextResponse.next();
    const token = request.cookies.get("session")?.value ?? null;
    
    if (token !== null) {
      response.cookies.set("session", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    } else if (!isPublicRoute) {
      // If there's no token and it's not a public route, redirect to /auth
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    return response;
  }

  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");

  if (originHeader === null || hostHeader === null) {
    return new NextResponse(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    return new NextResponse(null, {
      status: 403,
    });
  }

  if (origin.host !== hostHeader) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  return NextResponse.next();
}