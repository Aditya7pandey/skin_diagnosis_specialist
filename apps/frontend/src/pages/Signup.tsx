import { useEffect } from "react";
import { AuthForm } from "../components/auth-form";

export default function Signup() {
  useEffect(() => {
    document.title = "Sign up — Derma";
  }, []);

  return <AuthForm mode="signup" />;
}
