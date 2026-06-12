"use client"
import React, { useState } from 'react'
import UserLogin from './UserLogin'

export default function page() {
    return (
        <div className="relative overflow-hidden bg-[#c4c4c445]" >

            {/* Overlay content */}
            <div className="relative z-10 flex items-center justify-center text-white app-bg">
                <div className='w-full flex items-center justify-center'>
                    <UserLogin />
                </div>
            </div>
        </div>

    )
}
