import { generateNonce, SiweMessage } from 'siwe';
// import { prisma } from './prisma';
import jwt from 'jsonwebtoken';

export async function createAuthMessage(address: string, chainId: number) {
    const nonce = generateNonce();
    const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Next Demo application',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce
    });

    return message.prepareMessage();
}

export async function verifySignature(message: string, signature: string) {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });
    return fields.data;
}

// Define the user type for the JWT payload
export interface JwtPayload {
    userId: string;
    address: string;
    iat?: number;
    exp?: number;
}

// Generate a JWT token
export function generateJwtToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, { expiresIn: '1d' });
}

// Verify a JWT token
export async function verifyJwtToken(token: string): Promise<JwtPayload> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded as JwtPayload);
            }
        });
    });
}

// Debug function to check token validity
export function debugJwtToken(token: string): { valid: boolean; payload?: JwtPayload; error?: string } {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return { valid: false, error: 'JWT_SECRET is not defined' };
    }

    try {
        const decoded = jwt.verify(token, secret);
        return { valid: true, payload: decoded as JwtPayload };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
