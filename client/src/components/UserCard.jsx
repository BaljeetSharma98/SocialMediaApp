import React from 'react'
import { dummyUserData } from '../assets/assets'
import { MapPin, UserPlus, MessageCircle, Plus } from 'lucide-react'

const UserCard = ({ user }) => {
  const currentUser = dummyUserData

  const handleFollow = async () => {
    // follow logic here
  }

  const handleConnectionRequest = async () => {
    // connection request logic here
  }

  return (
    <div
      key={user._id}
      className='p-4 pt-6 flex flex-col justify-between w-80 shadow border border-gray-200 rounded-md hover:shadow-lg transition'
    >
      <div className='text-center'>
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className='rounded-full w-16 h-16 shadow-md mx-auto object-cover'
        />
        <p className='mt-4 font-semibold text-lg'>{user.full_name}</p>
        {user.username && (
          <p className='text-gray-500 font-light'>@{user.username}</p>
        )}
        {user.bio && (
          <p className='text-gray-600 mt-2 text-center text-sm px-4'>
            {user.bio}
          </p>
        )}

        {/* Location & Followers in one line */}
        <div className='flex items-center justify-center gap-4 mt-4 text-xs text-gray-600'>
          {user.location && (
            <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
              <MapPin className='w-4 h-4' /> {user.location}
            </div>
          )}
          {user.followers && (
            <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
              <span>{user.followers.length}</span> Followers
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className='flex gap-2 mt-4 justify-center'>
          {/* Follow Button */}
          <button
            onClick={handleFollow}
            disabled={currentUser?.following.includes(user._id)}
            className='flex-1 py-2 rounded-md flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <UserPlus className='w-4 h-4' />
            {currentUser?.following.includes(user._id) ? 'Following' : 'Follow'}
          </button>

          {/* Connection / Message Button */}
          <button
            onClick={handleConnectionRequest}
            className='w-16 flex items-center justify-center border text-slate-500 rounded-md cursor-pointer active:scale-95 transition hover:bg-gray-100'
          >
            {currentUser?.connections.includes(user._id) ? (
              <MessageCircle className='w-5 h-5' />
            ) : (
              <Plus className='w-5 h-5' />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserCard
