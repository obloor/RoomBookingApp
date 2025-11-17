import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import roomService from "../api/roomService";
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaMapMarkerAlt, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import './AllRooms.css';

function AllRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch rooms on page load
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await roomService.getAllRooms();
                setRooms(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                setError("Failed to load rooms. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    // Loading spinner
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    // Error message
    if (error) {
        return (
            <div className="container mt-4">
                <Alert variant="danger">
                    <Alert.Heading>Error Loading Rooms</Alert.Heading>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </Alert>
            </div>
        );
    }
    // CSS and HTML structure
    return (
        <div style={{
            width: '100%',
            padding: '20px 0',
            boxSizing: 'border-box',
            backgroundColor: 'transparent',
            margin: 0
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                <h1 style={{
                    textAlign: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                }}>Our Meeting Rooms</h1>
                <p style={{
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    color: '#6c757d',
                    marginBottom: '40px'
                }}>Find the perfect space for your next meeting or event</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                    width: '100%',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 20px',
                    boxSizing: 'border-box'
                }}>
                {rooms.map((room) => (
                    <div key={room.id} style={{ width: '100%', maxWidth: '300px' }}>
                        <Link to={`/rooms/${room.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                            <Card className="h-100 room-card shadow-sm border-0 overflow-hidden">
                                <div className="position-relative">
                                    <div className="room-image" style={{
                                        backgroundImage: `url('https://source.unsplash.com/random/600x400/?meeting-room,${room.id}')`,
                                        height: '200px',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}>
                                        <div className="position-absolute top-0 end-0 m-3">
                                            <Badge bg={room.is_available ? 'success' : 'danger'} className="px-3 py-2">
                                                {room.is_available ? 'Available' : 'Booked'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="text-dark mb-3">{room.name}</Card.Title>
                                    <div className="mb-3">
                                        <p className="text-muted mb-2">
                                            <FaMapMarkerAlt className="me-2 text-primary" />
                                            {room.location}
                                        </p>
                                        <p className="text-muted mb-2">
                                            <FaUsers className="me-2 text-primary" />
                                            Up to {room.capacity} people
                                        </p>
                                        {room.amenities && (
                                            <div className="mt-2">
                                                {room.amenities.map((amenity, index) => (
                                                    <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <button className="btn btn-outline-primary w-100">
                                            <FaCalendarAlt className="me-2" />
                                            Book Now
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}

export default AllRooms;
