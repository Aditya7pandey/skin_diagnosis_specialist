import { useEffect } from "react";
import { AuthForm } from "../components/auth-form";

export default function Login() {
  useEffect(() => {
    document.title = "Log in — Derma";
  }, []);

  return <AuthForm mode="login" />;
}
