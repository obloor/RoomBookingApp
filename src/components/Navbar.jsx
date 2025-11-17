// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

function NavigationBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="main-navbar">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="navbar-brand">Room Reservation</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" className="navbar-toggler" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Item>
              <Nav.Link as={Link} to="/" className="nav-link">Home</Nav.Link>
            </Nav.Item>
            {user && (
              <>
                <Nav.Item>
                  <Nav.Link as={Link} to="/my-reservations" className="nav-link">My Reservations</Nav.Link>
                </Nav.Item>
                {user.is_staff && (
                  <Nav.Item>
                    <Nav.Link as={Link} to="/admin" className="nav-link">Admin</Nav.Link>
                  </Nav.Item>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown 
                title={
                  <span>
                    <i className="bi bi-person-circle me-1"></i>
                    {user.username}
                  </span>
                } 
                id="user-dropdown" 
                align="end"
                className="nav-item"
              >
                <NavDropdown.Item as={Link} to="/profile" className="dropdown-item">
                  <i className="bi bi-person me-2"></i>Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="dropdown-item">
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Item>
                  <Nav.Link as={Link} to="/login" className="nav-link">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link as={Link} to="/register" className="nav-link">
                    <i className="bi bi-person-plus me-1"></i>Register
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;