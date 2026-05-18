import React, { useState } from "react";
import { MapPin, Clock, Calendar, Heart, Users, ChevronDown, Home } from "lucide-react";
import { supabase } from "./supabase";

// Polices Google Fonts injectées dynamiquement
const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&display=swap');

  * { box-sizing: border-box; }

  .font-serif-elegant { font-family: 'Playfair Display', Georgia, serif; }
  .font-sans-clean    { font-family: 'Lato', system-ui, sans-serif; }

  .radio-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem; border-radius: 0.75rem; border: 1px solid #555;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }
  .radio-card:hover { border-color: #777; }
  .radio-card.selected-yes { border-color: #C9A84C; background: rgba(201,168,76,0.08); }
  .radio-card.selected-no  { border-color: #8a8a8a; background: rgba(100,100,100,0.1); }

  .radio-dot {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid #555; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; transition: border-color 0.2s;
  }
  .radio-dot.active-yes { border-color: #C9A84C; }
  .radio-dot.active-no  { border-color: #8a8a8a; }
  .radio-dot-inner { width: 10px; height: 10px; border-radius: 50%; }

  .form-input {
    width: 100%; background: #242424; color: #fff;
    border: 1px solid #555; border-radius: 0.75rem;
    padding: 0.75rem 1rem; font-size: 0.875rem;
    outline: none; transition: border-color 0.2s;
    font-family: 'Lato', sans-serif;
  }
  .form-input:focus { border-color: #C9A84C; }
  .form-input::placeholder { color: #666; }

  .submit-btn {
    width: 100%; padding: 1rem; border-radius: 0.75rem;
    font-size: 0.8rem; font-weight: 700; letter-spacing: 0.2em;
    text-transform: uppercase; border: none; cursor: pointer;
    background: linear-gradient(135deg, #C9A84C 0%, #ddb95e 100%);
    color: #2C2C2C; transition: opacity 0.2s, transform 0.1s;
    font-family: 'Lato', sans-serif;
  }
  .submit-btn:hover  { opacity: 0.9; }
  .submit-btn:active { transform: scale(0.98); }

  @keyframes bounce {
    0%, 100% { transform: translateY(0);    }
    50%       { transform: translateY(8px); }
  }
  .animate-bounce { animation: bounce 1.8s infinite; }

  select option { background: #242424; }
`;

// ─── Composants utilitaires ──────────────────────────────────────────────────

function Divider({ color = "#C9A84C", icon = "heart" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center" }}>
      <div style={{ height: 1, width: 48, background: color }} />
      {icon === "heart" ? (
        <Heart size={14} style={{ color }} fill={color} />
      ) : (
        <Calendar size={14} style={{ color }} />
      )}
      <div style={{ height: 1, width: 48, background: color }} />
    </div>
  );
}

function SectionLabel({ label, color = "#C9A84C" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem" }}>
      <div style={{ height: 1, width: 40, background: color }} />
      <span
        className="font-sans-clean"
        style={{ color, fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase" }}
      >
        {label}
      </span>
      <div style={{ height: 1, width: 40, background: color }} />
    </div>
  );
}

// ─── Carte Programme ─────────────────────────────────────────────────────────

function ProgramCard({ time, subtitle, title, address, accentColor, iconColor, Icon = MapPin }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "1.25rem",
        padding: "2rem",
        border: "1px solid #e8e0d0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          width: 48, height: 48, borderRadius: "50%",
          background: `${accentColor}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <Icon size={22} style={{ color: iconColor }} />
      </div>

      <p
        className="font-sans-clean"
        style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.4rem" }}
      >
        {subtitle}
      </p>

      <h3 className="font-serif-elegant" style={{ fontSize: "1.5rem", color: "#2C2C2C", marginBottom: "0.75rem" }}>
        {title}
      </h3>

      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
        <Clock size={14} style={{ color: "#A8C5A0" }} />
        <span className="font-sans-clean" style={{ fontSize: "0.875rem", color: "#6b6b6b" }}>{time}</span>
      </div>

      {address && (
        <p className="font-sans-clean" style={{ fontSize: "0.8rem", color: "#8a8a8a", lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: address }} />
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function App() {
  const [formData, setFormData] = useState({
    firstName:  "",
    lastName:   "",
    attendance: "yes",
    message:    "",
  });
  const [companions, setCompanions] = useState([]); // [{ firstName, lastName }]
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCompanion = () => {
    if (companions.length < 5) {
      setCompanions((prev) => [...prev, { firstName: "", lastName: "" }]);
    }
  };

  const removeCompanion = (index) => {
    setCompanions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCompanion = (index, field, value) => {
    setCompanions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  /**
   * handleSubmit – Gestion de l'envoi du formulaire RSVP
   *
   * ── Option 1 · Formspree (recommandé, zéro backend) ──────────────────────
   *   1. Créez un compte sur https://formspree.io
   *   2. Créez un formulaire → copiez l'ID (ex: xldkojqr)
   *   3. Remplacez l'URL ci-dessous :
   *        const res = await fetch("https://formspree.io/f/VOTRE_ID", {
   *          method: "POST",
   *          headers: { "Content-Type": "application/json" },
   *          body: JSON.stringify(formData),
   *        });
   *        if (res.ok) setSubmitted(true);
   *
   * ── Option 2 · API maison (Node/Express) ─────────────────────────────────
   *   const res = await fetch("/api/rsvp", {
   *     method: "POST",
   *     headers: { "Content-Type": "application/json" },
   *     body: JSON.stringify(formData),
   *   });
   *   if (res.ok) setSubmitted(true);
   *
   * ── Option 3 · EmailJS (email direct sans serveur) ────────────────────────
   *   import emailjs from "@emailjs/browser";
   *   await emailjs.send("SERVICE_ID", "TEMPLATE_ID", formData, "PUBLIC_KEY");
   *   setSubmitted(true);
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const { error } = await supabase.from("rsvp").insert({
      first_name:  formData.firstName,
      last_name:   formData.lastName,
      attendance:  formData.attendance,
      guests:      formData.attendance === "yes" ? companions.length : 0,
      companions:  formData.attendance === "yes" ? companions : [],
      message:     formData.message || null,
    });

    setLoading(false);

    if (error) {
      setSubmitError("Une erreur est survenue, veuillez réessayer.");
      console.error("Supabase error:", error);
    } else {
      setSubmitted(true);
    }
  };

  const isYes = formData.attendance === "yes";
  const isNo  = formData.attendance === "no";

  return (
    <>
      <style>{FONT_IMPORT}</style>

      <div className="font-sans-clean" style={{ minHeight: "100vh", background: "#FAF8F5" }}>

        {/* ═══════════════════ HERO ═══════════════════ */}
        <section
          style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "5rem 1.5rem", position: "relative", overflow: "hidden",
          }}
        >
          {/* Halos décoratifs */}
          <div style={{
            position: "absolute", top: -80, left: -80, width: 340, height: 340,
            borderRadius: "50%", background: "radial-gradient(circle, #A8C5A022 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -100, right: -80, width: 480, height: 480,
            borderRadius: "50%", background: "radial-gradient(circle, #C9A84C11 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <Divider />
          <div style={{ marginBottom: "1.75rem" }} />

       


          <h1
            className="font-serif-elegant"
            style={{
              fontSize: "clamp(3rem, 10vw, 7rem)", color: "#2C2C2C",
              textAlign: "center", lineHeight: 1.1, marginBottom: "0.25rem",
            }}
          >
            Myriam
          </h1>
          <p
            className="font-serif-elegant"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#C9A84C", fontStyle: "italic", margin: "0.5rem 0" }}
          >
            &amp;
          </p>
          <h1
            className="font-serif-elegant"
            style={{
              fontSize: "clamp(3rem, 10vw, 7rem)", color: "#2C2C2C",
              textAlign: "center", lineHeight: 1.1,
            }}
          >
            Souliman
          </h1>

          <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <Divider icon="calendar" />
          </div>

          <p
            className="font-sans-clean"
            style={{ letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8a8a", fontSize: "0.75rem" }}
          >
            11 Juillet 2026
          </p>

          <a
            href="#invitation"
            className="animate-bounce"
            style={{ position: "absolute", bottom: "2.5rem", display: "block" }}
            aria-label="Défiler vers le bas"
          >
            <ChevronDown size={28} style={{ color: "#C9A84C" }} />
          </a>
        </section>

        {/* ═══════════════════ INVITATION ═══════════════════ */}
        <section
          id="invitation"
          style={{ padding: "5rem 1.5rem", maxWidth: 680, margin: "0 auto", textAlign: "center" }}
        >
          <SectionLabel label="Invitation" color="#A8C5A0" />
          <div style={{ marginBottom: "2.5rem" }} />

          <p
            className="font-serif-elegant"
            style={{ fontSize: "clamp(1.1rem, 3vw, 1.4rem)", color: "#4a4a4a", lineHeight: 1.85, fontStyle: "italic" }}
          >
            Les familles <strong style={{ fontStyle: "italic" }}>Ghoula</strong> et{" "}
            <strong style={{ fontStyle: "italic" }}>Boulaayoun</strong> ont le plaisir de vous inviter au
            mariage de leurs enfants. 
          </p>
            <br/>
          <p
            className="font-sans-clean"
            style={{ color: "#8a8a8a", fontSize: "0.95rem", lineHeight: 1.9, marginTop: "1.5rem" }}
          >
            بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ

             Qu’Allah vous bénisse tous les deux, qu’Il répande Sa bénédiction sur vous deux et qu’Il vous unisse dans le bien. 
          </p>
        </section>

        {/* ═══════════════════ PROGRAMME ═══════════════════ */}
        <section id="programme" style={{ padding: "5rem 1.5rem", background: "#F0F4F1" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2
                className="font-serif-elegant"
                style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", color: "#2C2C2C", marginTop: "0.75rem" }}
              >
                Le Déroulé de la Journée
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
             {/* <ProgramCard
                subtitle="Départ"
                title="La Maison"
                time="15h45"
                address={"13 Rue de Lugoj<br/>Orléans"}
                accentColor="#C9A84C"
                iconColor="#C9A84C"
                Icon={Home}
              />*/}
              <ProgramCard
                subtitle="Cérémonie Civile"
                title="La Mairie"
                time="16h20"
                address="Mairie d'Orléans"
                accentColor="#A8C5A0"
                iconColor="#7aaa7a"
              />
             
              <ProgramCard
                subtitle="Soirée & Réception"
                title="Espace Gérard Dumard"
                time="À partir de 19h00"
                address={"Rue du Lièvre d'Or<br/>45130 Baule"}
                accentColor="#C9A84C"
                iconColor="#C9A84C"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════ DRESS CODE ═══════════════════ 
        <section style={{ padding: "5rem 1.5rem", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <SectionLabel label="Dress Code" color="#A8C5A0" />
          <div style={{ marginBottom: "2.5rem" }} />

          <div
            style={{
              background: "#F0F4F1", borderRadius: "1.5rem",
              padding: "3rem 2rem", border: "1px solid #d4e4d4",
            }}
          >
            {/* Pastilles de couleur 
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {["#C5DFC8", "#A8C5A0", "#8FB5A0"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: c, border: "3px solid #fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                />
              ))}
            </div>

            <h3
              className="font-serif-elegant"
              style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)", color: "#2C2C2C", marginBottom: "1rem" }}
            >
              Vert Pastel &amp; Vert d'Eau
            </h3>

            <p className="font-sans-clean" style={{ color: "#6b6b6b", fontSize: "0.95rem", lineHeight: 1.85 }}>
              Pour célébrer ce beau jour avec nous, nous vous invitons à porter des tenues dans les tons de{" "}
              <strong>vert pastel</strong> ou <strong>vert d'eau</strong>. Ces couleurs douces et élégantes
              habillleront notre journée de sérénité et de douceur.
            </p>
          </div>
        </section>*/}

        {/* ═══════════════════ RSVP ═══════════════════ */}
        <section id="rsvp" style={{ padding: "5rem 1.5rem", background: "#2C2C2C" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>

            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2
                className="font-serif-elegant"
                style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", color: "#fff", margin: "0.75rem 0 0.5rem" }}
              >
                Confirmer votre Présence
              </h2>
              <p className="font-sans-clean" style={{ color: "#8a8a8a", fontSize: "0.85rem" }}>
                Merci de répondre avant le{" "}
                <strong style={{ color: "#C9A84C" }}>31 Juin 2026</strong>
              </p>
            </div>

            {submitted ? (
              /* ── Message de confirmation ── */
              <div
                style={{
                  textAlign: "center", padding: "4rem 2rem",
                  background: "#3a3a3a", borderRadius: "1.5rem",
                }}
              >
                <Heart size={52} style={{ color: "#C9A84C", margin: "0 auto 1rem" }} fill="#C9A84C" />
                <h3 className="font-serif-elegant" style={{ fontSize: "1.75rem", color: "#fff", marginBottom: "0.75rem" }}>
                  Merci pour votre réponse !
                </h3>
                <p className="font-sans-clean" style={{ color: "#8a8a8a", fontSize: "0.9rem" }}>
                  Nous avons bien reçu votre confirmation. À très vite !
                </p>
              </div>
            ) : (
              /* ── Formulaire ── */
              <form
                onSubmit={handleSubmit}
                style={{ background: "#3a3a3a", borderRadius: "1.5rem", padding: "2rem" }}
              >
                {/* ── 1. Votre réponse ── */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="font-sans-clean" style={{ display: "block", color: "#8a8a8a", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    Votre réponse
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <label className={`radio-card ${isYes ? "selected-yes" : ""}`} onClick={() => setFormData((p) => ({ ...p, attendance: "yes" }))}>
                      <input type="radio" name="attendance" value="yes" checked={isYes} onChange={handleChange} style={{ display: "none" }} />
                      <div className={`radio-dot ${isYes ? "active-yes" : ""}`}>
                        {isYes && <div className="radio-dot-inner" style={{ background: "#C9A84C" }} />}
                      </div>
                      <div>
                        <p className="font-sans-clean" style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600 }}>Je viens avec plaisir ! 🥂</p>
                        <p className="font-sans-clean" style={{ color: "#8a8a8a", fontSize: "0.75rem", marginTop: "0.15rem" }}>Je serai présent(e) pour célébrer ce beau jour</p>
                      </div>
                    </label>
                    <label className={`radio-card ${isNo ? "selected-no" : ""}`} onClick={() => setFormData((p) => ({ ...p, attendance: "no" }))}>
                      <input type="radio" name="attendance" value="no" checked={isNo} onChange={handleChange} style={{ display: "none" }} />
                      <div className={`radio-dot ${isNo ? "active-no" : ""}`}>
                        {isNo && <div className="radio-dot-inner" style={{ background: "#8a8a8a" }} />}
                      </div>
                      <div>
                        <p className="font-sans-clean" style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600 }}>Je ne pourrai pas venir, avec regret 🥹</p>
                        <p className="font-sans-clean" style={{ color: "#8a8a8a", fontSize: "0.75rem", marginTop: "0.15rem" }}>Je serai avec vous en pensée</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ── 2. Invité principal ── */}
                <div
                  style={{
                    background: "#2C2C2C", borderRadius: "0.75rem",
                    padding: "1rem", border: "1px solid #444", marginBottom: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span className="font-sans-clean" style={{ color: "#C9A84C", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      Vous
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    <input className="form-input" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Prénom" style={{ padding: "0.6rem 0.875rem", fontSize: "0.8rem" }} />
                    <input className="form-input" type="text" name="lastName"  value={formData.lastName}  onChange={handleChange} required placeholder="Nom"    style={{ padding: "0.6rem 0.875rem", fontSize: "0.8rem" }} />
                  </div>
                </div>

                {/* ── 3. Accompagnants (uniquement si "je viens") ── */}
                {isYes && (
                  <div style={{ marginBottom: "1.5rem" }}>

                    {/* Cartes accompagnants */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      {companions.map((companion, index) => (
                        <div key={index} style={{ background: "#2C2C2C", borderRadius: "0.75rem", padding: "1rem", border: "1px solid #444" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                            <span className="font-sans-clean" style={{ color: "#C9A84C", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                              Accompagnant {index + 1}
                            </span>
                            <button
                              type="button" onClick={() => removeCompanion(index)}
                              style={{ background: "transparent", border: "none", color: "#666", fontSize: "1rem", cursor: "pointer", lineHeight: 1, padding: "0 0.25rem", transition: "color 0.2s" }}
                              onMouseEnter={e => e.currentTarget.style.color = "#e07070"}
                              onMouseLeave={e => e.currentTarget.style.color = "#666"}
                              aria-label="Supprimer"
                            >✕</button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                            <input className="form-input" type="text" placeholder="Prénom" value={companion.firstName} onChange={(e) => updateCompanion(index, "firstName", e.target.value)} required style={{ padding: "0.6rem 0.875rem", fontSize: "0.8rem" }} />
                            <input className="form-input" type="text" placeholder="Nom"    value={companion.lastName}  onChange={(e) => updateCompanion(index, "lastName",  e.target.value)} required style={{ padding: "0.6rem 0.875rem", fontSize: "0.8rem" }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bouton Ajouter un accompagnant */}
                    <button
                      type="button" onClick={addCompanion}
                      className="font-sans-clean"
                      style={{
                        width: "100%", padding: "0.75rem",
                        background: "transparent", border: "1px dashed #555",
                        color: "#8a8a8a", borderRadius: "0.75rem",
                        fontSize: "0.8rem", cursor: "pointer",
                        transition: "border-color 0.2s, color 0.2s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#555";    e.currentTarget.style.color = "#8a8a8a"; }}
                    >
                      <Users size={14} />
                      + Ajouter un accompagnant
                      {companions.length > 0 && (
                        <span style={{ background: "#C9A84C", color: "#2C2C2C", borderRadius: "999px", padding: "1px 8px", fontSize: "0.6rem", fontWeight: 700 }}>
                          {companions.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Message libre */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <label
                    className="font-sans-clean"
                    style={{ display: "block", color: "#8a8a8a", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}
                  >
                    Un mot pour les mariés <span style={{ opacity: 0.5 }}>(optionnel)</span>
                  </label>
                  <textarea
                    className="form-input"
                    name="message" value={formData.message} onChange={handleChange}
                    rows={3} placeholder="Un message, une restriction alimentaire…"
                    style={{ resize: "none" }}
                  />
                </div>

                {submitError && (
                  <p className="font-sans-clean" style={{ color: "#e07070", fontSize: "0.8rem", textAlign: "center", marginBottom: "0.75rem" }}>
                    {submitError}
                  </p>
                )}

                <button type="submit" className="submit-btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Envoi en cours…" : "Envoyer ma réponse"}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <footer style={{ padding: "4rem 1.5rem", background: "#FAF8F5", textAlign: "center" }}>
          <Divider />
          <br></br>

          <p
            className="font-sans-clean"
            style={{ color: "#7a7a7a", fontSize: "1rem", lineHeight: 1.9, maxWidth: 420, margin: "0 auto 0.75rem" }}
          >
            À cette occasion, nous serons heureux de vous compter parmi nous.
          </p>

          <p
            className="font-sans-clean"
            style={{ color: "#a0a0a0", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 400, margin: "0 auto" }}
          >
            📵 Afin de préserver ce moment précieux, merci de ne rien publier sur les réseaux sociaux.
          </p>

           <p
            className="font-serif-elegant"
            style={{ color: "#8a8a8a", fontSize: "1.45rem", fontStyle: "italic", marginTop: "1.25rem" }}
          >
            Myriam &amp; Souliman
          </p>

          <p
            className="font-sans-clean"
            style={{ color: "#b0b0b0", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: "0.4rem", marginBottom: "2rem" }}
          >
            Avec tout notre amour
          </p>
        </footer>

      </div>
    </>
  );
}
