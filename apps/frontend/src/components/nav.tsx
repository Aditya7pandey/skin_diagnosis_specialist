import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, getName, getToken } from "../lib/api";
import { LogoMark } from "./icons";

export const Wordmark = () => (
  <Link to="/" className="wordmark">
    <LogoMark />
    <span>
      Derma
      <span style={{ color: "var(--mute)", fontWeight: 500 }}> ai</span>
    </span>
  </Link>
);

// marketing nav for the landing page
export const MarketingNav = () => {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Wordmark />
          <nav className="nav-links">
            <a href="/#how" className="nav-link">
              How it works
            </a>
            <a href="/#features" className="nav-link">
              Features
            </a>
            <a href="/#safety" className="nav-link">
              Safety
            </a>
          </nav>
        </div>
        <div className="nav-actions">
          {authed ? (
            <Link to="/consult" className="btn btn-sq btn-primary">
              Open consultations
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-sq btn-secondary">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-sq btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// app nav for authenticated pages
export const AppNav = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getName());
  }, []);

  const logout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Wordmark />
          <nav className="nav-links">
            <Link to="/consult" className="nav-link">
              Consultations
            </Link>
          </nav>
        </div>
        <div className="nav-actions">
          {name && (
            <span className="body-md text-mute" style={{ marginRight: 4 }}>
              {name}
            </span>
          )}
          <button onClick={logout} className="btn btn-sq btn-secondary">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};
