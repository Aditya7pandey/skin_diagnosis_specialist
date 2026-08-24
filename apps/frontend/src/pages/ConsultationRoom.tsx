import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  api,
  getToken,
  mediaUrl,
  type Consultation,
  type Message,
} from "../lib/api";
import { Wordmark } from "../components/nav";
import {
  MicIcon,
  StopIcon,
  CameraIcon,
  PlayIcon,
  SquareIcon,
  SendIcon,
  XIcon,
  SpinnerIcon,
  VideoFileIcon,
} from "../components/icons";

type CallState = "idle" | "recording" | "processing" | "speaking";

const STATUS_TEXT: Record<CallState, string> = {
  idle: "Tap the mic and describe your problem",
  recording: "Listening — tap again when you're done",
  processing: "Thinking…",
  speaking: "Speaking — tap the mic to talk",
};

export default function ConsultationRoom() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callState, setCallState] = useState<CallState>("idle");
  const [flash, setFlash] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [text, setText] = useState("");
  const [pendingMedia, setPendingMedia] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const stateRef = useRef<CallState>("idle");
  stateRef.current = callState;

  // ---- audio playback ------------------------------------------------
  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
    if (stateRef.current === "speaking") setCallState("idle");
  }, []);

  const playAudio = useCallback(
    (messageId: string, url: string, silentFail = false) => {
      audioRef.current?.pause();
      const audio = new Audio(mediaUrl(url));
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingId(null);
        setCallState((s) => (s === "speaking" ? "idle" : s));
      };
      audio
        .play()
        .then(() => {
          setPlayingId(messageId);
          setCallState("speaking");
        })
        .catch(() => {
          if (!silentFail) setFlash("Couldn't play audio");
          setPlayingId(null);
        });
    },
    [],
  );

  // ---- load ----------------------------------------------------------
  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }
    api
      .getConsultation(id)
      .then((res) => {
        setConsultation(res.consultation);
        setMessages(res.messages);
        document.title = `${res.consultation.title} — Derma`;
        // try to speak the greeting; browsers may block autoplay, that's fine
        const last = res.messages[res.messages.length - 1];
        if (last?.role === "assistant" && last.audioUrl && res.messages.length === 1) {
          playAudio(last.id, last.audioUrl, true);
        }
      })
      .catch(() => setNotFound(true));
    return () => {
      audioRef.current?.pause();
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---- autoscroll ----------------------------------------------------
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, callState]);

  // ---- send a turn ---------------------------------------------------
  const sendTurn = useCallback(
    async (parts: { text?: string; audio?: Blob }) => {
      const media = pendingMedia ?? undefined;
      if (!parts.text && !parts.audio && !media) return;

      setCallState("processing");
      setFlash(null);
      setPendingMedia(null);
      setPendingPreview(null);

      try {
        const res = await api.sendMessage(id, { ...parts, media });
        setMessages((prev) => [...prev, res.userMessage, res.assistantMessage]);
        if (res.assistantMessage.audioUrl) {
          playAudio(res.assistantMessage.id, res.assistantMessage.audioUrl);
        } else {
          setCallState("idle");
        }
      } catch (err: any) {
        setCallState("idle");
        if (err?.status === 422) {
          setFlash("Couldn't hear you — try again, a bit closer to the mic.");
        } else {
          setFlash(err instanceof Error ? err.message : "Something went wrong.");
        }
        if (media) setPendingMedia(media); // don't lose the attachment
      }
    },
    [id, pendingMedia, playAudio],
  );

  // ---- voice recording -----------------------------------------------
  const startRecording = useCallback(async () => {
    setMicError(null);
    stopAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : undefined;
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        if (blob.size < 1200) {
          setCallState("idle");
          setFlash("That was too short — hold the call a moment longer.");
          return;
        }
        void sendTurn({ audio: blob });
      };
      recorderRef.current = recorder;
      recorder.start();
      setCallState("recording");
    } catch {
      setMicError(
        "Microphone unavailable. Check browser permissions, or type your message below.",
      );
    }
  }, [sendTurn, stopAudio]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }, []);

  const onMicClick = () => {
    if (callState === "recording") stopRecording();
    else if (callState === "processing") return;
    else void startRecording();
  };

  // ---- attachments ----------------------------------------------------
  const onPickMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingMedia(file);
    setPendingPreview(
      file.type.startsWith("image") ? URL.createObjectURL(file) : null,
    );
    e.target.value = "";
  };

  const onSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (callState === "recording" || callState === "processing") return;
    const value = text.trim();
    if (!value && !pendingMedia) return;
    setText("");
    void sendTurn(value ? { text: value } : {});
  };

  const endCall = () => {
    stopAudio();
    recorderRef.current?.stop();
    navigate("/consult");
  };

  // ---- render ----------------------------------------------------------
  if (notFound) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <p className="heading-md">Consultation not found</p>
        <Link to="/consult" className="btn btn-sq btn-secondary">
          Back to consultations
        </Link>
      </main>
    );
  }

  const busy = callState === "recording" || callState === "processing";

  return (
    <div className="room">
      {/* room header */}
      <header className="nav static">
        <div className="container nav-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 24, minWidth: 0 }}>
            <Wordmark />
            <span
              className="body-md text-mute"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {consultation?.title ?? "…"}
            </span>
          </div>
          <div className="nav-actions">
            <Link to="/consult" className="btn btn-sq btn-secondary">
              All consultations
            </Link>
            <button onClick={endCall} className="btn btn-sq btn-danger-ghost">
              End call
            </button>
          </div>
        </div>
      </header>

      <main className="room-grid">
        {/* call panel */}
        <section className="call-panel">
          <p className="eyebrow">Live consultation</p>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              minHeight: 260,
            }}
          >
            <div className={`orb ${callState}`} />
            <p
              className="eyebrow"
              style={{ color: callState === "recording" ? "var(--error)" : undefined }}
            >
              {STATUS_TEXT[callState]}
            </p>
            {flash && (
              <p className="body-sm" style={{ color: "var(--warning-deep)", textAlign: "center" }}>
                {flash}
              </p>
            )}
            {micError && (
              <p
                className="body-sm"
                style={{ color: "var(--error)", textAlign: "center", maxWidth: 280 }}
              >
                {micError}
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              paddingBottom: 8,
            }}
          >
            <button
              className="btn-icon"
              title="Attach a photo or video"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              style={{ width: 48, height: 48 }}
            >
              <CameraIcon size={20} />
            </button>

            <button
              className={`mic-btn ${callState === "recording" ? "recording" : ""}`}
              onClick={onMicClick}
              disabled={callState === "processing"}
              title={callState === "recording" ? "Finish speaking" : "Start speaking"}
            >
              {callState === "processing" ? (
                <SpinnerIcon size={22} />
              ) : callState === "recording" ? (
                <StopIcon size={24} />
              ) : (
                <MicIcon size={24} />
              )}
            </button>

            <div style={{ width: 48 }} />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={onPickMedia}
          />
        </section>

        {/* transcript */}
        <section className="transcript-panel">
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--hairline)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span className="eyebrow">Transcript</span>
            <span className="eyebrow">
              {messages.length} {messages.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div
            ref={scrollRef}
            className="transcript"
            style={{ flex: 1, overflowY: "auto", padding: 24 }}
          >
            {messages.map((m) => (
              <div key={m.id} className={`msg ${m.role} fade-in`}>
                <div className="msg-meta">
                  <span>{m.role === "assistant" ? "Derma" : "You"}</span>
                  <span style={{ textTransform: "none" }}>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {m.mediaUrl && m.mediaType === "image" && (
                  <div className="msg-media">
                    <img src={mediaUrl(m.mediaUrl)} alt="shared skin condition" />
                  </div>
                )}
                {m.mediaUrl && m.mediaType === "video" && (
                  <div className="msg-media">
                    <video src={mediaUrl(m.mediaUrl)} controls />
                  </div>
                )}

                <div className="bubble">{m.content}</div>

                {m.role === "assistant" && m.audioUrl && (
                  <button
                    className={`play-chip ${playingId === m.id ? "playing" : ""}`}
                    onClick={() =>
                      playingId === m.id ? stopAudio() : playAudio(m.id, m.audioUrl!)
                    }
                  >
                    {playingId === m.id ? (
                      <>
                        <SquareIcon size={9} /> Stop
                      </>
                    ) : (
                      <>
                        <PlayIcon size={9} /> Replay
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}

            {callState === "processing" && (
              <div className="msg assistant fade-in">
                <div className="msg-meta">
                  <span>Derma</span>
                </div>
                <div className="thinking-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {/* composer */}
          <div style={{ borderTop: "1px solid var(--hairline)", padding: 16 }}>
            {pendingMedia && (
              <div style={{ marginBottom: 8 }}>
                <span className="attach-chip">
                  {pendingPreview ? (
                    <img src={pendingPreview} alt="attachment preview" />
                  ) : (
                    <VideoFileIcon size={18} />
                  )}
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 140,
                    }}
                  >
                    {pendingMedia.name}
                  </span>
                  <button
                    className="x"
                    title="Remove attachment"
                    onClick={() => {
                      setPendingMedia(null);
                      setPendingPreview(null);
                    }}
                  >
                    <XIcon size={12} />
                  </button>
                </span>
              </div>
            )}
            <form onSubmit={onSendText} style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn-icon"
                title="Attach a photo or video"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                <CameraIcon size={18} />
              </button>
              <input
                className="input"
                placeholder="Prefer typing? Write your message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, height: 40 }}
                disabled={callState === "recording"}
              />
              <button
                type="submit"
                className="btn-icon"
                title="Send"
                disabled={busy || (!text.trim() && !pendingMedia)}
                style={{ background: "var(--primary)", color: "var(--on-primary)", border: "none" }}
              >
                <SendIcon size={18} />
              </button>
            </form>
            <p className="body-sm text-faint" style={{ marginTop: 8 }}>
              Derma gives guidance, not a medical diagnosis. In an emergency,
              seek care immediately.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
