import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: "user",
          createdAt: serverTimestamp(),
        });

        if (onAuthSuccess) onAuthSuccess(user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (onAuthSuccess) onAuthSuccess(userCredential.user);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", "").replace(" (auth/invalid-credential).", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decorator Gradients */}
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />

      <div style={styles.card}>
        {/* Header Badge & Title */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <Sparkles size={18} color="#15803d" />
            <span style={styles.brandText}>EVERGREEN EXPENSE</span>
          </div>
          <h1 style={styles.title}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p style={styles.subtitle}>
            {isSignUp
              ? "Start tracking spending and managing wealth with total clarity."
              : "Sign in to access your dashboard and expense records."}
          </p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {isSignUp && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Anson Tan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            <span>{loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={styles.toggleBtn}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        <div style={styles.securityBadge}>
          <ShieldCheck size={14} color="#64748b" />
          <span>Encrypted Firebase Security</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  bgGlowOne: {
    position: "absolute",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(21, 128, 61, 0.12) 0%, rgba(255, 255, 255, 0) 70%)",
    top: "-100px",
    left: "-100px",
    pointerEvents: "none",
  },
  bgGlowTwo: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(13, 77, 63, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
    bottom: "-120px",
    right: "-120px",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "36px 32px",
    boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)",
    border: "1px solid #f1f5f9",
    position: "relative",
    zIndex: 1,
  },
  header: {
    marginBottom: "28px",
    textAlign: "left",
  },
  logoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f0fdf4",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #dcfce7",
    marginBottom: "16px",
  },
  brandText: {
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "#15803d",
  },
  title: {
    fontSize: "1.65rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.45",
  },
  errorAlert: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#334155",
    letterSpacing: "0.01em",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#94a3b8",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 12px 11px 38px",
    fontSize: "0.925rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    marginTop: "8px",
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "#0d4d3f", // Deep Forest Green matching dashboard hero card
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(13, 77, 63, 0.25)",
    transition: "background-color 0.2s ease",
  },
  footer: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  footerText: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#15803d",
    fontSize: "0.875rem",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
  },
  securityBadge: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
};