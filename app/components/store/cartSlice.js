import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    setCart: (state, action) => {
      const cartItems =
        action.payload || [];

      state.items =
        cartItems.map((item) => ({
          productId:
            item.productId ||
            item.product?._id ||
            item.product?.id,

          name:
            item.name ||
            item.product?.name ||
            "",

          price: Number(
            item.price ??
              item.product?.price ??
              0
          ),

          image:
            item.image ||
            item.product?.images?.[0] ||
            "",

          quantity: Number(
            item.quantity || 1
          ),

          stock: Number(
            item.stock ??
              item.product?.stock ??
              0
          ),
        }));
    },

    addToCart: (state, action) => {
      const product =
        action.payload;

      const existingItem =
        state.items.find(
          (item) =>
            String(
              item.productId
            ) ===
            String(
              product.productId
            )
        );

      if (existingItem) {
        existingItem.quantity +=
          product.quantity || 1;
      } else {
        state.items.push({
          productId:
            product.productId,

          name:
            product.name,

          price: Number(
            product.price || 0
          ),

          image:
            product.image || "",

          quantity:
            product.quantity || 1,

          stock: Number(
            product.stock || 0
          ),
        });
      }
    },

    increaseQuantity: (
      state,
      action
    ) => {
      const item =
        state.items.find(
          (item) =>
            String(
              item.productId
            ) ===
            String(
              action.payload
            )
        );

      if (
        item &&
        item.quantity <
          item.stock
      ) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (
      state,
      action
    ) => {
      const item =
        state.items.find(
          (item) =>
            String(
              item.productId
            ) ===
            String(
              action.payload
            )
        );

      if (
        item &&
        item.quantity > 1
      ) {
        item.quantity -= 1;
      }
    },

    removeFromCart: (
      state,
      action
    ) => {
      state.items =
        state.items.filter(
          (item) =>
            String(
              item.productId
            ) !==
            String(
              action.payload
            )
        );
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  setCart,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;