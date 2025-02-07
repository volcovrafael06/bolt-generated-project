import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      onLogin('admin');
    } else if (username === 'vendedor' && password === 'vendedor') {
      onLogin('vendedor');
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    onLogin(null); // This should probably clear the user, not set to null
  };

  return (
    <div>
      <h2>Login</h2>
      <div className="form-group">
        <label>Usuário</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
        />
      </div>
      <div className="form-group">
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />
      </div>
      <button onClick={handleLogin}>Entrar</button>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default Login;
