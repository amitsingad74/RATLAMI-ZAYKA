import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  // =====================================================
  // CART INFORMATION
  // =====================================================

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const hasStockProblem = cartItems.some((item) => {
    const stock = Number(item.stock ?? 0);
    const quantity = Number(item.quantity || 0);

    return stock <= 0 || quantity > stock;
  });

  // =====================================================
  // CLEAR CART
  // =====================================================

  const handleClearCart = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to remove all items from your cart?"
    );

    if (confirmClear) {
      clearCart();
    }
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>

          <h1>Your Cart is Empty</h1>

          <p>
            Looks like you haven't added any delicious
            Ratlami products yet.
          </p>

          <Link
            to="/products"
            className="continue-shopping-btn"
          >
            Explore Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="cart-header">
        <p className="section-tag">
          YOUR SHOPPING CART
        </p>

        <h1>
          Shopping <span>Cart</span>
        </h1>

        <p className="cart-header-description">
          Review your products and quantities before
          proceeding to checkout.
        </p>
      </div>

      {/* =================================================
          CART CONTENT
      ================================================= */}

      <div className="cart-container">

        {/* =================================================
            CART ITEMS
        ================================================= */}

        <div className="cart-items">

          <div className="cart-items-header">
            <div>
              <h2>Cart Items</h2>

              <p>
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>

            <Link
              to="/products"
              className="cart-add-more"
            >
              + Add More Products
            </Link>
          </div>

          {cartItems.map((item) => {
            const productId = item._id || item.id;

            const stock = Number(item.stock ?? 0);
            const quantity = Number(item.quantity || 0);
            const price = Number(item.price || 0);

            const isOutOfStock = stock <= 0;
            const isLowStock = stock > 0 && stock <= 10;
            const reachedStockLimit =
              stock > 0 && quantity >= stock;

            const quantityProblem =
              stock > 0 && quantity > stock;

            const itemTotal = price * quantity;

            return (
              <div
                className={
                  isOutOfStock || quantityProblem
                    ? "cart-item cart-item-problem"
                    : "cart-item"
                }
                key={productId}
              >

                {/* PRODUCT IMAGE */}

                <Link
                  to={`/products/${productId}`}
                  className="cart-item-image"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-product-image"
                    />
                  ) : (
                    <span className="cart-product-emoji">
                      {item.emoji || "🍬"}
                    </span>
                  )}
                </Link>

                {/* PRODUCT DETAILS */}

                <div className="cart-item-details">

                  <p className="cart-category">
                    {item.category}
                  </p>

                  <Link
                    to={`/products/${productId}`}
                    className="cart-product-name"
                  >
                    {item.name}
                  </Link>

                  <p className="cart-product-weight">
                    {item.weight}
                  </p>

                  <span className="cart-price">
                    ₹{price}
                  </span>

                  {/* STOCK */}

                  <div
                    className={
                      isOutOfStock
                        ? "cart-stock out-of-stock"
                        : isLowStock
                        ? "cart-stock low-stock"
                        : "cart-stock in-stock"
                    }
                  >
                    {isOutOfStock
                      ? "❌ Out of Stock"
                      : isLowStock
                      ? `⚠️ Only ${stock} left`
                      : `📦 ${stock} available`}
                  </div>

                  {/* QUANTITY WARNING */}

                  {quantityProblem && (
                    <p className="cart-stock-warning">
                      ⚠️ You selected {quantity}, but only{" "}
                      {stock} are available. Please reduce
                      the quantity.
                    </p>
                  )}

                </div>

                {/* QUANTITY */}

                <div className="cart-quantity-section">

                  <span className="cart-control-label">
                    Quantity
                  </span>

                  <div className="quantity-controls">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(productId)
                      }
                      disabled={quantity <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(productId)
                      }
                      disabled={
                        isOutOfStock ||
                        reachedStockLimit
                      }
                      title={
                        isOutOfStock
                          ? "Product is out of stock"
                          : reachedStockLimit
                          ? `Maximum available stock is ${stock}`
                          : "Increase quantity"
                      }
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>

                  </div>

                  {reachedStockLimit &&
                    !isOutOfStock && (
                      <span className="cart-max-stock">
                        Max stock reached
                      </span>
                    )}

                </div>

                {/* ITEM TOTAL */}

                <div className="cart-item-total-section">
                  <span>Item Total</span>

                  <strong>
                    ₹{itemTotal}
                  </strong>
                </div>

                {/* REMOVE */}

                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() =>
                    removeFromCart(productId)
                  }
                  title={`Remove ${item.name}`}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  🗑️
                </button>

              </div>
            );
          })}

          {/* BOTTOM ACTIONS */}

          <div className="cart-bottom-actions">

            <Link
              to="/products"
              className="continue-shopping"
            >
              ← Continue Shopping
            </Link>

            <button
              type="button"
              className="clear-cart-btn"
              onClick={handleClearCart}
            >
              🗑️ Clear Cart
            </button>

          </div>

        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <div className="cart-summary">

          <div className="cart-summary-header">
            <h2>Order Summary</h2>

            <p>
              {totalItems}{" "}
              {totalItems === 1 ? "item" : "items"}
            </p>
          </div>

          {/* STOCK WARNING */}

          {hasStockProblem && (
            <div className="cart-checkout-warning">
              <strong>
                ⚠️ Cart needs attention
              </strong>

              <span>
                Please update unavailable quantities before
                proceeding to checkout.
              </span>
            </div>
          )}

          {/* SUBTOTAL */}

          <div className="summary-row">
            <span>Subtotal</span>

            <span>₹{cartTotal}</span>
          </div>

          {/* DELIVERY */}

          <div className="summary-row">
            <span>Delivery</span>

            <span className="cart-free-delivery">
              FREE
            </span>
          </div>

          <div className="summary-divider" />

          {/* TOTAL */}

          <div className="summary-total">
            <span>Total</span>

            <strong>₹{cartTotal}</strong>
          </div>

          <p className="cart-tax-note">
            Final amount will be confirmed at checkout.
          </p>

          {/* CHECKOUT */}

          <button
            type="button"
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
            disabled={hasStockProblem}
          >
            {hasStockProblem
              ? "Update Cart First"
              : "Proceed to Checkout →"}
          </button>

          {/* TRUST INFORMATION */}

          <div className="cart-summary-benefits">

            <div className="cart-summary-benefit">
              <span>🔒</span>

              <div>
                <strong>Secure Checkout</strong>
                <p>Safe and protected payment.</p>
              </div>
            </div>

            <div className="cart-summary-benefit">
              <span>🚚</span>

              <div>
                <strong>Free Delivery</strong>
                <p>No delivery charge on this order.</p>
              </div>
            </div>

            <div className="cart-summary-benefit">
              <span>🌶️</span>

              <div>
                <strong>Fresh Products</strong>
                <p>Authentic Ratlami taste.</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Cart;