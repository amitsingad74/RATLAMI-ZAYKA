import { useNavigate } from "react-router-dom";

function Profile() {

  const navigate = useNavigate();


  // ================= GET USER =================

  const userData = localStorage.getItem("user");


  // ================= CHECK USER =================

  if (!userData) {

    return (

      <div className="profile-page">

        <div className="profile-not-logged">

          <h2>Please Login First</h2>

          <button
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>

        </div>

      </div>

    );

  }


  // ================= PARSE USER =================

  const user = JSON.parse(userData);


  // ================= LOGOUT =================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    alert("Logged out successfully! 👋");

    navigate("/login");

  };


  return (

    <div className="profile-page">


      {/* ================= PROFILE HEADER ================= */}

      <section className="profile-header">

        <p className="section-tag">
          MY ACCOUNT
        </p>


        <h1>
          My <span>Profile</span>
        </h1>


        <div className="gold-divider">
          ✦
        </div>


        <p className="profile-subtitle">
          Manage your account information.
        </p>

      </section>



      {/* ================= PROFILE CONTENT ================= */}

      <section className="profile-container">


        {/* PROFILE CARD */}

        <div className="profile-card">


          {/* PROFILE TOP */}

          <div className="profile-top">

            <div className="profile-avatar">
              👤
            </div>


            <div>

              <h2>
                {user.name}
              </h2>


              <p>
                {user.email}
              </p>

            </div>

          </div>


          {/* DIVIDER */}

          <div className="profile-divider"></div>



          {/* USER DETAILS */}

          <div className="profile-details">


            {/* NAME */}

            <div className="profile-detail">

              <span className="profile-detail-icon">
                👤
              </span>


              <div>

                <p>Full Name</p>

                <h3>
                  {user.name}
                </h3>

              </div>

            </div>



            {/* EMAIL */}

            <div className="profile-detail">

              <span className="profile-detail-icon">
                📧
              </span>


              <div>

                <p>Email Address</p>

                <h3>
                  {user.email}
                </h3>

              </div>

            </div>



            {/* PHONE */}

            <div className="profile-detail">

              <span className="profile-detail-icon">
                📱
              </span>


              <div>

                <p>Phone Number</p>

                <h3>
                  {user.phone || "Not provided"}
                </h3>

              </div>

            </div>


          </div>



          {/* PROFILE ACTIONS */}

          <div className="profile-actions">


            <button
              className="orders-btn"
              onClick={() => navigate("/orders")}
            >

              📦 My Orders

            </button>


            <button
              className="profile-logout-btn"
              onClick={handleLogout}
            >

              Logout

            </button>


          </div>


        </div>


      </section>


    </div>

  );

}


export default Profile;