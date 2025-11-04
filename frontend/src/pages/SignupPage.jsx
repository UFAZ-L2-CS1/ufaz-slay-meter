import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function SignupPage() {
  const { handleRegister } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await handleRegister(name, email, password)
      nav('/profile', { replace: true })
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="card">
      <h2>Sign up</h2>
      <form onSubmit={onSubmit}>
        <div className="spacer"></div>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Aniya" />
        <div className="spacer"></div>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@ufaz.az" />
        <div className="spacer"></div>
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
        <div className="spacer"></div>
        {error && <div style={{color:'#ff6b6b'}}>{error}</div>}
        <button className="btn" type="submit">Create account</button>
      </form>
      <div className="spacer"></div>
      <div>Already have an account? <Link to="/login">Login</Link></div>
    </div>
  )
}
