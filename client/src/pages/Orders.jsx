import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Orders() {

  // ===============================
  // GET LOGGED IN USER
  // ===============================

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const token = localStorage.getItem("token");


  // ===============================
  // STATES
  // ===============================

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ===============================
  // FETCH ORDERS FROM MONGODB
  // ===============================

  useEffect(() => {

    const fetchOrders = async () => {

      if (!token) {

        setLoading(false);

        return;

      }


      try {

        setLoading(true);

        setError("");


        const response = await fetch(
          "http://localhost:5000/api/orders/my-orders",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );


        const data = await response.json();


        if (!response.ok) {

          throw new Error(
            data.message || "Failed to fetch orders."
          );

        }


        setOrders(data);

      } catch (error) {

        console.error(
          "Fetch Orders Error:",
          error
        );

        setError(
          error.message ||
          "Unable to load orders."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchOrders();

  }, [token]);


  // ===============================
  // NOT LOGGED IN
  // ===============================

  if (!loggedInUser || !token) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            🔒 Please Login
          </h1>

          <p>
            Please login to view your orders.
          </p>

          <Link
            to="/login"
            className="explore-products-btn"
          >
            Login
          </Link>

        </div>

      </div>

    );

  }


  // ===============================
  // LOADING
  // ===============================

  if (loading) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            Loading Orders... 📦
          </h1>

          <p>
            Please wait while we load your orders.
          </p>

        </div>

      </div>

    );

  }


  // ===============================
  // ERROR
  // ===============================

  if (error) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            Something went wrong 😕
          </h1>

          <p>
            {error}
          </p>

          <Link
            to="/products"
            className="explore-products-btn"
          >
            Back to Products
          </Link>

        </div>

      </div>

    );

  }


  // ===============================
  // EMPTY ORDERS
  // ===============================

  if (orders.length === 0) {

    return (

      <div className="orders-page">

        <div className="empty-orders">

          <h1>
            📦 No Orders Yet
          </h1>

          <p>
            You haven't placed any orders yet.
          </p>

          <Link
            to="/products"
            className="explore-products-btn"
          >
            Explore Products
          </Link>

        </div>

      </div>

    );

  }


  // ===============================
  // ORDERS PAGE
  // ===============================

  return (

    <div className="orders-page">


      {/* ===============================
          HEADER
      =============================== */}

      <div className="orders-header">

        <p className="section-tag">
          YOUR PURCHASE HISTORY
        </p>

        <h1>
          My <span>Orders</span>
        </h1>

        <div className="gold-divider">
          ✦
        </div>

        <p>
          View all your delicious Ratlami Zayka orders.
        </p>

      </div>


      {/* ===============================
          ORDERS LIST
      =============================== */}

      <div className="orders-container">

        {orders.map((order) => (

          <div
            className="order-card"
            key={order._id}
          >


            {/* ===============================
                ORDER HEADER
            =============================== */}

            <div className="order-card-header">

              <div>

                <h2>
                  Order #{order._id.slice(-6)}
                </h2>

                <p>
                  📅{" "}
                  {new Date(
                    order.createdAt
                  ).toLocaleString()}
                </p>

              </div>

              <span className="order-status">
                {order.status}
              </span>

            </div>


            {/* ===============================
                ORDER ITEMS
            =============================== */}

            <div className="order-items">

              {order.items.map((item, index) => (

                <div
                  className="order-item"
                  key={
                    item.product?._id ||
                    `${order._id}-${index}`
                  }
                >

                  <div className="order-item-left">

                    <span className="order-item-emoji">

                      {item.product?.emoji ||
                        "🌶️"}

                    </span>

                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                    </div>

                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>

                </div>

              ))}

            </div>


            {/* ===============================
                ORDER FOOTER
            =============================== */}

            <div className="order-card-footer">

              <div>

                <span>
                  Total Amount
                </span>

                <h2>
                  ₹{order.total}
                </h2>

              </div>


              {/* 
                Delete button removed for now.
                Orders are stored in MongoDB.
              */}

              <span className="order-status">
                {order.status}
              </span>


    <Link
      to={`/orders/${order._id}`}
      className="view-order-btn"
    >
      View Details
    </Link>

            </div>


          </div>

        ))}

      </div>

    </div>

  );

}


export default Orders;