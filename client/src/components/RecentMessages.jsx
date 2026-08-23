import React, { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import moment from 'moment'

const RecentMessages = () => {
    const { recentMessages: messages, fetchRecentMessages, currentUser } = useApp()

    useEffect(()=>{
        fetchRecentMessages()
    },[])

  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
        <h3 className='font-semibold text-slate-8 mb-4'>Recent Messages</h3>
        <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
            {
                messages.map((message,index)=>{
                    const partner = message.from_user_id?._id === currentUser?._id ? message.to_user_id : message.from_user_id;
                    if (!partner) return null;
                    return (
                        <Link to={`/messages/${partner._id}`} key={index} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
                            <img src={partner.profile_picture} alt="" className='w-8 h-8 rounded-full object-cover'/>
                            <div className='w-full'>
                                <div className='flex justify-between'>
                                    <p className='font-medium'>{partner.full_name}</p>
                                    <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()} </p>
                                </div>
                                <div className='flex justify-between'>
                                    <p className='text-gray-500 truncate max-w-[120px]'>{message.text ? message.text : 'Media'}</p>
                                    {(!message.seen && message.to_user_id === currentUser?._id) && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                                </div>
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    </div>
  )
}

export default RecentMessages