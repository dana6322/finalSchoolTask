import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Post, User } from "../types";
import api from "../services/api";
import PostCard from "../components/PostCard";
import ImageUpload from "../components/ImageUpload";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser, logout, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  // The profile being viewed (could be another user or the logged-in user)
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isOwnProfile = !userId || userId === loggedInUser?._id;

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const handleProfileFileSelect = (file: File) => {
    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
  };

  const removeProfileImage = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview("");
    setProfilePicture("");
  };

  // Fetch the profile user's data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        if (isOwnProfile && loggedInUser) {
          setProfileUser(loggedInUser);
        } else if (userId) {
          const response = await api.get(`/user/${userId}`);
          setProfileUser(response.data);
        }
      } catch {
        setError("Failed to load user profile");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [userId, loggedInUser, isOwnProfile]);

  // Sync edit fields when profileUser changes
  useEffect(() => {
    if (profileUser) {
      setUserName(profileUser.userName || "");
      setProfilePicture(profileUser.profilePicture || "");
    }
  }, [profileUser]);

  // Fetch this user's posts
  useEffect(() => {
    if (!profileUser?._id) return;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const response = await api.get("/post");
        const targetId = profileUser._id;
        const filteredPosts = response.data.filter(
          (post: Post) =>
            (typeof post.sender === "object" && post.sender._id === targetId) ||
            post.sender === targetId,
        );
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
    fetchPosts();
  }, [profileUser?._id]);

  const fetchUserPosts = async () => {
    if (!profileUser?._id) return;
    setLoadingPosts(true);
    try {
      const response = await api.get("/post");
      const targetId = profileUser._id;
      const filteredPosts = response.data.filter(
        (post: Post) =>
          (typeof post.sender === "object" && post.sender._id === targetId) ||
          post.sender === targetId,
      );
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
      let updatedProfilePicture = profilePicture;

      // If a new file was selected, upload it first
      if (profilePictureFile) {
        const formData = new FormData();
        formData.append("file", profilePictureFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "image/jpeg" },
        });
        updatedProfilePicture = uploadRes.data.url;
        setProfilePicture(updatedProfilePicture);
      }

      await api.put(`/user/${loggedInUser?._id}`, {
        userName,
        profilePicture: updatedProfilePicture,
      });
      setMessage("Profile updated successfully");
      setIsEditing(false);
      setProfilePictureFile(null);
      setProfilePicturePreview("");
      // Refresh the logged-in user context so changes reflect everywhere
      await refreshUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loadingProfile) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">User not found.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Profile Header */}
          <div className="card mb-4">
            <div className="card-body text-center">
              {/* Profile Picture */}
              <div className="mb-3">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      border: "3px solid #dee2e6",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center"
                    style={{ width: "150px", height: "150px" }}
                  >
                    <span className="text-white" style={{ fontSize: "3rem" }}>
                      {(profileUser.userName || profileUser.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="mb-1">{profileUser.userName || "Unknown User"}</h3>
              <p className="text-muted mb-2">{profileUser.email}</p>

              {isOwnProfile && !isEditing && (
                <button
                  className="btn btn-outline-primary btn-sm mt-2"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>

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

          {/* Edit Form (own profile only) */}
          {isOwnProfile && isEditing && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Edit Profile</h5>
                <form onSubmit={handleUpdateProfile}>
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
                    <label className="form-label">Profile Picture</label>
                    <ImageUpload
                      preview={profilePicturePreview || profilePicture}
                      onFileSelect={handleProfileFileSelect}
                      onRemove={removeProfileImage}
                      shape="circle"
                    />
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
                    onClick={() => {
                      setIsEditing(false);
                      setProfilePictureFile(null);
                      setProfilePicturePreview("");
                      setUserName(profileUser.userName || "");
                      setProfilePicture(profileUser.profilePicture || "");
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* User's Posts */}
          <h5 className="mb-3">
            {isOwnProfile
              ? "My Posts"
              : `Posts by ${profileUser.userName || "this user"}`}
          </h5>

          {loadingPosts ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading posts...</span>
              </div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="alert alert-info">
              {isOwnProfile
                ? "You haven't created any posts yet. Start sharing your thoughts!"
                : "This user hasn't created any posts yet."}
            </div>
          ) : (
            <div>
              {userPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={loggedInUser?._id || ""}
                  onPostDeleted={() => fetchUserPosts()}
                />
              ))}
            </div>
          )}

          {/* Logout (own profile only) */}
          {isOwnProfile && (
            <div className="card mt-4 mb-4">
              <div className="card-body">
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
