import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {

  // ===============================
  // LOAD WISHLIST FROM LOCALSTORAGE
  // ===============================

  const [wishlist, setWishlist] = useState(() => {

    const savedWishlist =
      localStorage.getItem("wishlist");

    return savedWishlist
      ? JSON.parse(savedWishlist)
      : [];

  });


  // ===============================
  // SAVE WISHLIST TO LOCALSTORAGE
  // ===============================

  useEffect(() => {

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);


  // ===============================
  // ADD / REMOVE WISHLIST
  // ===============================

  const toggleWishlist = (product) => {

    const exists = wishlist.find(
      (item) => item.id === product.id
    );


    if (exists) {

      // REMOVE PRODUCT

      setWishlist(
        wishlist.filter(
          (item) => item.id !== product.id
        )
      );

    } else {

      // ADD PRODUCT

      setWishlist([
        ...wishlist,
        product
      ]);

    }

  };


  // ===============================
  // CHECK WISHLIST
  // ===============================

  const isInWishlist = (id) => {

    return wishlist.some(
      (item) => item.id === id
    );

  };


  // ===============================
  // REMOVE FROM WISHLIST
  // ===============================

  const removeFromWishlist = (id) => {

    setWishlist(
      wishlist.filter(
        (item) => item.id !== id
      )
    );

  };


  // ===============================
  // WISHLIST COUNT
  // ===============================

  const wishlistCount = wishlist.length;


  return (

    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist
      }}
    >

      {children}

    </WishlistContext.Provider>

  );

}


// ===============================
// CUSTOM HOOK
// ===============================

export function useWishlist() {

  return useContext(WishlistContext);

}