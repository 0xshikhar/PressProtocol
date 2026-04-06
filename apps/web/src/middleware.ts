import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth';

// Add paths that should be protected
const protectedPaths = [
    '/api/protected',
    '/api/user',
    '/api/auth/validate',
    // Add other protected API routes
];

// Add this list for paths that should bypass token verification
const publicPaths = [
    '/api/user/check',
    '/api/auth/login',
];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Log the request path for debugging
    console.log(`Middleware processing: ${pathname}`);

    // Handle embed routes with permissive iframe headers
    if (pathname.startsWith('/embed')) {
        const response = NextResponse.next();
        response.headers.set('Content-Security-Policy', 'frame-ancestors *;');
        response.headers.delete('X-Frame-Options');
        return response;
    }

    // Skip middleware for public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
        console.log(`Skipping middleware for public path: ${pathname}`);
        return NextResponse.next();
    }

    // Check if the path should be protected
    if (protectedPaths.some(path => pathname.startsWith(path))) {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            console.log(`No token provided for protected path: ${pathname}`);
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        try {
            // Verify the token
            const decoded = await verifyJwtToken(token);
            console.log(`Token verified for address: ${decoded.address}`);

            // Add user info to request headers to be accessible in route handlers
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-address', decoded.address);

            // Return the request with modified headers
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        } catch (error) {
            console.error(`Token verification failed for path ${pathname}:`, error);
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

// Configure middleware to run on API routes and embed routes
export const config = {
    matcher: ['/api/:path*', '/embed/:path*'],
}; 