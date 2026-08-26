import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext'; 
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const { updateUser } = useUser(); 
  
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username or Name is required';
    } 
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({}); 
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/players/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid username or password');
      }

      updateUser({
        name: data.username,
        kp: data.knowledgePoints || 150,
        unlockedBooks: data.unlockedBooks || []
      });

      const tokenData = {
        id: data.id,
        username: data.username,
        email: data.email || formData.username,
        knowledgePoints: data.knowledgePoints || 150,
        unlockedBooks: data.unlockedBooks || []
      };

      if (formData.rememberMe) {
        localStorage.setItem('userToken', JSON.stringify(tokenData));
        localStorage.setItem('userId', data.id);
      } else {
        sessionStorage.setItem('userToken', JSON.stringify(tokenData));
        sessionStorage.setItem('userId', data.id);
      }
      
      console.log('Login successful, Context Updated & Token Saved!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: error.message || 'Failed to connect to server. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        <button className="modal-close" onClick={() => navigate('/')}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="modal-icon">
          <i className="fas fa-book-open"></i>
        </div>
        
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to access your BiblioTheca account</p>
            </div>

            {errors.submit && (
              <div className="error-banner">
                <i className="fas fa-exclamation-circle"></i>
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username (Full Name)
                </label>
                <div className="input-with-icon">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Enter your registered name"
                    autoComplete="username"
                  />
                </div>
                {errors.username && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.username}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-with-icon password-input-wrapper">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className={`btn-submit ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="social-login">
              <button className="social-btn google" type="button">
                <i className="fab fa-google"></i>
                Google
              </button>
              <button className="social-btn github" type="button">
                <i className="fab fa-github"></i>
                GitHub
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;