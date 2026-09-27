import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import API_URL from "../config/api";


const WishlistContext = createContext();


export function WishlistProvider({ children }) {


  // ==========================================
  // LOAD WISHLIST
  // ==========================================

  const [wishlist, setWishlist] = useState(() => {

    const savedWishlist =
      localStorage.getItem("wishlist");

    try {

      return savedWishlist
        ? JSON.parse(savedWishlist)
        : [];

    } catch (error) {

      console.error(
        "Wishlist localStorage error:",
        error
      );

      return [];

    }

  });


  // ==========================================
  // SAVE WISHLIST
  // ==========================================

  useEffect(() => {

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);


  // ==========================================
  // REFRESH OLD WISHLIST PRODUCTS
  // FROM MONGODB
  // ==========================================

  useEffect(() => {

    const refreshWishlistProducts =
      async () => {

        if (
          !wishlist ||
          wishlist.length === 0
        ) {
          return;
        }


        try {

          const response =
            await fetch(
              `${API_URL}/api/products`
            );


          if (!response.ok) {

            console.error(
              "Failed to refresh wishlist products"
            );

            return;

          }


          const products =
            await response.json();


          setWishlist((currentWishlist) => {

            return currentWishlist.map(
              (wishlistItem) => {

                const freshProduct =
                  products.find(
                    (product) =>
                      String(product._id) ===
                      String(wishlistItem._id)
                  );


                if (freshProduct) {

                  // Replace old saved product
                  // with current MongoDB product.
                  return freshProduct;

                }


                return wishlistItem;

              }
            );

          });


        } catch (error) {

          console.error(
            "Wishlist refresh error:",
            error
          );

        }

      };


    refreshWishlistProducts();

    // We only need to refresh when
    // wishlist items exist.

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);


  // ==========================================
  // ADD WISHLIST
  // ==========================================

  const addToWishlist = (product) => {

    setWishlist((currentWishlist) => {

      const exists =
        currentWishlist.some(
          (item) =>
            String(item._id) ===
            String(product._id)
        );


      // IMPORTANT:
      // If product already exists,
      // UPDATE it with the latest
      // product data including image.

      if (exists) {

        return currentWishlist.map(
          (item) =>

            String(item._id) ===
            String(product._id)

              ? {
                  ...item,
                  ...product
                }

              : item
        );

      }


      // New wishlist product

      return [
        ...currentWishlist,
        product
      ];

    });

  };


  // ==========================================
  // REMOVE WISHLIST
  // ==========================================

  const removeFromWishlist = (id) => {

    setWishlist((currentWishlist) => {

      return currentWishlist.filter(
        (item) =>
          String(item._id) !==
          String(id)
      );

    });

  };


  // ==========================================
  // CHECK WISHLIST
  // ==========================================

  const isInWishlist = (id) => {

    return wishlist.some(
      (item) =>
        String(item._id) ===
        String(id)
    );

  };


  // ==========================================
  // TOGGLE WISHLIST
  // ==========================================

  const toggleWishlist = (product) => {

    if (
      isInWishlist(product._id)
    ) {

      removeFromWishlist(
        product._id
      );

    } else {

      addToWishlist(product);

    }

  };


  // ==========================================
  // COUNT
  // ==========================================

  const wishlistCount =
    wishlist.length;


  // ==========================================
  // PROVIDER
  // ==========================================

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


// ==========================================
// CUSTOM HOOK
// ==========================================

export function useWishlist() {

  return useContext(
    WishlistContext
  );

}