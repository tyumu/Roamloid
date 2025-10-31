import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserPlus } from 'react-icons/fa';

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        if (!username || !password) {
            setMessage("ユーザー名とパスワードを入力してください。");
            return;
        }
        if (password !== confirm) {
            setMessage("パスワードが一致しません。");
            return;
        }
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("サインアップ成功！ログインページへ移動します。");
                setTimeout(() => navigate("/login"), 1200);
            } else {
                setMessage(data.error_message || "サインアップに失敗しました。");
            }
        } catch {
            setMessage("通信エラーが発生しました。");
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #39C5BB 0%, #e8e8e8 150%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                width: '100%',
                maxWidth: '400px',
                animation: 'slideInUp 0.6s ease-out'
            }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#333',
                    fontSize: '28px',
                    fontWeight: 'bold'
                }}>Sign Up</h2>
                <form style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSignup}>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <FaUser style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#39C5BB'
                        }} />
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#39C5BB'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <FaLock style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#39C5BB'
                        }} />
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#39C5BB'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>
                    <div style={{ position: 'relative', marginBottom: '30px' }}>
                        <FaLock style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#39C5BB'
                        }} />
                        <input
                            type="password"
                            id="confirm"
                            placeholder="Confirm password"
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                border: '1px solid #ddd',
                                borderRadius: '10px',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border-color 0.3s',
                                boxSizing: 'border-box'
                            }}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#39C5BB'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #39C5BB, #00ACC1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(57,197,187,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(57,197,187,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(57,197,187,0.3)';
                        }}
                    >
                        <FaUserPlus style={{ marginRight: '8px' }} />
                        Sign Up
                    </button>
                </form>
                {message && (
                    <p style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        color: message.includes('成功') ? '#4caf50' : '#f44336',
                        fontWeight: 'bold',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>{message}</p>
                )}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ margin: '10px 0', color: '#666' }}>
                        すでにアカウントをお持ちですか？{' '}
                        <Link to="/login" style={{
                            color: '#39C5BB',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            transition: 'color 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#00ACC1'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#39C5BB'}
                        >Login here</Link>
                    </p>
                </div>
            </div>
            <style>{`
                @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default Signup;