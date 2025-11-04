  import React from 'react'
  import { useAuth } from '../context/AuthContext.jsx'

  export default function ProfilePage() {
    const { user } = useAuth()
    return (
      <div className="card">
        <h2>My Profile</h2>
        {user ? (
          <pre style={{whiteSpace:'pre-wrap', background:'#0f0f18', padding:'12px', borderRadius:'12px', border:'1px solid #2d2d45'}}>
{JSON.stringify(user, null, 2)}
          </pre>
        ) : (
          <div>No user loaded</div>
        )}
      </div>
    )
  }
