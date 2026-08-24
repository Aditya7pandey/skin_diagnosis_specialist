import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MarketingNav, Wordmark } from "../components/nav";
import {
  MicIcon,
  CameraIcon,
  ChatIcon,
  ShieldIcon,
  PlayIcon,
} from "../components/icons";

const steps = [
  {
    n: "01",
    icon: <MicIcon size={20} />,
    title: "Talk it through",
    text: "Start a live voice call. Describe what's on your skin, where it is, and how long you've had it — the assistant asks the right follow-up questions.",
  },
  {
    n: "02",
    icon: <CameraIcon size={20} />,
    title: "Show, don't guess",
    text: "Before any assessment, the assistant asks for a clear photo or a short video of the area. The media is analyzed and the findings join the conversation.",
  },
  {
    n: "03",
    icon: <ChatIcon size={20} />,
    title: "Understand next steps",
    text: "You get likely possibilities in plain words, self-care advice, warning signs — and the full transcript of the call stays with you.",
  },
];

const features = [
  {
    title: "Voice-first intake",
    text: "Speak naturally instead of filling out forms. Your words are transcribed live and the assistant replies out loud.",
  },
  {
    title: "Photo & video analysis",
    text: "Visible findings are extracted from your media — color, texture, borders, changes over time — and weighed against your story.",
  },
  {
    title: "A transcript you keep",
    text: "Every consultation is saved word for word, with your images, videos and the assistant's guidance in one place.",
  },
];

export default function Landing() {
  useEffect(() => {
    document.title = "Derma — AI skin specialist assistant";
  }, []);

  return (
    <>
      <MarketingNav />

      {/* hero band */}
      <section
        style={{
          position: "relative",
          padding: "128px 0 96px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div className="mesh-wrap">
          <div className="mesh" />
        </div>
        <div className="container" style={{ position: "relative" }}>
          <p className="eyebrow" style={{ color: "var(--ink)" }}>
            AI dermatology assistant
          </p>
          <h1
            className="display-xl"
            style={{ maxWidth: 680, margin: "20px auto 0" }}
          >
            Your skin, understood.
            <br />
            In one call.
          </h1>
          <p
            className="body-lg text-body"
            style={{ maxWidth: 520, margin: "24px auto 0" }}
          >
            Talk to an AI skin specialist, share a photo or a short video, and
            get clear, spoken guidance in minutes — with the full transcript
            saved for you.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 40,
            }}
          >
            <Link to="/signup" className="btn btn-pill btn-primary">
              Start a consultation
            </Link>
            <a href="#how" className="btn btn-pill btn-secondary">
              See how it works
            </a>
          </div>
          <p className="body-sm text-mute" style={{ marginTop: 24 }}>
            Not a diagnosis. Not a substitute for professional medical care.
          </p>
        </div>
      </section>

      {/* trust strip */}
      <section
        style={{ borderTop: "1px solid var(--hairline)", padding: "32px 0" }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {["Voice-first", "Image & video analysis", "Instant transcript", "Private by default"].map(
            (item) => (
              <span key={item} className="eyebrow">
                {item}
              </span>
            ),
          )}
        </div>
      </section>

      {/* how it works */}
      <section id="how" style={{ padding: "96px 0" }}>
        <div className="container">
          <p className="eyebrow">How it works</p>
          <h2 className="heading-lg" style={{ marginTop: 12, maxWidth: 480 }}>
            A consultation in three steps.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginTop: 40,
            }}
          >
            {steps.map((s) => (
              <div key={s.n} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid var(--hairline)",
                      borderRadius: "var(--r-full)",
                      color: "var(--ink)",
                    }}
                  >
                    {s.icon}
                  </span>
                  <span className="eyebrow">{s.n}</span>
                </div>
                <h3 className="heading-md" style={{ marginTop: 20 }}>
                  {s.title}
                </h3>
                <p className="body-md text-body" style={{ marginTop: 8 }}>
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* product preview */}
      <section
        id="features"
        style={{ borderTop: "1px solid var(--hairline)", padding: "96px 0" }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <p className="eyebrow">The consultation</p>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>
              A call that listens, looks, and explains.
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                marginTop: 32,
              }}
            >
              {features.map((f) => (
                <div key={f.title}>
                  <h3 className="label-sm">{f.title}</h3>
                  <p className="body-md text-body" style={{ marginTop: 4 }}>
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* mini transcript illustration — ink on white, per the system */}
          <div className="card-lg card-elevated" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <span className="eyebrow">Live consultation</span>
              <span
                className="eyebrow"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--cyan)",
                  }}
                />
                00:42
              </span>
            </div>
            <div className="transcript" style={{ paddingTop: 16 }}>
              <div className="msg assistant">
                <div className="bubble body-md">
                  Where exactly is the rash, and how long have you had it?
                </div>
              </div>
              <div className="msg user">
                <div className="bubble body-md">
                  Inside of my elbow, about two weeks. It gets itchy at night.
                </div>
              </div>
              <div className="msg assistant">
                <div className="bubble body-md">
                  Thanks. Before I can say anything useful, please share a
                  clear, well-lit photo of the area.
                </div>
              </div>
              <div className="msg user">
                <div
                  className="msg-media"
                  style={{
                    width: 160,
                    height: 90,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--faint)",
                  }}
                >
                  <CameraIcon size={22} />
                </div>
              </div>
              <div className="msg assistant">
                <div className="bubble body-md">
                  I can see dry, reddish patches with slight scaling…
                </div>
                <div className="msg-meta">
                  <span className="play-chip">
                    <PlayIcon size={10} /> Replay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* safety */}
      <section
        id="safety"
        style={{ borderTop: "1px solid var(--hairline)", padding: "96px 0" }}
      >
        <div className="container">
          <div
            className="card-lg"
            style={{
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--r-full)",
                flexShrink: 0,
              }}
            >
              <ShieldIcon size={22} />
            </span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h3 className="heading-md">Careful by design.</h3>
              <p
                className="body-md text-body"
                style={{ marginTop: 8, maxWidth: 640 }}
              >
                Derma never gives an assessment before seeing your skin, always
                separates what it observes from what it suspects, and always
                tells you when something needs an in-person dermatologist —
                urgently or routinely. Every answer ends with the same honest
                note: this is guidance, not a diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section
        style={{
          borderTop: "1px solid var(--hairline)",
          padding: "96px 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <h2 className="display-xl">Skin question? Ask now.</h2>
          <p className="body-lg text-body" style={{ marginTop: 16 }}>
            Your first consultation takes about three minutes.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/signup" className="btn btn-pill btn-primary">
              Start a consultation
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="footer">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <Wordmark />
            <p className="body-sm text-mute" style={{ marginTop: 12 }}>
              Derma is an AI assistant for skin concerns. It does not provide
              medical diagnoses and is not a substitute for advice from a
              qualified healthcare professional. If symptoms are severe or
              worsening, seek medical care.
            </p>
          </div>
          <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
            <div>
              <p className="label-sm" style={{ marginBottom: 12 }}>
                Product
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <a href="#how" className="body-md text-body">
                  How it works
                </a>
                <a href="#features" className="body-md text-body">
                  Features
                </a>
                <a href="#safety" className="body-md text-body">
                  Safety
                </a>
              </div>
            </div>
            <div>
              <p className="label-sm" style={{ marginBottom: 12 }}>
                Account
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <Link to="/login" className="body-md text-body">
                  Log in
                </Link>
                <Link to="/signup" className="body-md text-body">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div
          className="container"
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <p className="body-sm text-mute">
            © 2026 Derma AI — built for educational purposes.
          </p>
        </div>
      </footer>
    </>
  );
}
