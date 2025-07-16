import React, { useState } from "react";
import "./UserProfile.css";

const MyProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personal-details");
  const [toggleState, setToggleState] = useState(false);

  return (
    <div className="user-profile-container">
      {/* Top Navigation */}
      <div className="top-nav">
        <div className="nav-left">
          <button className="back-button">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M17.8878 32.9842C18.3877 33.4603 19.179 33.441 19.6552 32.9412C20.1313 32.4413 20.112 31.65 19.6122 31.1738L9.19312 21.2495H33.75C34.4403 21.2495 35 20.6898 35 19.9995C35 19.3092 34.4403 18.7495 33.75 18.7495H9.19295L19.6122 8.82503C20.112 8.34888 20.1312 7.55767 19.6552 7.05778C19.179 6.55792 18.3877 6.53867 17.8878 7.01482L5.52298 18.7927C5.24143 19.0608 5.07485 19.4028 5.02322 19.7585C5.00798 19.8365 5 19.9172 5 19.9995C5 20.0822 5.00802 20.1628 5.0233 20.241C5.07503 20.5965 5.2416 20.9383 5.52298 21.2063L17.8878 32.9842Z"
                fill="#212121"
              />
            </svg>
          </button>
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/5fdce6f4c73de60990d56401cec430eb909ae333?width=198"
            alt="Profile Logo"
            className="profile-logo"
          />
        </div>
        <div className="nav-center">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === "personal-details" ? "active" : ""}`}
              onClick={() => setActiveTab("personal-details")}
            >
              <svg width="18" height="18" viewBox="0 0 31 30" fill="none">
                <path
                  d="M24.1692 26.25V23.75C24.1692 22.4239 23.6424 21.1521 22.7047 20.2145C21.767 19.2768 20.4953 18.75 19.1692 18.75H11.6692C10.3431 18.75 9.07134 19.2768 8.13366 20.2145C7.19597 21.1521 6.66919 22.4239 6.66919 23.75V26.25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.4192 13.75C18.1806 13.75 20.4192 11.5114 20.4192 8.75C20.4192 5.98858 18.1806 3.75 15.4192 3.75C12.6578 3.75 10.4192 5.98858 10.4192 8.75C10.4192 11.5114 12.6578 13.75 15.4192 13.75Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Personal Details
            </button>

            <button
              className={`nav-tab ${activeTab === "upload-document" ? "active" : ""}`}
              onClick={() => setActiveTab("upload-document")}
            >
              <svg width="18" height="18" viewBox="0 0 31 30" fill="none">
                <path
                  d="M15.4192 3.75V18.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21.6692 10L15.4192 3.75L9.16919 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M26.6692 18.75V23.75C26.6692 24.413 26.4058 25.0489 25.937 25.5178C25.4681 25.9866 24.8322 26.25 24.1692 26.25H6.66919C6.00615 26.25 5.37026 25.9866 4.90142 25.5178C4.43258 25.0489 4.16919 24.413 4.16919 23.75V18.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Upload Document
            </button>

            <button
              className={`nav-tab ${activeTab === "job-skills" ? "active" : ""}`}
              onClick={() => setActiveTab("job-skills")}
            >
              <svg width="18" height="18" viewBox="0 0 31 30" fill="none">
                <path
                  d="M5.23169 10.7751C5.04924 9.95328 5.07725 9.09868 5.31313 8.29055C5.54901 7.48242 5.98512 6.74693 6.58102 6.15227C7.17692 5.55762 7.91332 5.12305 8.72195 4.88887C9.53057 4.65468 10.3852 4.62845 11.2067 4.81262C11.6588 4.1055 12.2817 3.52357 13.0179 3.12048C13.7541 2.71739 14.5799 2.5061 15.4192 2.5061C16.2585 2.5061 17.0843 2.71739 17.8205 3.12048C18.5567 3.52357 19.1795 4.1055 19.6317 4.81262C20.4544 4.62765 21.3105 4.65376 22.1204 4.88851C22.9303 5.12327 23.6677 5.55905 24.264 6.15531C24.8603 6.75158 25.296 7.48896 25.5308 8.29887C25.7656 9.10878 25.7917 9.96491 25.6067 10.7876C26.3138 11.2398 26.8957 11.8626 27.2988 12.5988C27.7019 13.335 27.9132 14.1608 27.9132 15.0001C27.9132 15.8394 27.7019 16.6652 27.2988 17.4014C26.8957 18.1376 26.3138 18.7605 25.6067 19.2126C25.7909 20.0341 25.7646 20.8887 25.5304 21.6974C25.2963 22.506 24.8617 23.2424 24.267 23.8383C23.6724 24.4342 22.9369 24.8703 22.1288 25.1062C21.3206 25.3421 20.466 25.3701 19.6442 25.1876C19.1926 25.8975 18.5693 26.4819 17.8318 26.8868C17.0944 27.2917 16.2667 27.5039 15.4254 27.5039C14.5842 27.5039 13.7565 27.2917 13.019 26.8868C12.2816 26.4819 11.6582 25.8975 11.2067 25.1876C10.3852 25.3718 9.53057 25.3456 8.72195 25.1114C7.91332 24.8772 7.17692 24.4426 6.58102 23.848C5.98512 23.2533 5.54901 22.5178 5.31313 21.7097C5.07725 20.9016 5.04924 20.047 5.23169 19.2251C4.51913 18.7742 3.9322 18.1503 3.5255 17.4116C3.11879 16.6729 2.90552 15.8434 2.90552 15.0001C2.90552 14.1569 3.11879 13.3273 3.5255 12.5886C3.9322 11.8499 4.51913 11.2261 5.23169 10.7751Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.6692 15L14.1692 17.5L19.1692 12.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Job role Skills
            </button>

            <button
              className={`nav-tab ${activeTab === "job-task" ? "active" : ""}`}
              onClick={() => setActiveTab("job-task")}
            >
              <svg width="18" height="18" viewBox="0 0 31 30" fill="none">
                <path
                  d="M4.16919 21.25L6.66919 23.75L11.6692 18.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.16919 8.75L6.66919 11.25L11.6692 6.25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6692 7.5H26.6692"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6692 15H26.6692"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6692 22.5H26.6692"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Job role Task
            </button>

            <button
              className={`nav-tab ${activeTab === "responsibility" ? "active" : ""}`}
              onClick={() => setActiveTab("responsibility")}
            >
              <svg width="18" height="18" viewBox="0 0 31 30" fill="none">
                <path
                  d="M4.16919 3.75V23.75C4.16919 24.413 4.43258 25.0489 4.90142 25.5178C5.37026 25.9866 6.00615 26.25 6.66919 26.25H26.6692"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22.9192 21.25V11.25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.6692 21.25V6.25"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.4192 21.25V17.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              level of Responsibility
            </button>

            <button
              className={`nav-tab ${activeTab === "skill-rating" ? "active" : ""}`}
              onClick={() => setActiveTab("skill-rating")}
            >
              <svg width="18" height="18" viewBox="0 0 31 30" fill="none">
                <path
                  d="M14.8255 2.86886C14.8803 2.75819 14.9649 2.66503 15.0698 2.59989C15.1747 2.53476 15.2958 2.50024 15.4192 2.50024C15.5427 2.50024 15.6638 2.53476 15.7687 2.59989C15.8736 2.66503 15.9582 2.75819 16.013 2.86886L18.9005 8.71761C19.0907 9.10257 19.3715 9.43562 19.7188 9.68818C20.066 9.94073 20.4694 10.1053 20.8942 10.1676L27.3517 11.1126C27.4741 11.1303 27.5891 11.182 27.6836 11.2616C27.7782 11.3413 27.8485 11.4458 27.8868 11.5634C27.925 11.6809 27.9296 11.8069 27.9 11.9269C27.8704 12.0469 27.8078 12.1563 27.7192 12.2426L23.0492 16.7901C22.7413 17.0902 22.5108 17.4607 22.3778 17.8696C22.2447 18.2786 22.2131 18.7137 22.2855 19.1376L23.388 25.5626C23.4096 25.6849 23.3964 25.8108 23.3499 25.926C23.3033 26.0411 23.2254 26.1409 23.1249 26.2139C23.0244 26.2868 22.9055 26.3301 22.7816 26.3387C22.6577 26.3474 22.5339 26.321 22.4242 26.2626L16.6517 23.2276C16.2714 23.0279 15.8482 22.9235 15.4186 22.9235C14.989 22.9235 14.5658 23.0279 14.1855 23.2276L8.41424 26.2626C8.30466 26.3206 8.18099 26.3467 8.05731 26.3379C7.93362 26.3291 7.81489 26.2858 7.71461 26.2129C7.61433 26.14 7.53653 26.0403 7.49006 25.9254C7.44359 25.8104 7.43031 25.6847 7.45174 25.5626L8.55299 19.1389C8.62574 18.7148 8.59422 18.2794 8.46116 17.8702C8.32811 17.461 8.0975 17.0903 7.78924 16.7901L3.11924 12.2439C3.02998 12.1577 2.96673 12.0481 2.93669 11.9277C2.90666 11.8073 2.91104 11.6809 2.94934 11.5628C2.98764 11.4448 3.05833 11.3399 3.15334 11.2601C3.24835 11.1803 3.36387 11.1287 3.48674 11.1114L9.94299 10.1676C10.3683 10.1057 10.7722 9.94143 11.12 9.68885C11.4677 9.43626 11.7489 9.10295 11.9392 8.71761L14.8255 2.86886Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Skill Rating
            </button>
          </div>
        </div>

      </div>

      {/* Action Icons Row */}
      <div className="action-row">
        <div className="toggle-container">
          <div
            className="toggle-switch"
            onClick={() => setToggleState(!toggleState)}
          >
            <div className={`switch-body ${toggleState ? "active" : ""}`}>
              <div className="switch-button"></div>
            </div>
          </div>
          <div className="list-view-section">
            <img src="List Icon.png" alt="List" />
            <span className="list-text">List View</span>
          </div>
        </div>

        <div className="action-icons">
          <button className="action-icon">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M5.625 12.5C5.625 8.70304 8.70304 5.625 12.5 5.625C16.297 5.625 19.375 8.70304 19.375 12.5C19.375 16.297 16.297 19.375 12.5 19.375C8.70304 19.375 5.625 16.297 5.625 12.5ZM12.5 3.75C7.66751 3.75 3.75 7.66751 3.75 12.5C3.75 17.3325 7.66751 21.25 12.5 21.25C14.5785 21.25 16.4878 20.5252 17.9889 19.3148L24.6496 25.9754C25.0157 26.3415 25.6093 26.3415 25.9754 25.9754C26.3415 25.6093 26.3415 25.0157 25.9754 24.6496L19.3148 17.9889C20.5252 16.4878 21.25 14.5785 21.25 12.5C21.25 7.66751 17.3325 3.75 12.5 3.75Z"
                fill="#383838"
              />
            </svg>
          </button>
          <button className="action-icon">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M27.5 3.75H2.5L12.5 15.575V23.75L17.5 26.25V15.575L27.5 3.75Z"
                stroke="#383838"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="action-icon">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M15 8.75C15.4945 8.75 15.9778 8.60338 16.3889 8.32868C16.8 8.05397 17.1205 7.66353 17.3097 7.20671C17.4989 6.7499 17.5484 6.24723 17.452 5.76228C17.3555 5.27732 17.1174 4.83187 16.7678 4.48223C16.4181 4.1326 15.9727 3.8945 15.4877 3.79804C15.0028 3.70157 14.5001 3.75108 14.0433 3.9403C13.5865 4.12952 13.196 4.44995 12.9213 4.86108C12.6466 5.2722 12.5 5.75555 12.5 6.25C12.5 6.91304 12.7634 7.54893 13.2322 8.01777C13.7011 8.48661 14.337 8.75 15 8.75ZM15 21.25C14.5055 21.25 14.0222 21.3966 13.6111 21.6713C13.2 21.946 12.8795 22.3365 12.6903 22.7933C12.5011 23.2501 12.4516 23.7528 12.548 24.2377C12.6445 24.7227 12.8826 25.1681 13.2322 25.5178C13.5819 25.8674 14.0273 26.1055 14.5123 26.202C14.9972 26.2984 15.4999 26.2489 15.9567 26.0597C16.4135 25.8705 16.804 25.5501 17.0787 25.1389C17.3534 24.7278 17.5 24.2445 17.5 23.75C17.5 23.087 17.2366 22.4511 16.7678 21.9822C16.2989 21.5134 15.663 21.25 15 21.25ZM15 12.5C14.5055 12.5 14.0222 12.6466 13.6111 12.9213C13.2 13.196 12.8795 13.5865 12.6903 14.0433C12.5011 14.5001 12.4516 15.0028 12.548 15.4877C12.6445 15.9727 12.8826 16.4181 13.2322 16.7678C13.5819 17.1174 14.0273 17.3555 14.5123 17.452C14.9972 17.5484 15.4999 17.4989 15.9567 17.3097C16.4135 17.1205 16.804 16.8001 17.0787 16.3889C17.3534 15.9778 17.5 15.4945 17.5 15C17.5 14.337 17.2366 13.7011 16.7678 13.2322C16.2989 12.7634 15.663 12.5 15 12.5Z"
                fill="#383838"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="header-ajit">
        <div className="header-section">
          <div className="header-background">
            <div className="profile-image-container">
              <img
                src="Ellipse 23.png"
                alt="Kavya Mehta"
                className="profile-image"
              />
            </div>
            <div className="header-content">
              <h1 className="user-name">Kavya Mehta</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          <div className="menu-item active">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M23.75 26.25V23.75C23.75 22.4239 23.2232 21.1521 22.2855 20.2145C21.3479 19.2768 20.0761 18.75 18.75 18.75H11.25C9.92392 18.75 8.65215 19.2768 7.71447 20.2145C6.77678 21.1521 6.25 22.4239 6.25 23.75V26.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 13.75C17.7614 13.75 20 11.5114 20 8.75C20 5.98858 17.7614 3.75 15 3.75C12.2386 3.75 10 5.98858 10 8.75C10 11.5114 12.2386 13.75 15 13.75Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Personal Details</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M17.29 20.71C17.5482 20.8286 17.839 20.8556 18.1146 20.7868C18.3902 20.718 18.6342 20.5573 18.8063 20.3312L19.25 19.75C19.4829 19.4395 19.7848 19.1875 20.132 19.0139C20.4791 18.8404 20.8619 18.75 21.25 18.75H25C25.663 18.75 26.2989 19.0134 26.7678 19.4822C27.2366 19.9511 27.5 20.587 27.5 21.25V25C27.5 25.663 27.2366 26.2989 26.7678 26.7678C26.2989 27.2366 25.663 27.5 25 27.5C19.0326 27.5 13.3097 25.1295 9.0901 20.9099C4.87053 16.6903 2.5 10.9674 2.5 5C2.5 4.33696 2.76339 3.70107 3.23223 3.23223C3.70107 2.76339 4.33696 2.5 5 2.5H8.75C9.41304 2.5 10.0489 2.76339 10.5178 3.23223C10.9866 3.70107 11.25 4.33696 11.25 5V8.75C11.25 9.13811 11.1596 9.5209 10.9861 9.86803C10.8125 10.2152 10.5605 10.5171 10.25 10.75L9.665 11.1888C9.43552 11.364 9.27377 11.6132 9.20724 11.8942C9.1407 12.1751 9.17348 12.4705 9.3 12.73C11.0084 16.1998 13.818 19.006 17.29 20.71Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Contact & Address</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M15 15H15.0125"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 7.5V5C20 4.33696 19.7366 3.70107 19.2678 3.23223C18.7989 2.76339 18.163 2.5 17.5 2.5H12.5C11.837 2.5 11.2011 2.76339 10.7322 3.23223C10.2634 3.70107 10 4.33696 10 5V7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.5 16.25C23.791 18.6987 19.4444 20.0041 15 20.0041C10.5556 20.0041 6.20901 18.6987 2.5 16.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25 7.5H5C3.61929 7.5 2.5 8.61929 2.5 10V22.5C2.5 23.8807 3.61929 25 5 25H25C26.3807 25 27.5 23.8807 27.5 22.5V10C27.5 8.61929 26.3807 7.5 25 7.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Employment Details</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M10 2.5V7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 2.5V7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.75 5H6.25C4.86929 5 3.75 6.11929 3.75 7.5V25C3.75 26.3807 4.86929 27.5 6.25 27.5H23.75C25.1307 27.5 26.25 26.3807 26.25 25V7.5C26.25 6.11929 25.1307 5 23.75 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.75 12.5H26.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Employment Status & History</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M18.75 2.5H7.5C6.83696 2.5 6.20107 2.76339 5.73223 3.23223C5.26339 3.70107 5 4.33696 5 5V25C5 25.663 5.26339 26.2989 5.73223 26.7678C6.20107 27.2366 6.83696 27.5 7.5 27.5H22.5C23.163 27.5 23.7989 27.2366 24.2678 26.7678C24.7366 26.2989 25 25.663 25 25V8.75L18.75 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 2.5V7.5C17.5 8.16304 17.7634 8.79893 18.2322 9.26777C18.7011 9.73661 19.337 10 20 10H25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Financial & Statutory info</span>
          </div>

          <div className="menu-item">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <path
                d="M20 26.25V23.75C20 22.4239 19.4732 21.1521 18.5355 20.2145C17.5979 19.2768 16.3261 18.75 15 18.75H7.5C6.17392 18.75 4.90215 19.2768 3.96447 20.2145C3.02678 21.1521 2.5 22.4239 2.5 23.75V26.25"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 3.91016C21.0722 4.18812 22.0217 4.81424 22.6996 5.69023C23.3775 6.56623 23.7452 7.64252 23.7452 8.75016C23.7452 9.85779 23.3775 10.9341 22.6996 11.8101C22.0217 12.6861 21.0722 13.3122 20 13.5902"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.5 26.2501V23.7501C27.4992 22.6423 27.1304 21.5661 26.4517 20.6905C25.773 19.8149 24.8227 19.1896 23.75 18.9126"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.25 13.75C14.0114 13.75 16.25 11.5114 16.25 8.75C16.25 5.98858 14.0114 3.75 11.25 3.75C8.48858 3.75 6.25 5.98858 6.25 8.75C6.25 11.5114 8.48858 13.75 11.25 13.75Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Reporting & Attendance</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-content">
          <h2 className="section-title">Personal information</h2>
          <div className="title-underline"></div>

          <div className="form-grid">
            <div className="form-row">
              <div className="input-field">
                <input type="text" placeholder="First Name" />
              </div>
              <div className="input-field">
                <input type="text" placeholder="Middle Name" />
              </div>
            </div>

            <div className="form-row">
              <div className="input-field">
                <input type="text" placeholder="Last Name" />
              </div>
              <div className="input-field">
                <input type="text" placeholder="User Name" />
              </div>
            </div>

            <div className="form-row">
              <div className="input-field">
                <input type="email" placeholder="Email Address" />
              </div>
              <div className="input-field">
                <input type="tel" placeholder="Mobile Number" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
