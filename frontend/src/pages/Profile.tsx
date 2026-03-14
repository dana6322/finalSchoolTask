import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Post } from "../types";
import api from "../services/api";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "posts">("profile");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.userName || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user?._id) return;
    setLoadingPosts(true);
    try {
      const response = await api.get("/post");
      // Filter posts by current user
      const filteredPosts = response.data.filter(
        (post: Post) =>
          (typeof post.sender === "object" && post.sender._id === user._id) ||
          post.sender === user._id
      );
      // Sort by createdAt descending (most recent first)
      const sortedPosts = filteredPosts.sort((a: Post, b: Post) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setUserPosts(sortedPosts);
    } catch (err) {
      console.error("Failed to fetch user posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleTabChange = (tab: "profile" | "posts") => {
    setActiveTab(tab);
    if (tab === "posts") {
      fetchUserPosts();
    }
  };

  if (!token) {
    navigate("/login");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await api.put(`/user/${user?._id}`, {
        userName,
        firstName,
        lastName,
        profilePicture,
      });
      setMessage("Profile updated successfully");
      setIsEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/changePassword", {
        currentPassword,
        newPassword,
      });
      setMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {user && (
          <div className="col-lg-8 mx-auto">
            <h2 className="mb-4">My Profile</h2>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => handleTabChange("profile")}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "profile"}
                >
                  Profile Info
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "posts" ? "active" : ""}`}
                  onClick={() => handleTabChange("posts")}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "posts"}
                >
                  My Posts
                </button>
              </li>
            </ul>

            {message && (
              <div className="alert alert-success" role="alert">
                {message}
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {activeTab === "profile" && (
              <>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Profile Information</h5>
                {!isEditing ? (
                  <>
                    {profilePicture && (
                      <div className="mb-3">
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="img-thumbnail"
                          style={{
                            maxWidth: "150px",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                      <strong>Username:</strong> {userName || "Not set"}
                    </p>
                    <p>
                      <strong>First Name:</strong>{" "}
                      {firstName || "Not set"}
                    </p>
                    <p>
                      <strong>Last Name:</strong>{" "}
                      {lastName || "Not set"}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={user?.email}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="userName" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="firstName" className="form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="lastName" className="form-label">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="profilePicture" className="form-label">
                        Profile Picture URL
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        id="profilePicture"
                        value={profilePicture || ""}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      {profilePicture && (
                        <img
                          src={profilePicture}
                          alt="Preview"
                          className="mt-2 img-thumbnail"
                          style={{
                            maxWidth: "150px",
                            height: "150px",
                            objectFit: "cover",
                          }}
                          onError={() => setError("Invalid image URL")}
                        />
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success me-2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Change Password</h5>
                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning"
                    disabled={isLoading}
                  >
                    {isLoading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
              </>
            )}

            {activeTab === "posts" && (
              <div>
                {loadingPosts ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading posts...</span>
                    </div>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="alert alert-info">
                    You haven't created any posts yet. Start sharing your thoughts!
                  </div>
                ) : (
                  <div>
                    {userPosts.map((post) => (
                      <PostCard 
                        key={post._id} 
                        post={post}
                        currentUserId={user._id}
                        onPostDeleted={() => fetchUserPosts()}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
