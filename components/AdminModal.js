"use client";
import { useState } from "react";
import { Lock, Unlock, X, KeyRound, User, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminModal({ isOpen, onClose, onAuthenticate, isAdmin, onLogout }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!username.trim()) {
      setError("Please enter the Admin Username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter the Admin Password.");
      return;
    }

    const isSuccess = onAuthenticate({ username: username.trim(), password: password.trim() });
    if (isSuccess) {
      setSuccessMsg("Admin Mode Unlocked successfully!");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 900);
    } else {
      setError("Incorrect Username or Password! Please try again.");
    }
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
      padding: '1rem'
    }}>
      <div
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)', borderRadius: '1.25rem',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div className="flex items-center gap-2.5">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: isAdmin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${isAdmin ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isAdmin ? '#10b981' : '#818cf8'
            }}>
              {isAdmin ? <ShieldCheck size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {isAdmin ? "Admin Controls Active" : "Admin Login"}
              </h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {isAdmin ? "You have full management access" : "Enter username & password to unlock"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8,
              background: 'transparent', color: 'var(--text-muted)',
              border: 'none', cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isAdmin ? (
            /* Logged in state */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', alignItems: 'center' }}>
              <div style={{
                padding: '1rem', borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#10b981', fontSize: '0.8rem', width: '100%',
                display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center'
              }}>
                <ShieldCheck size={16} />
                <span>Admin Mode is currently <strong>UNLOCKED</strong> on this browser.</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                You can add, edit, modify, and delete books across your reading list. Lock admin mode when using a public device.
              </p>
              <button
                onClick={handleLogout}
                className="btn-ghost flex items-center justify-center gap-2"
                style={{
                  width: '100%', padding: '0.6rem 1rem', fontSize: '0.8rem',
                  borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fb7185'
                }}
              >
                <Lock size={14} /> Lock Admin Mode (Exit)
              </button>
            </div>
          ) : (
            /* Username + Password Login Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Username Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Admin Username"
                    className="input-dark w-full"
                    style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    className="input-dark w-full"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '0.6rem 0.85rem', borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#fb7185', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div style={{
                  padding: '0.6rem 0.85rem', borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#34d399', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-color)', lineHeight: 1.4 }}>
                💡 <strong>Tip:</strong> Visitors on Vercel get Read-Only view. Only you with the correct Admin credentials can add, edit, or delete books.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center gap-1.5"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem' }}
                >
                  <Unlock size={14} /> Unlock Admin
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
