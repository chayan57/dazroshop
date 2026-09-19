import dbConnect from "@/lib/connectDB";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

async function getOrCreateCartId() {
  const cookieStore = await cookies();

  let cartId =
    cookieStore.get("dazro_cart_id")?.value;

  let isNew = false;

  if (!cartId) {
    cartId = randomUUID();
    isNew = true;
  }

  return {
    cartId,
    cookieStore,
    isNew,
  };
}

function setCartCookie(
  cookieStore,
  cartId
) {
  cookieStore.set(
    "dazro_cart_id",
    cartId,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  );
}

async function getCartWithProducts(cartId) {
  let cart = await Cart.findOne({
    cartId,
  }).populate({
    path: "items.product",
    select:
      "_id name price oldPrice images brand stock status slug",
  });

  if (!cart) {
    cart = await Cart.create({
      cartId,
      items: [],
    });
  }

  // Remove products that no longer exist
  cart.items = cart.items.filter(
    (item) => item.product
  );

  await cart.save();

  return cart;
}

// =========================
// GET CART
// =========================
export async function GET() {
  try {
    await dbConnect();

    const {
      cartId,
      cookieStore,
      isNew,
    } = await getOrCreateCartId();

    const cart =
      await getCartWithProducts(
        cartId
      );

    if (isNew) {
      setCartCookie(
        cookieStore,
        cartId
      );
    }

    return Response.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(
      "GET /api/cart ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch cart.",
      },
      { status: 500 }
    );
  }
}

// =========================
// ADD TO CART
// =========================
export async function POST(request) {
  try {
    await dbConnect();

    const body =
      await request.json();

    const {
      productId,
      quantity = 1,
    } = body;

    if (!productId) {
      return Response.json(
        {
          success: false,
          message:
            "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const addQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        addQuantity
      ) ||
      addQuantity < 1
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Quantity must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    const product =
      await Product.findOne({
        _id: productId,
        status: "active",
      }).lean();

    if (!product) {
      return Response.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        { status: 404 }
      );
    }

    const stock = Number(
      product.stock || 0
    );

    if (stock <= 0) {
      return Response.json(
        {
          success: false,
          message:
            "Product is out of stock.",
        },
        { status: 400 }
      );
    }

    const {
      cartId,
      cookieStore,
      isNew,
    } = await getOrCreateCartId();

    let cart =
      await Cart.findOne({
        cartId,
      });

    if (!cart) {
      cart = new Cart({
        cartId,
        items: [],
      });
    }

    const existingItem =
      cart.items.find(
        (item) =>
          String(item.product) ===
          String(productId)
      );

    const newQuantity =
      existingItem
        ? existingItem.quantity +
          addQuantity
        : addQuantity;

    if (newQuantity > stock) {
      return Response.json(
        {
          success: false,
          message: `Only ${stock} item(s) available.`,
        },
        { status: 400 }
      );
    }

    if (existingItem) {
      existingItem.quantity =
        newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: addQuantity,
      });
    }

    await cart.save();

    cart =
      await getCartWithProducts(
        cartId
      );

    if (isNew) {
      setCartCookie(
        cookieStore,
        cartId
      );
    }

    return Response.json({
      success: true,
      message:
        "Product added to cart.",
      cart,
    });
  } catch (error) {
    console.error(
      "POST /api/cart ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to add product to cart.",
      },
      { status: 500 }
    );
  }
}

// =========================
// UPDATE QUANTITY
// =========================
export async function PATCH(request) {
  try {
    await dbConnect();

    const body =
      await request.json();

    const {
      productId,
      quantity,
    } = body;

    if (!productId) {
      return Response.json(
        {
          success: false,
          message:
            "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const newQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        newQuantity
      ) ||
      newQuantity < 1
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Quantity must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    const {
      cartId,
      cookieStore,
      isNew,
    } = await getOrCreateCartId();

    const cart =
      await Cart.findOne({
        cartId,
      });

    if (!cart) {
      return Response.json(
        {
          success: false,
          message: "Cart not found.",
        },
        { status: 404 }
      );
    }

    const item =
      cart.items.find(
        (cartItem) =>
          String(
            cartItem.product
          ) === String(productId)
      );

    if (!item) {
      return Response.json(
        {
          success: false,
          message:
            "Product is not in the cart.",
        },
        { status: 404 }
      );
    }

    const product =
      await Product.findOne({
        _id: productId,
        status: "active",
      }).lean();

    if (!product) {
      return Response.json(
        {
          success: false,
          message:
            "Product is no longer available.",
        },
        { status: 404 }
      );
    }

    const stock = Number(
      product.stock || 0
    );

    if (
      newQuantity > stock
    ) {
      return Response.json(
        {
          success: false,
          message: `Only ${stock} item(s) available.`,
        },
        { status: 400 }
      );
    }

    item.quantity =
      newQuantity;

    await cart.save();

    const updatedCart =
      await getCartWithProducts(
        cartId
      );

    if (isNew) {
      setCartCookie(
        cookieStore,
        cartId
      );
    }

    return Response.json({
      success: true,
      message:
        "Cart updated successfully.",
      cart: updatedCart,
    });
  } catch (error) {
    console.error(
      "PATCH /api/cart ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to update cart.",
      },
      { status: 500 }
    );
  }
}

// =========================
// REMOVE / CLEAR CART
// =========================
export async function DELETE(request) {
  try {
    await dbConnect();

    const { searchParams } =
      new URL(request.url);

    const productId =
      searchParams.get(
        "productId"
      );

    const {
      cartId,
      cookieStore,
      isNew,
    } = await getOrCreateCartId();

    const cart =
      await Cart.findOne({
        cartId,
      });

    if (!cart) {
      return Response.json({
        success: true,
        message: "Cart is empty.",
        cart: {
          cartId,
          items: [],
        },
      });
    }

    if (productId) {
      cart.items =
        cart.items.filter(
          (item) =>
            String(
              item.product
            ) !== String(productId)
        );
    } else {
      cart.items = [];
    }

    await cart.save();

    const updatedCart =
      await getCartWithProducts(
        cartId
      );

    if (isNew) {
      setCartCookie(
        cookieStore,
        cartId
      );
    }

    return Response.json({
      success: true,
      message: productId
        ? "Product removed from cart."
        : "Cart cleared successfully.",
      cart: updatedCart,
    });
  } catch (error) {
    console.error(
      "DELETE /api/cart ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to update cart.",
      },
      { status: 500 }
    );
  }
}