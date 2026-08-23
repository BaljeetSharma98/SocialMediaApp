import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { getToken, userId } = useAuth();
  const { user: clerkUser } = useUser();

  const [currentUser, setCurrentUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [connectionsData, setConnectionsData] = useState({
    followers: [],
    following: [],
    connections: [],
    pending: [],
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // Generic fetcher that automatically includes Clerk's Auth Token
  const apiFetch = async (endpoint, options = {}) => {
    const token = await getToken();
    const headers = {
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${backendUrl}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  // 1. Fetch Logged-in User Profile
  const fetchProfile = async () => {
    if (!userId) return;
    try {
      setLoadingProfile(true);
      const data = await apiFetch("/api/users/profile");
      setCurrentUser(data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 2. Fetch User Profile by ID (public/others)
  const fetchUserProfileById = async (profileId) => {
    try {
      const data = await apiFetch(`/api/users/profile/${profileId}`);
      return data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  // 3. Update User Profile
  const updateProfile = async (formData) => {
    try {
      const data = await apiFetch("/api/users/update", {
        method: "POST",
        body: formData, // FormData containing name, username, bio, location, profile, cover
      });
      setCurrentUser(data.user);
      toast.success("Profile updated successfully!");
      return data.user;
    } catch (error) {
      toast.error(error.message || "Could not update profile");
      throw error;
    }
  };

  // 4. Fetch Posts for Feed
  const fetchFeed = async () => {
    try {
      const data = await apiFetch("/api/posts/feed");
      setFeedPosts(data.posts);
    } catch (error) {
      console.error("Error fetching feed posts:", error);
    }
  };

  // 5. Create new Post
  const createPost = async (content, images) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      images.forEach((img) => {
        formData.append("images", img);
      });

      const data = await apiFetch("/api/posts/create", {
        method: "POST",
        body: formData,
      });
      setFeedPosts((prev) => [data.post, ...prev]);
      return data.post;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  // 6. Like/Unlike Post
  const likePost = async (postId) => {
    try {
      const data = await apiFetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      // Update locally
      setFeedPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes_count: data.likes_count } : p))
      );
      // Update in currentUser posts if relevant
      if (currentUser) {
        // Just triggers feed refresh or updates local arrays
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // 7. Fetch active Stories
  const fetchStories = async () => {
    try {
      const data = await apiFetch("/api/stories");
      setStories(data.stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  // 8. Create Story
  const createStory = async (formData) => {
    try {
      const data = await apiFetch("/api/stories/create", {
        method: "POST",
        body: formData, // FormData containing content, background_color, and/or media
      });
      setStories((prev) => [data.story, ...prev]);
      return data.story;
    } catch (error) {
      console.error("Error creating story:", error);
      throw error;
    }
  };

  // 9. Fetch Connections data
  const fetchConnections = async () => {
    try {
      const data = await apiFetch("/api/users/connections-data");
      setConnectionsData({
        followers: data.followers,
        following: data.following,
        connections: data.connections,
        pending: data.pending,
      });
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  // 10. Follow / Unfollow User
  const followUser = async (targetUserId) => {
    try {
      const data = await apiFetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });
      // Refresh current user and connections
      await fetchProfile();
      await fetchConnections();
      toast.success(data.isFollowing ? "Followed user" : "Unfollowed user");
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // 11. Request or Accept Connection
  const connectUser = async (targetUserId) => {
    try {
      const data = await apiFetch(`/api/users/${targetUserId}/connect`, {
        method: "POST",
      });
      await fetchProfile();
      await fetchConnections();
      toast.success(data.message);
    } catch (error) {
      console.error("Error connecting with user:", error);
    }
  };

  // 12. Accept connection specifically
  const acceptConnection = async (targetUserId) => {
    try {
      await apiFetch(`/api/users/${targetUserId}/accept-connection`, {
        method: "POST",
      });
      await fetchProfile();
      await fetchConnections();
      toast.success("Connection accepted!");
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  // 13. Search users for discovery
  const searchUsers = async (searchQuery) => {
    try {
      const data = await apiFetch(`/api/users/discover?search=${encodeURIComponent(searchQuery)}`);
      return data.users;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  // 14. Fetch recent messages
  const fetchRecentMessages = async () => {
    try {
      const data = await apiFetch("/api/messages/recent");
      setRecentMessages(data.recentMessages);
    } catch (error) {
      console.error("Error fetching recent messages:", error);
    }
  };

  // 15. Fetch chat history
  const fetchChatHistory = async (partnerId) => {
    try {
      const data = await apiFetch(`/api/messages/${partnerId}`);
      return data.messages;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  };

  // 16. Send message
  const sendMessage = async (toUserId, text, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("to_user_id", toUserId);
      formData.append("text", text);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const data = await apiFetch("/api/messages/send", {
        method: "POST",
        body: formData,
      });
      // Refresh recent messages
      await fetchRecentMessages();
      return data.message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Auto fetch user profile when Clerk Auth state is resolved
  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setCurrentUser(null);
      setLoadingProfile(false);
    }
  }, [userId, clerkUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        feedPosts,
        stories,
        connectionsData,
        recentMessages,
        loadingProfile,
        fetchProfile,
        fetchUserProfileById,
        updateProfile,
        fetchFeed,
        createPost,
        likePost,
        fetchStories,
        createStory,
        fetchConnections,
        followUser,
        connectUser,
        acceptConnection,
        searchUsers,
        fetchRecentMessages,
        fetchChatHistory,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
