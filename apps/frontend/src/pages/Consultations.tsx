import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getToken, type Consultation } from "../lib/api";
import { AppNav } from "../components/nav";
import { MicIcon, PlusIcon, SpinnerIcon } from "../components/icons";

export default function Consultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Consultations — Derma";
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }
    api
      .listConsultations()
      .then((res) => setConsultations(res.consultations))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "failed to load"),
      );
  }, [navigate]);

  const startNew = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await api.createConsultation();
      navigate(`/consult/${res.consultation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to start");
      setCreating(false);
    }
  };

  return (
    <>
      <AppNav />
      <main className="container" style={{ padding: "48px 24px 96px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="eyebrow">Your consultations</p>
            <h1 className="heading-lg" style={{ marginTop: 8 }}>
              Talk to your skin assistant.
            </h1>
          </div>
          <button
            onClick={startNew}
            disabled={creating}
            className="btn btn-sq lg btn-primary"
          >
            {creating ? <SpinnerIcon size={16} /> : <PlusIcon size={16} />}
            New consultation
          </button>
        </div>

        {error && (
          <p className="body-md" style={{ color: "var(--error)", marginTop: 24 }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 40 }}>
          {consultations === null && !error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--mute)",
              }}
            >
              <SpinnerIcon size={16} /> <span className="body-md">Loading…</span>
            </div>
          )}

          {consultations?.length === 0 && (
            <div
              className="card-lg"
              style={{ textAlign: "center", padding: "64px 32px" }}
            >
              <span
                style={{
                  width: 56,
                  height: 56,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--hairline)",
                  borderRadius: "var(--r-full)",
                }}
              >
                <MicIcon size={24} />
              </span>
              <h2 className="heading-md" style={{ marginTop: 20 }}>
                No consultations yet
              </h2>
              <p
                className="body-md text-body"
                style={{ maxWidth: 400, margin: "8px auto 0" }}
              >
                Start a voice call with the assistant, describe your skin
                concern, and share a photo when asked.
              </p>
              <button
                onClick={startNew}
                disabled={creating}
                className="btn btn-pill sm btn-primary"
                style={{ marginTop: 24 }}
              >
                Start your first consultation
              </button>
            </div>
          )}

          {consultations && consultations.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {consultations.map((c) => (
                <Link
                  key={c.id}
                  to={`/consult/${c.id}`}
                  className="card fade-in"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transition: "border-color .15s ease, box-shadow .15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span className="eyebrow">
                      {new Date(c.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className="eyebrow"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background:
                            c.status === "active" ? "var(--cyan)" : "var(--hairline)",
                        }}
                      />
                      {c.status}
                    </span>
                  </div>
                  <h3 className="heading-md" style={{ overflowWrap: "anywhere" }}>
                    {c.title}
                  </h3>
                  {c.lastMessage && (
                    <p
                      className="body-md text-mute"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {c.lastMessage}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
