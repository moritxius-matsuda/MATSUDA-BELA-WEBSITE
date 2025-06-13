import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/sign-in", "/sign-up", "/impressum", "/proxmox-guide"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],
  
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // If the user is logged in and trying to access a protected route, allow it
    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }
    
    // Allow public routes
    return NextResponse.next();
  },
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};