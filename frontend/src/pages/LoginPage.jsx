import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { handleLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()
  const loc = useLocation()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await handleLogin(email, password)
      const dest = loc.state?.from?.pathname || '/profile'
      nav(dest, { replace: true })
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div className="spacer"></div>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@ufaz.az" />
        <div className="spacer"></div>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        <div className="spacer"></div>
        {error && <div style={{color:'#ff6b6b'}}>{error}</div>}
        <button className="btn" type="submit">Sign in</button>
      </form>
      <div className="spacer"></div>
      <div>New here? <Link to="/signup">Create an account</Link></div>
    </div>
  )
}
