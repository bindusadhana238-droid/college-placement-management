import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000";

// --- LOGIN PAGE ---
function Login() {
  const [email, setEmail] = useState("bindu@test.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert(data.msg);
      if (data.user.role === "admin") navigate("/admin");
      else navigate("/student");
    } else {
      alert(data.msg);
    }
  };

  const handleRegister = async () => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: email.split("@")[0], email, password, role }),
    });
    const data = await res.json();
    alert(data.msg);
  };

  return (
    <div className="login-container">
      <h1>College Placement Portal</h1>
      <form onSubmit={handleLogin} className="card">
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login as {role}</button>
        <button type="button" onClick={handleRegister} className="secondary">Register as {role}</button>
      </form>
    </div>
  );
}

// --- STUDENT DASHBOARD ---
function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/jobs`).then(r => r.json()).then(setJobs);
  }, []);

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="dashboard">
      <header>
        <h2>Welcome {user.name} 👩‍🎓 (Student)</h2>
        <button onClick={logout}>Logout</button>
      </header>
      <h3>Available Jobs - {jobs.length}</h3>
      <div className="job-grid">
        {jobs.map(job => (
          <div key={job._id} className="job-card">
            <h4>{job.company} - {job.role}</h4>
            <p>💰 {job.package} | 📍 {job.location}</p>
            <p>{job.description}</p>
            <button onClick={() => alert(`Applied for ${job.company}!`)}>Apply Now</button>
          </div>
        ))}
      </div>
      {jobs.length === 0 && <p>No jobs posted yet. Admin needs to post jobs.</p>}
    </div>
  );
}

// --- ADMIN DASHBOARD ---
function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: "", role: "", package: "", location: "", description: "" });
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const fetchJobs = () => fetch(`${API}/api/jobs`).then(r => r.json()).then(setJobs);
  useEffect(() => { fetchJobs(); }, []);

  const postJob = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    alert(data.msg);
    setForm({ company: "", role: "", package: "", location: "", description: "" });
    fetchJobs();
  };

  const deleteJob = async (id) => {
    await fetch(`${API}/api/jobs/${id}`, { method: "DELETE" });
    fetchJobs();
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="dashboard">
      <header>
        <h2>Welcome {user.name} 👩‍💼 (Admin)</h2>
        <button onClick={logout}>Logout</button>
      </header>

      <div className="admin-panel">
        <form onSubmit={postJob} className="card">
          <h3>Post New Job</h3>
          <input placeholder="Company (e.g. TCS)" value={form.company} onChange={e => setForm({...form, company: e.target.value })} required />
          <input placeholder="Role (e.g. SDE)" value={form.role} onChange={e => setForm({...form, role: e.target.value })} required />
          <input placeholder="Package (e.g. 7 LPA)" value={form.package} onChange={e => setForm({...form, package: e.target.value })} required />
          <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value })} />
          <button type="submit">Post Job</button>
        </form>

        <div>
          <h3>All Jobs ({jobs.length})</h3>
          {jobs.map(job => (
            <div key={job._id} className="job-card">
              <b>{job.company} - {job.role}</b> <span>{job.package}</span>
              <button onClick={() => deleteJob(job._id)} style={{ marginLeft: 10, background: "red" }}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}