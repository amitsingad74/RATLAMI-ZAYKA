import { Link } from "react-router-dom";
import { useState } from "react";

function Orders() {


  // ================= GET LOGGED IN USER =================

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );


  // ================= USER ORDER KEY =================

  const orderKey = loggedInUser

    ? `orders_${loggedInUser.email}`

    : null;


  // ================= LOAD ORDERS =================

  const [orders, setOrders] = useState(() => {


    if (!orderKey) {

      return [];

    }


    return JSON.parse(

      localStorage.getItem(orderKey)

    ) || [];


  });


  // ================= DELETE ORDER =================

  const deleteOrder = (orderId) => {


    const updatedOrders =

      orders.filter(

        (order) =>
          order.id !== orderId

      );


    // UPDATE STATE

    setOrders(updatedOrders);


    // UPDATE LOCAL STORAGE

    localStorage.setItem(

      orderKey,

      JSON.stringify(updatedOrders)

    );


  };


  // ================= NOT LOGGED IN =================

  if (!loggedInUser) {

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


  // ================= EMPTY ORDERS =================

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


  // ================= ORDERS PAGE =================

  return (

    <div className="orders-page">


      {/* ================= HEADER ================= */}

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


      {/* ================= ORDERS LIST ================= */}

      <div className="orders-container">


        {orders.map((order) => (

          <div

            className="order-card"

            key={order.id}

          >


            {/* ================= ORDER HEADER ================= */}

            <div className="order-card-header">


              <div>


                <h2>

                  Order #{order.id}

                </h2>


                <p>

                  📅 {order.orderDate}

                </p>


              </div>


              <span className="order-status">

                {order.status}

              </span>


            </div>


            {/* ================= ORDER ITEMS ================= */}

            <div className="order-items">


              {order.items.map((item) => (

                <div

                  className="order-item"

                  key={item.id}

                >


                  <div className="order-item-left">


                    <span className="order-item-emoji">

                      {item.emoji}

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


            {/* ================= ORDER FOOTER ================= */}

            <div className="order-card-footer">


              <div>


                <span>

                  Total Amount

                </span>


                <h2>

                  ₹{order.total}

                </h2>


              </div>


              <button

                className="delete-order-btn"

                onClick={() =>
                  deleteOrder(order.id)
                }

              >

                🗑️ Delete

              </button>


            </div>


          </div>

        ))}


      </div>


    </div>

  );

}


export default Orders;