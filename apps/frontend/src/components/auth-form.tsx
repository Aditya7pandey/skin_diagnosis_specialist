import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { api, setSession } from "../lib/api";
import { Wordmark } from "./nav";
import { SpinnerIcon } from "./icons";

export const AuthForm = ({ mode }: { mode: "login" | "signup" }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "signup"
          ? await api.signup({ name, email, password })
          : await api.login({ email, password });
      setSession(res.token, res.name);
      navigate("/consult");
    } catch (err) {
      setError(err instanceof Error ? err.message : "something went wrong");
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <div className="mesh-wrap" style={{ opacity: 0.35 }}>
        <div className="mesh" />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <Wordmark />
        </div>

        <div className="card-lg card-elevated">
          <h1 className="heading-md" style={{ textAlign: "center" }}>
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p
            className="body-md text-mute"
            style={{ textAlign: "center", marginTop: 4 }}
          >
            {mode === "signup"
              ? "Start your first skin consultation."
              : "Log in to continue your consultations."}
          </p>

          <form
            onSubmit={submit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: 24,
            }}
          >
            {mode === "signup" && (
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  className="input"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="body-sm" style={{ color: "var(--error)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-sq lg btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <SpinnerIcon size={16} />
              ) : mode === "signup" ? (
                "Sign up"
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>

        <p className="body-md text-mute" style={{ textAlign: "center", marginTop: 24 }}>
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--link)" }}>
                Log in
              </Link>
            </>
          ) : (
            <>
              New to Derma?{" "}
              <Link to="/signup" style={{ color: "var(--link)" }}>
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
};
