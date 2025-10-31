document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const messageDiv = document.getElementById("login-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    const username = form.username.value.trim();
    const password = form.password.value;
    if (!username || !password) {
      messageDiv.textContent = "ユーザー名とパスワードを入力してください。";
      messageDiv.className = "login-message error";
      return;
    }
    try {
      const res = await fetch(
        //本番環境
        // "https://roamloid-flask.onrender.com/api/auth/login",
        //ローカルサーバーに接続（開発環境）
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:5173",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        messageDiv.textContent = "ログイン成功: " + (data.message || "");
        messageDiv.className = "login-message success";
        location.href = "socketio_test.html"; // 必要に応じて遷移
      } else {
        messageDiv.textContent =
          data.error_message || "ログインに失敗しました。";
        messageDiv.className = "login-message error";
      }
    } catch (err) {
      messageDiv.textContent = "通信エラーが発生しました。";
      messageDiv.className = "login-message error";
    }
  });
});
