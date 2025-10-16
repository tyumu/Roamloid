import React from "react";
import {Link} from "react-router-dom";
const Login = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
            <h2>Login Page</h2>
            <form style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
                <label htmlFor="email">Email:</label>
                <input type="text" id="email" placeholder="Enter your email" style={{ marginBottom: '10px', padding: '8px' }} />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" placeholder="Enter your password" style={{ marginBottom: '20px', padding: '8px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
            </form>
            <p style={{ marginTop: '20px' }}>Don't have an account? <Link to="/register">Sign up here</Link></p>
            <Link to="/">Go to Home</Link>
        </div>
    );
};

export default Login;