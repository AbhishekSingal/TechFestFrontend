import React, { useState, useEffect } from "react";
import {
  Layout,
  Ticket,
  Calendar,
  LogIn,
  CheckCircle,
  Zap,
  X,
  Clock,
  MapPin,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { EVENTS } from "./data";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registered, setRegistered] = useState([]);
  const [view, setView] = useState("events");
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    entryNo: "",
    password: "",
  });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );

  const [isProcessing, setIsProcessing] = useState(null);
  const [showModal, setShowModal] = useState(null);

  // Auth persistence check
  useEffect(() => {
    if (token) setIsLoggedIn(true);
  }, [token]);

  const handleAuth = async () => {
    const endpoint = isSignup ? "/api/register" : "/api/login";
    try {
      const res = await fetch(
        `https://techfestbackend-production.up.railway.app${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (isSignup) {
          alert("Registration Successful! Please Sign In.");
          setIsSignup(false);
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userName", data.name || formData.entryNo);
          setToken(data.token);
          setUserName(data.name || formData.entryNo);
          setRegistered(data.registeredEvents || []);
          setIsLoggedIn(true);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Backend Offline");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setToken("");
    setRegistered([]);
    setView("events");
  };

  const toggleRegister = async (event) => {
    if (registered.includes(event.id)) return;
    setIsProcessing(event.id);
    try {
      const res = await fetch(
        "https://techfestbackend-production.up.railway.app/api/book",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, eventId: event.id }),
        }
      );
      if (res.ok) {
        setRegistered([...registered, event.id]);
        setShowModal(event);
      }
    } catch (err) {
      alert("Registration Error");
    } finally {
      setIsProcessing(null);
    }
  };

  // --- LOGIN UI ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6">
        <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-4 text-blue-500">
            <Zap size={40} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-center mb-6 tracking-tighter uppercase italic">
            Tryst Portal
          </h1>
          <div className="space-y-4">
            {isSignup && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            )}
            <input
              type="text"
              placeholder="Entry Number"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-blue-500"
              onChange={(e) =>
                setFormData({ ...formData, entryNo: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-blue-500"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              onClick={handleAuth}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all"
            >
              {isSignup ? "Create Account" : "Sign In"}
            </button>
            <p
              className="text-center text-sm text-gray-500 cursor-pointer"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Have an account? Login" : "New student? Sign up"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100">
      {/* POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111] border border-blue-500/30 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-xl font-black mb-4 flex items-center justify-center gap-2">
              <CheckCircle className="text-green-500" /> SLOT SECURED
            </h2>
            <div className="bg-white p-3 rounded-xl inline-block mb-4">
              <QRCodeSVG
                value={`VAL-${formData.entryNo}-${showModal.id}`}
                size={140}
              />
            </div>
            <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest font-mono">
              ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}
            </p>
            <button
              onClick={() => setShowModal(null)}
              className="w-full bg-white text-black py-3 rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-lg">
              <Zap size={20} fill="white" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tighter">
              TechFest
            </h2>
          </div>
          <div className="flex gap-8 items-center">
            <button
              onClick={() => setView("events")}
              className={`font-bold text-sm uppercase tracking-widest ${
                view === "events" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setView("tickets")}
              className={`font-bold text-sm uppercase tracking-widest ${
                view === "tickets" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Passes ({registered.length})
            </button>
            <div className="h-6 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <UserIcon size={16} className="text-blue-500" />
              <span className="text-xs font-bold text-gray-300">
                {userName.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {view === "events" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVENTS.map((event) => (
              <div
                key={event.id}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:scale-[1.02] transition-all duration-300"
              >
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">
                  {event.category}
                </span>
                <h3 className="text-2xl font-bold mt-2 mb-8">{event.name}</h3>
                <button
                  onClick={() => toggleRegister(event)}
                  disabled={
                    isProcessing === event.id || registered.includes(event.id)
                  }
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    registered.includes(event.id)
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-white text-black hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {isProcessing === event.id
                    ? "Processing..."
                    : registered.includes(event.id)
                    ? "Confirmed"
                    : "Get Pass"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {registered.length === 0 && (
              <p className="text-center text-gray-600 pt-20">
                No active passes found.
              </p>
            )}
            {registered.map((id) => {
              const event = EVENTS.find((e) => e.id === id);
              return (
                <div
                  key={id}
                  className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden flex shadow-2xl border-l-4 border-l-blue-600"
                >
                  <div className="p-8 flex-1">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      {event.category}
                    </h4>
                    <h3 className="text-2xl font-black italic uppercase text-white mb-4">
                      {event.name}
                    </h3>
                    <div className="flex gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} /> {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} /> LHC, IITD
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 flex items-center justify-center min-w-[140px]">
                    <QRCodeSVG
                      value={`PASS-${id}-${formData.entryNo}`}
                      size={100}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
