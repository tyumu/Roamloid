import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const API_URL = "http://localhost:5000";

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("ログイン成功！");
        navigate("/app");
      } else {
        setMessage(data.error_message || "ログインに失敗しました。");
      }
    } catch (err) {
      setMessage("通信エラーが発生しました。");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <h2>Login Page</h2>
      <form style={{ display: "flex", flexDirection: "column", width: "300px" }} onSubmit={handleLogin}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          placeholder="Enter your username"
          style={{ marginBottom: "10px", padding: "8px" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          style={{ marginBottom: "20px", padding: "8px" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <p style={{ marginTop: "20px" }}>
        Don't have an account? <Link to="/register">Sign up here</Link>
      </p>
  <Link to="/app">Go to Home</Link>
    </div>
  );
};

export default Login;
