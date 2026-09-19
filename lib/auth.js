import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import User from "@/models/User";
import dbConnect from "@/lib/connectDB";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing from environment variables."
  );
}

const secretKey =
  new TextEncoder().encode(
    JWT_SECRET
  );

// ==========================================
// Create JWT
// ==========================================

export async function createAuthToken(
  userId
) {
  return await new SignJWT({
    sub: String(userId),
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime(
      "30d"
    )
    .sign(secretKey);
}

// ==========================================
// Get Current User
// ==========================================

export async function getCurrentUser() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "dazro_auth"
      )?.value;

    if (!token) {
      return null;
    }

    const { payload } =
      await jwtVerify(
        token,
        secretKey
      );

    if (!payload.sub) {
      return null;
    }

    await dbConnect();

    const user =
      await User.findById(
        payload.sub
      )
        .select(
          "_id name email phone role"
        )
        .lean();

    return user || null;
  } catch (error) {
    console.error(
      "getCurrentUser error:",
      error
    );

    return null;
  }
}

// ==========================================
// Set Auth Cookie
// ==========================================

export async function setAuthCookie(
  token
) {
  const cookieStore =
    await cookies();

  cookieStore.set(
    "dazro_auth",
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        60 * 60 * 24 * 30,
    }
  );
}

// ==========================================
// Clear Auth Cookie
// ==========================================

export async function clearAuthCookie() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    "dazro_auth",
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );
}