
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../constant';
import './Login.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: ''
  });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (formData.password !== formData.password2) {
      setMsg({ text: "Passwords don't match", type: 'error' });
      return;
    }

    setLoading(true);
    try {
        // Send request to backend
      await axios.post(`${BaseUrl}/api/register/`, {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim()
      });
     // Success message + redirect
      setMsg({ text: 'Registration successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      let errorMsg = 'Registration failed. Please try again.';
      if (err.response?.data) {
        const errors = err.response.data;
        const firstKey = Object.keys(errors)[0];
        if (firstKey) errorMsg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
      }
      setMsg({ text: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // UI layout
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Create an Account</h2>
        <p className="subtitle">Join us today</p>

        {msg.text && (
          <div className={`alert ${msg.type === 'error' ? 'alert-danger' : 'alert-success'}`}> {msg.text} </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {['username','email','first_name','last_name'].map(field => (
            <div key={field} className="form-group">
              <label>{field.replace('_',' ')}{['username','email'].includes(field) && ' *'}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required={['username','email'].includes(field)}
                disabled={loading}
                className="form-control"
              />
            </div>
          ))}

          <div className="form-group">
            <label>Password *</label>
            <input type="password" name="password" className="form-control"
              value={formData.password} onChange={handleChange} required disabled={loading} />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input type="password" name="password2" className="form-control"
              value={formData.password2} onChange={handleChange} required disabled={loading} />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <div className="text-center mt-3">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Register;
