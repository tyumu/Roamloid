import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("パスワードが一致しません。");
      return;
    }

    const API_URL = "http://localhost:5000";

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("登録に成功しました。");
        navigate("/login");
      } else {
        setMessage(data.error_message || "登録に失敗しました。");
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
      <h2>Register Page</h2>
      <form style={{ display: "flex", flexDirection: "column", width: "300px" }} onSubmit={handleRegister}>
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
          style={{ marginBottom: "10px", padding: "8px" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          style={{ marginBottom: "20px", padding: "8px" }}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <p style={{ marginTop: "20px" }}>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
  <Link to="/app">Go to Home</Link>
    </div>
  );
};

export default Register;
