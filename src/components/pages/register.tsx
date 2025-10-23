import React from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../AuthCard";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const apiSignup = async (values: Record<string,string>) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include',
    });
    let json: any = {};
    try {
      json = await res.json();
    } catch (e) {
      json = {};
    }
    if (res.ok) {
      // auto login: call login endpoint to set session cookie if backend requires explicit login
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      navigate('/');
      return { ok: true };
    }
    return { ok: false, message: json.error_message || json.message };
  };

  return (
    <AuthCard
      title="新規登録"
      fields={[{ name: 'username', label: 'ユーザー名' }, { name: 'password', label: 'パスワード', type: 'password' }]}
      submitLabel="登録"
      onSubmit={apiSignup}
    />
  );
};

export default Register;
