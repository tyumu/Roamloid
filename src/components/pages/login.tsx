import React, { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import AuthCard from "../AuthCard";

const Login: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const handleHeroLoginClick = () => {
        setShowForm(s => !s);
    };

    const apiLogin = async (values: Record<string,string>) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
            credentials: 'include', // include session cookie
        });
        let json: any = {};
        try {
            json = await res.json();
        } catch (e) {
            // response had no JSON body
            json = {};
        }
        if (res.ok) {
            // on success, navigate to home
            navigate('/');
            return { ok: true };
        }
        return { ok: false, message: json.error_message || json.message };
    };

    return (
        <div className="login-root">
            <div className="login-panel">
                <div className="hero-actions">
                    <button className="hero-btn" onClick={handleHeroLoginClick}>ログイン</button>
                    <Link to="/register" className="hero-btn">新規登録</Link>
                </div>

                {showForm && (
                    <AuthCard
                        title="ログイン"
                        fields={[{ name: 'username', label: 'ユーザー名' }, { name: 'password', label: 'パスワード', type: 'password' }]}
                        submitLabel="ログイン"
                        onSubmit={apiLogin}
                    />
                )}
            </div>
        </div>
    );
};

export default Login;