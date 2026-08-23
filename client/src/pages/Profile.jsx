import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import ProfileModal from "../components/ProfileModal";
import moment from "moment";

const Profile = () => {
  const { profileId } = useParams();
  const { currentUser, feedPosts, fetchFeed, fetchUserProfileById } = useApp();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const fetchUser = async () => {
    if (!profileId) {
      setUser(currentUser);
    } else {
      try {
        const otherUser = await fetchUserProfileById(profileId);
        setUser(otherUser);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchUser();
    fetchFeed();
  }, [profileId, currentUser]);

  const posts = feedPosts.filter(
    (post) => post.user?._id === (profileId || currentUser?._id)
  );

  return user ? (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Media */}
          {activeTab === "media" && (
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) =>
                  post.image_urls.map((image, index) => (
                    <Link
                      to={image}
                      target="_blank"
                      key={`${post._id}-${index}`}
                      className="relative group"
                    >
                      <img
                        src={image}
                        alt=""
                        className="w-64 aspect-video object-cover rounded-lg"
                      />
                      <p className="absolute bottom-0 right-0 text-xs px-3 py-1 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition">
                        Posted {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  ))
                )}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
