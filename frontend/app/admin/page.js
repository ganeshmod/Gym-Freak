"use client"
import React, { useState } from 'react'
import Signup from './(auth)/signup'
import Login from './(auth)/login'

// ----## agar admin logged in nhi h to /admin/login pr le jao ##_---


// ----## agar admin logged in h to /admin/dashboard  pr le jao ##_---


export default function page() {
  const [pagetoggle, setPageToggle] = useState(0)
  return (
    <div>
      {pagetoggle == 0 ?
        <Login pagetoggle={pagetoggle} setPageToggle={setPageToggle} /> :
        <Signup pagetoggle={pagetoggle} setPageToggle={setPageToggle} />
      }
    </div>
  )
}
