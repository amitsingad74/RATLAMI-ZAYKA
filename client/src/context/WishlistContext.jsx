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
  // ADD WISHLIST
  // ===============================

  const addToWishlist = (product) => {

    const exists = wishlist.some(
      (item) => item._id === product._id
    );

    if (!exists) {

      setWishlist([
        ...wishlist,
        product
      ]);

    }

  };


  // ===============================
  // REMOVE WISHLIST
  // ===============================

  const removeFromWishlist = (id) => {

    setWishlist(
      wishlist.filter(
        (item) => item._id !== id
      )
    );

  };


  // ===============================
  // CHECK WISHLIST
  // ===============================

  const isInWishlist = (id) => {

    return wishlist.some(
      (item) => item._id === id
    );

  };


  // ===============================
  // TOGGLE WISHLIST
  // ===============================

  const toggleWishlist = (product) => {

    if (isInWishlist(product._id)) {

      removeFromWishlist(product._id);

    } else {

      addToWishlist(product);

    }

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

        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist
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