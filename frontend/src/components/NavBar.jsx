import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NavBar() {
  const { user, handleLogout } = useAuth()
  const nav = useNavigate()
  return (
    <div className="row" style={{justifyContent:'space-between', marginTop: 16, marginBottom: 24}}>
      <Link to="/" style={{fontWeight:700, letterSpacing:0.5}}>UFAZ Slay Meter</Link>
      <div className="row" style={{gap:12}}>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button className="btn secondary" onClick={async () => { await handleLogout(); nav('/login') }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </div>
  )
}
