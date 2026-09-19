import Product from "@/models/Product";
import Category from "@/models/Category";
import dbConnect from "@/lib/connectDB";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(
      request.url
    );

    const id = searchParams.get("id");

    // =========================
    // Single Product
    // =========================
    if (id) {
      const product = await Product.findOne({
        _id: id,
        status: "active",
      })
        .populate(
          "category",
          "name slug"
        )
        .lean();

      if (!product) {
        return Response.json(
          {
            success: false,
            message: "Product not found.",
          },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        product,
      });
    }

    // =========================
    // All Active Products
    // =========================
    const products = await Product.find({
      status: "active",
    })
      .populate(
        "category",
        "name slug"
      )
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "GET /api/products ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch products.",
      },
      { status: 500 }
    );
  }
}