import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { getProfile, updateProfile, changePassword } from '../api/api';
import './Profile.css';

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone_number: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [passwordFields, setPasswordFields] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false); // State for password section collapse

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user) {
                    navigate('/login');
                    return;
                }
                const data = await getProfile();
                setProfileData(data);
            } catch (err) {
                setError('Failed to load profile information.');
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordFields(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        const fetchProfileAgain = async () => {
            try {
                const data = await getProfile();
                setProfileData(data);
            } catch (err) {
                setError('Failed to reload profile information.');
                console.error("Error refetching profile:", err);
            }
        };
        fetchProfileAgain();
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const updatedData = await updateProfile(profileData);
            setUser(updatedData);
            setEditMode(false);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
            console.error("Error updating profile:", err);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
            setError("New password and confirm password do not match.");
            return;
        }
        try {
            await changePassword(passwordFields);
            setMessage('Password changed successfully!');
            setPasswordFields({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            setIsPasswordSectionOpen(false); // Close password section after successful change
        } catch (err) {
            setError(err.message || 'Failed to change password.');
            console.error("Error changing password:", err);
        }
    };

    const togglePasswordSection = () => {
        setIsPasswordSectionOpen(!isPasswordSectionOpen);
    };


   // ... (keep existing imports and logic the same)

return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Account</h1>
      </div>
  
      {error && <div className="profile-alert error">{error}</div>}
      {message && <div className="profile-alert success">{message}</div>}
  
      <div className="profile-section">
      <div className="section-header">
        <h2>{editMode ? 'Edit Account' : 'Account Details'}</h2>
        {!editMode && (
          <button className="btn-edit" onClick={handleEditClick}>
            Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          {editMode ? (
            <input type="text" name="name" value={profileData.name} 
                   onChange={handleInputChange} required />
          ) : (
            <div className="profile-value highlight-box">{profileData.name}</div>
          )}
        </div>

        <div className="form-group">
          <label>Email Address</label>
          {editMode ? (
            <input type="email" name="email" value={profileData.email} 
                   onChange={handleInputChange} required />
          ) : (
            <div className="profile-value highlight-box">{profileData.email}</div>
          )}
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          {editMode ? (
            <input type="tel" name="phone_number" 
                   value={profileData.phone_number} onChange={handleInputChange} />
          ) : (
            <div className="profile-value highlight-box">
              {profileData.phone_number || '-'}
            </div>
          )}
        </div>

        {editMode && (
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button type="button" className="btn-secondary" 
                    onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  
      <div className="profile-section">
        <div className="section-header collapsible" onClick={togglePasswordSection}>
          <h2>Change Password</h2>
          <span className={`toggle-icon ${isPasswordSectionOpen ? 'open' : ''}`}></span>
        </div>
        
        <form onSubmit={handleChangePassword} 
              className={`password-form ${isPasswordSectionOpen ? 'open' : ''}`}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" name="currentPassword" 
                   value={passwordFields.currentPassword} onChange={handlePasswordChange} required />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input type="password" name="newPassword" 
                   value={passwordFields.newPassword} onChange={handlePasswordChange} required />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" name="confirmNewPassword" 
                   value={passwordFields.confirmNewPassword} onChange={handlePasswordChange} required />
          </div>
          
          <button type="submit" className="btn-primary">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;