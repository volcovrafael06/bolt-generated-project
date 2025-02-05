import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    // Basic authentication logic (replace with real auth later)
    let role = null;
    if (username === 'admin' && password === 'admin') {
      role = 'admin';
    } else if (username === 'vendedor' && password === 'vendedor') {
      role = 'vendedor';
    }

    if (role) {
      onLogin({ role: role, username: username });
      navigate(`/${role}`); // Redirect based on role
    }
     else {
      alert('Credenciais inválidas')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default Login
