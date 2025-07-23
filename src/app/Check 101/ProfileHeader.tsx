import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = () => {
    return (
        <div className="profile-header">
            <div className="profile-pic">
                <img
                    src="https://via.placeholder.com/80" // Replace with actual image URL
                    alt="Profile"
                />
            </div>
            <div className="profile-info">
                <h2 className="profile-name">Kavya Mehta</h2>
                <div className="line-with-dot">
                    <span className="dot"></span>
                    <span className="line"></span>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;