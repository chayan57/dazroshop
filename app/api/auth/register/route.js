import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/connectDB";
import User from "@/models/User";

import {
  createAuthToken,
  setAuthCookie,
} from "@/lib/auth";

export async function POST(request) {
  try {
    await dbConnect();

    const body =
      await request.json();

    const {
      name,
      email,
      phone,
      password,
    } = body;

    // ==========================================
    // Validation
    // ==========================================

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (
      password.length < 6
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // ==========================================
    // Existing User
    // ==========================================

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // Hash Password
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    // ==========================================
    // Create User
    // ==========================================

    const user =
      await User.create({
        name: name.trim(),

        email:
          normalizedEmail,

        phone:
          phone?.trim() || "",

        password:
          hashedPassword,

        role: "user",
      });

    // ==========================================
    // Login Immediately
    // ==========================================

    const token =
      await createAuthToken(
        user._id
      );

    await setAuthCookie(
      token
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully.",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/auth/register ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Registration failed.",
      },
      { status: 500 }
    );
  }
}