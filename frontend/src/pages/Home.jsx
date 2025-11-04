import React from 'react'
export default function Home() {
  return (
    <div className="card">
      <h1>Welcome ✨</h1>
      <ul>
        <li>Public route: Home</li>
        <li>Auth routes: Login / Signup</li>
        <li>Protected route: Profile (requires JWT)</li>
      </ul>
    </div>
  )
}
