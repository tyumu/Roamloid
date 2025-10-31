import React from "react";
import { Navigate } from "react-router-dom";
import { AuthApi } from "../utils/api";

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [state, setState] = React.useState<{
    loading: boolean;
    authed: boolean;
  }>({ loading: true, authed: false });

  React.useEffect(() => {
    let mounted = true;
    AuthApi.detail()
      .then((res) => {
        if (!mounted) return;
        setState({ loading: false, authed: res.ok });
      })
      .catch(() => {
        if (!mounted) return;
        setState({ loading: false, authed: false });
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "#666" }}>
        認証確認中...
      </div>
    );
  }

  if (!state.authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
