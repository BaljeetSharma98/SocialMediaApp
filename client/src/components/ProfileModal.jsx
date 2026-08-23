import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Pencil } from "lucide-react";

const ProfileModal = ({ setShowEdit }) => {
  const { currentUser: user, updateProfile } = useApp();

  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profile_picture: null,
    cover_photo: null,
    full_name: user?.full_name || "",
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("full_name", editForm.full_name);
      formData.append("username", editForm.username);
      formData.append("bio", editForm.bio);
      formData.append("location", editForm.location);
      if (editForm.profile_picture) {
        formData.append("profile", editForm.profile_picture);
      }
      if (editForm.cover_photo) {
        formData.append("cover", editForm.cover_photo);
      }
      await updateProfile(formData);
      setShowEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <form className="space-y-4" onSubmit={handleSaveProfile}>
            {/* Profile Picture */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Profile Picture
              </label>

              <div className="relative w-24 h-24 group">
                <img
                  src={
                    editForm.profile_picture
                      ? URL.createObjectURL(editForm.profile_picture)
                      : user.profile_picture
                  }
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Pencil className="w-5 h-5 text-white" />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      profile_picture: e.target.files[0],
                    })
                  }
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Cover Photo
              </label>

              <div className="relative w-full h-40 group">
                <img
                  src={
                    editForm.cover_photo
                      ? URL.createObjectURL(editForm.cover_photo)
                      : user.cover_photo
                  }
                  alt="cover"
                  className="w-full h-40 rounded-lg object-cover bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"
                />

                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Pencil className="w-5 h-5 text-white" />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      cover_photo: e.target.files[0],
                    })
                  }
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Please enter your full name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    full_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Please enter your username"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    username: e.target.value,
                  })
                }
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg resize-none"
                placeholder="Please enter your short bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    bio: e.target.value,
                  })
                }
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Please enter your location"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    location: e.target.value,
                  })
                }
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
