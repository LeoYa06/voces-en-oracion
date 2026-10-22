import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen, CalendarDays, Cross, Heart, HandHeart, Menu, ShieldCheck,
  Users, X, ChevronRight, LockKeyhole, Sparkles
} from "lucide-react";
import { supabase } from "./supabase";
import "./styles.css";

const initialIntentions = [
  { id: "demo-1", category: "Familia", text: "Por la unión, la paz y el amor en nuestras familias.", anonymous: true, prayers: 3 },
  { id: "demo-2", category: "Acción de gracias", text: "Damos gracias por las bendiciones recibidas y por quienes nos acompañan.", anonymous: true, prayers: 5 },
];

const sections = [
  { id: "inicio", label: "Inicio", icon: Heart },
  { id: "oraciones", label: "Evangelio del día", icon: BookOpen },
  { id: "intenciones", label: "Intenciones", icon: HandHeart },
  { id: "reuniones", label: "Reuniones", icon: CalendarDays },
];

function App() {
  const [section, setSection] = useState("inicio");
  const [gospel, setGospel] = useState(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}evangelio.json?d=${new Date().toISOString().slice(0,10)}`)
      .then(r => { if (!r.ok) throw Error("No disponible"); return r.json(); })
      .then(setGospel).catch(() => setGospel(null));
  }, []);
  const [intentions, setIntentions] = useState(initialIntentions);
  const [prayed, setPrayed] = useState([]);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState("Familia");
  const [anonymous, setAnonymous] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendPrayerRequest(event) {
    event.preventDefault();
    setMessage("");
    if (draft.trim().length < 5) {
      setMessage("Escribe una intención de al menos 5 caracteres.");
      return;
    }
    if (!supabase) {
      setIntentions((old) => [{
        id: crypto.randomUUID(), category, text: draft.trim(), anonymous, prayers: 0,
      }, ...old]);
      setDraft("");
      setShowForm(false);
      setMessage("Añadida a la demostración local. Para publicarla para otras personas, primero hay que conectar la base de datos y el acceso de miembros.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthOpen(true);
      setAuthMessage("Inicia sesión para compartir una intención.");
      return;
    }
    const { error } = await supabase.from("prayer_intentions").insert({
      category, body: draft.trim(), anonymous, visibility: "public", created_by: user.id
    });
    if (error) {
      setMessage("No se pudo publicar. Comprueba la configuración de la base de datos y los permisos.");
      return;
    }
    setDraft("");
    setShowForm(false);
    setMessage("Tu intención se ha enviado.");
    await loadPublicIntentions();
  }

  async function loadPublicIntentions() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("prayer_intentions")
      .select("id, category, body, anonymous, created_at")
      .eq("visibility", "public")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(30);
    if (!error && data) {
      setIntentions(data.map((row) => ({
        id: row.id, category: row.category, text: row.body,
        anonymous: row.anonymous, prayers: 0
      })));
    }
  }

  async function sendMagicLink(event) {
    event.preventDefault();
    if (!supabase) {
      setAuthMessage("La autenticación todavía no está conectada. Sigue las instrucciones de README.md para configurar Supabase.");
      return;
    }
    if (!email.trim()) {
      setAuthMessage("Escribe tu correo electrónico.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);
    setAuthMessage(error ? "No se pudo enviar el enlace. Revisa la configuración de correo en Supabase." : "Revisa tu correo: te hemos enviado un enlace seguro para entrar.");
  }

  React.useEffect(() => { loadPublicIntentions(); }, []);

  function supportPrayer(id) {
    if (prayed.includes(id)) return;
    setPrayed((old) => [...old, id]);
    setMessage("Gracias por acompañar esta intención con tu oración. En esta versión inicial, el gesto se guarda solo en esta sesión.");
  }

  function go(id) {
    setSection(id);
    setMenuOpen(false);
    setMessage("");
  }

  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("es", { weekday:"long", day:"numeric", month:"long", year:"numeric" }).format(today);
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" onClick={() => go("inicio")} aria-label="A los pies de Jesús, inicio">
          <img className="brand-logo" src={`${import.meta.env.BASE_URL}logo-voces.png`} alt="Voces en Oración" />
          <span><strong>Voces en Oración</strong><small>«A LOS PIES DE JESÚS»</small></span>
        </a>
        <button className="mobile-menu icon-button" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} className={section === id ? "nav-link active" : "nav-link"} onClick={() => go(id)}>
              <Icon size={17} /> {label}
            </button>
          ))}

        </nav>
      </header>

      <main>
        {section === "inicio" && <>
          <section className="daily-gospel" aria-label="Evangelio del día">
            <div className="daily-gospel-top"><BookOpen size={22}/><span>EVANGELIO DEL DÍA</span></div>
            <p className="daily-date">{dateLabel}</p>
            <h2>{gospel?.titulo || "Escuchemos hoy la Palabra de Dios"}</h2>
            {gospel?.fecha === new Date().toLocaleDateString("en-CA", {timeZone:"America/Chicago"}) && gospel?.texto ? <><p className="gospel-reference">{gospel.cita || "Evangelio"}</p><div className="gospel-text">{gospel.texto.split("\n").filter(Boolean).map((line,i)=><p key={i}>{line}</p>)}</div></> : <p>El Evangelio completo de hoy está disponible en la fuente oficial. Estamos preparando la lectura automática.</p>}
            <a className="gospel-link" href="https://bible.usccb.org/es" target="_blank" rel="noopener noreferrer">Leer el Evangelio de hoy <ChevronRight size={17}/></a>
            <small>Fuente: Conferencia de Obispos Católicos de Estados Unidos (USCCB). El texto completo se abre en su sitio oficial.</small>
          </section>
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow"><Sparkles size={14} /> UN ESPACIO PARA LA FE Y LA ESPERANZA</span>
              <h1>Voces en Oración<br /><em>A los pies de Jesús</em></h1>
              <p>Una comunidad que se reúne en la fe para escuchar la Palabra de Dios, compartir nuestras intenciones y orar unos por otros.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => go("oraciones")}>Leer el Evangelio <ChevronRight size={17} /></button>
                <button className="secondary-button" onClick={() => { go("intenciones"); setShowForm(true); }}>Compartir una intención</button>
              </div>
            </div>
            <div className="hero-verse">
              <Cross size={25} />
              <p>«Donde dos o tres están reunidos en mi nombre, allí estoy yo en medio de ellos».</p>
              <small>MATEO 18, 20</small>
            </div>
          </section>
          <section className="welcome-grid">
            <article className="welcome-card">
              <span className="card-icon"><HandHeart /></span><h2>Oramos unos por otros</h2>
              <p>Comparte una intención o acompaña en oración a alguien de nuestra comunidad.</p>
              <button className="text-link" onClick={() => go("intenciones")}>Ver intenciones <ChevronRight size={16} /></button>
            </article>
            <article className="welcome-card">
              <span className="card-icon"><BookOpen /></span><h2>Evangelio del día</h2>
              <p>Detengámonos a escuchar la Palabra de Dios y meditarla en nuestro corazón.</p>
              <button className="text-link" onClick={() => go("oraciones")}>Leer el Evangelio <ChevronRight size={16} /></button>
            </article>
            <article className="welcome-card">
              <span className="card-icon"><CalendarDays /></span><h2>Caminamos juntos</h2>
              <p>Consulta la información de los próximos encuentros de oración.</p>
              <button className="text-link" onClick={() => go("reuniones")}>Ver reuniones <ChevronRight size={16} /></button>
            </article>
          </section>
          <section className="privacy-note"><ShieldCheck size={21} /><div><strong>Un espacio que cuida a las personas</strong><p>Las peticiones personales merecen respeto. Comparte solo lo que deseas hacer público y evita incluir datos médicos o información privada de terceros.</p></div></section>
        </>}

        {section === "oraciones" && <section className="page-section">
          <span className="eyebrow">LA PALABRA DE DIOS</span><h1>Evangelio del día</h1>
          <p className="page-intro">Un espacio para leer el Evangelio, meditarlo y dejar que la Palabra de Jesús ilumine nuestra vida cotidiana.</p>
          <article className="prayer-reading"><span className="card-icon"><BookOpen /></span><h2>La Palabra de hoy</h2><p className="daily-date">{dateLabel}</p><p>{gospel?.fecha === new Date().toLocaleDateString("en-CA", {timeZone:"America/Chicago"}) && gospel?.texto ? gospel.texto : "Consulta el Evangelio correspondiente a hoy en el sitio oficial de lecturas católicas."}</p><a className="gospel-link" href="https://bible.usccb.org/es" target="_blank" rel="noopener noreferrer">Abrir lectura de hoy <ChevronRight size={17}/></a><p className="form-hint">La fecha cambia automáticamente. En esta versión, el texto completo se consulta en la fuente oficial; todavía no se importa dentro de la aplicación.</p></article>
          <article className="scripture-card"><Cross size={22}/><div><h2>Para reflexionar</h2><p>¿Qué palabra de Jesús quiero llevar conmigo hoy? ¿Cómo puedo vivirla en mi familia y con las personas que encuentre?</p><p>Tomemos un momento de silencio y pongamos nuestra jornada a los pies de Jesús.</p></div></article>
        </section>}

        {section === "intenciones" && <section className="page-section">
          <span className="eyebrow">COMUNIDAD Y ACOMPAÑAMIENTO</span><h1>Intenciones de oración</h1>
          <p className="page-intro">Cada petición es una oportunidad para acompañar a un hermano o hermana en la fe.</p>
          <div className="section-toolbar"><span>{intentions.length} intenciones de ejemplo o publicadas</span><button className="primary-button" onClick={() => { setShowForm(!showForm); setMessage(""); }}>{showForm ? "Cerrar formulario" : "＋ Compartir intención"}</button></div>
          {showForm && <form className="intention-form" onSubmit={sendPrayerRequest}>
            <label htmlFor="category">Tipo de intención</label><select id="category" value={category} onChange={(e) => setCategory(e.target.value)}><option>Familia</option><option>Salud</option><option>Trabajo</option><option>Matrimonio</option><option>Conversión</option><option>Acción de gracias</option><option>Otra</option></select>
            <label htmlFor="draft">Tu intención</label><textarea id="draft" rows="4" maxLength="600" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escribe una petición o acción de gracias. Evita compartir datos privados de otras personas." />
            <label className="check-label"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} /> No mostrar mi nombre públicamente</label>
            <p className="form-hint">Al publicar, confirmas que tienes permiso para compartir la información incluida.</p>
            <button className="primary-button" type="submit">Enviar intención <Heart size={16} /></button>
          </form>}
          {message && <p className="status-message" role="status">{message}</p>}
          <div className="intentions-list">{intentions.map((item) => <article className="intention-card" key={item.id}>
            <div className="intention-meta"><span className="category-pill">{item.category}</span><span className="anonymous-label">{item.anonymous ? "Comunidad" : "Miembro"}</span></div>
            <p>{item.text}</p>
            <button className={prayed.includes(item.id) ? "prayer-button prayed" : "prayer-button"} onClick={() => supportPrayer(item.id)} disabled={prayed.includes(item.id)}><HandHeart size={17} /> {prayed.includes(item.id) ? "Acompañas esta intención" : "Estoy orando por ti"} <span>· {item.prayers + (prayed.includes(item.id) ? 1 : 0)}</span></button>
          </article>)}</div>
          <p className="demo-note">Versión de presentación: las intenciones añadidas aquí solo se guardan temporalmente en este navegador. No incluyas datos sensibles ni información privada de otras personas. Para recibir peticiones reales de toda la comunidad, conectaremos una base de datos y moderación en una siguiente etapa.</p>
        </section>}

        {section === "reuniones" && <section className="page-section">
          <span className="eyebrow">ENCUENTROS DE LA COMUNIDAD</span><h1>Nos reunimos para orar</h1>
          <p className="page-intro">Un tiempo para detenernos, escuchar y poner nuestras vidas en manos del Señor.</p>
          <article className="meeting-card"><div className="meeting-date"><CalendarDays size={28}/><span>ENCUENTRO</span></div><div className="meeting-details"><h2>Reunión de oración</h2><p><strong>Horario:</strong> Viernes, 7:00–8:00 PM</p><p><strong>Lugar:</strong> Capilla del Santísimo Sacramento</p><p className="form-hint">Confirma con el coordinador la fecha y el lugar antes de asistir. El horario de esta pantalla es un dato inicial de ejemplo.</p></div></article>
          <div className="privacy-note"><Users size={21}/><div><strong>¿Quieres participar?</strong><p>Contacta al coordinador del grupo para recibir información y acceso al espacio privado.</p></div></div>
        </section>}
      </main>

      <footer className="footer"><div className="footer-brand"><Cross size={20}/><strong>Voces en Oración</strong></div><p>«A los pies de Jesús» · Un proyecto comunitario gratuito, al servicio de la oración y la fraternidad.</p><small>Un espacio de acompañamiento espiritual; no sustituye la orientación pastoral ni la ayuda profesional cuando sea necesaria.</small></footer>


    </div>
  );
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
