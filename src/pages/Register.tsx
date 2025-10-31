import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaUserPlus } from "react-icons/fa";
import { AuthApi } from "../utils/api";

const Register = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");

		if (!username || !password) {
			setMessage("ユーザー名とパスワードを入力してください。");
			return;
		}

		if (password !== confirmPassword) {
			setMessage("パスワードが一致しません。");
			return;
		}

			try {
				// Prefer /signup per backend spec (both /signup and /register are allowed)
				const { ok, data } = await AuthApi.signup(username, password);

				if (ok) {
				setMessage("登録に成功しました。ログインページへ移動します。");
				setTimeout(() => navigate("/login"), 750);
			} else {
					setMessage((data as any)?.error_message || "登録に失敗しました。");
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
				background: "linear-gradient(135deg, #39C5BB 0%, #e8e8e8 140%)",
				fontFamily: "'Inter', sans-serif",
			}}
		>
			<div
				style={{
					background: "rgba(255, 255, 255, 0.95)",
					padding: "40px",
					borderRadius: 24,
					boxShadow: "0 14px 40px rgba(0, 0, 0, 0.18)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.35)",
					width: "100%",
					maxWidth: 420,
					animation: "slideIn 0.6s ease",
				}}
			>
				<h2
					style={{
						textAlign: "center",
						marginBottom: 30,
						color: "#333",
						fontSize: 28,
						fontWeight: 700,
					}}
				>
					Sign Up
				</h2>
				<form style={{ display: "flex", flexDirection: "column", gap: 20 }} onSubmit={handleRegister}>
					<div style={{ position: "relative" }}>
						<FaUser
							style={{
								position: "absolute",
								left: 14,
								top: "50%",
								transform: "translateY(-50%)",
								color: "#39C5BB",
							}}
						/>
						<input
							type="text"
							id="username"
							placeholder="ユーザー名"
							style={{
								width: "100%",
								padding: "12px 12px 12px 44px",
								borderRadius: 12,
								border: "1px solid #d0d0d0",
								fontSize: 16,
								outline: "none",
							}}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
					<div style={{ position: "relative" }}>
						<FaLock
							style={{
								position: "absolute",
								left: 14,
								top: "50%",
								transform: "translateY(-50%)",
								color: "#39C5BB",
							}}
						/>
						<input
							type="password"
							id="password"
							placeholder="パスワード"
							style={{
								width: "100%",
								padding: "12px 12px 12px 44px",
								borderRadius: 12,
								border: "1px solid #d0d0d0",
								fontSize: 16,
								outline: "none",
							}}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div style={{ position: "relative" }}>
						<FaLock
							style={{
								position: "absolute",
								left: 14,
								top: "50%",
								transform: "translateY(-50%)",
								color: "#39C5BB",
							}}
						/>
						<input
							type="password"
							id="confirmPassword"
							placeholder="パスワード（確認）"
							style={{
								width: "100%",
								padding: "12px 12px 12px 44px",
								borderRadius: 12,
								border: "1px solid #d0d0d0",
								fontSize: 16,
								outline: "none",
							}}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
					<button
						type="submit"
						style={{
							padding: "12px 0",
							background: "linear-gradient(135deg, #39C5BB, #00ACC1)",
							color: "white",
							border: "none",
							borderRadius: 12,
							fontSize: 16,
							fontWeight: 600,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 10,
							boxShadow: "0 6px 18px rgba(57, 197, 187, 0.35)",
						}}
					>
						<FaUserPlus />
						登録する
					</button>
				</form>
				{message && (
					<p
						style={{
							marginTop: 20,
							textAlign: "center",
							color: message.includes("成功") ? "#4caf50" : "#f44336",
							fontWeight: 600,
						}}
					>
						{message}
					</p>
				)}
				<div style={{ textAlign: "center", marginTop: 24, color: "#666" }}>
					<span>すでにアカウントをお持ちですか？ </span>
					<Link to="/login" style={{ color: "#39C5BB", fontWeight: 600, textDecoration: "none" }}>
						ログインはこちら
					</Link>
				</div>
				<div style={{ textAlign: "center", marginTop: 12 }}>
					<Link to="/app" style={{ fontSize: 12, color: "#888" }}>
						ホームへ戻る
					</Link>
				</div>
			</div>
			<style>{`
				@keyframes slideIn {
					from { opacity: 0; transform: translateY(24px); }
					to { opacity: 1; transform: translateY(0); }
				}
			`}</style>
		</div>
	);
};

export default Register;
