import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      onLogin('admin');
      setLoginError(''); // Clear any previous error message
    } else if (username === 'vendedor' && password === 'vendedor') {
      onLogin('vendedor');
      setLoginError(''); // Clear any previous error message
    } else {
      setLoginError('Credenciais inválidas');
    }
  };

  const handleLogout = () => {
    onLogin(null);
  };

  return (
    <div>
      <h2>Login</h2>
      {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
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
