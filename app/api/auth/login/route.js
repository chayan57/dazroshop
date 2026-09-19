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
      email,
      password,
    } = body;

    if (
      !email?.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token =
      await createAuthToken(
        user._id
      );

    await setAuthCookie(
      token
    );

    return NextResponse.json({
      success: true,
      message:
        "Login successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/auth/login ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Login failed.",
      },
      { status: 500 }
    );
  }
}