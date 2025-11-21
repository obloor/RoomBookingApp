import {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {
    Button, Card, Spinner, Container, Row, Col, Alert, Form
} from 'react-bootstrap';
import {FaArrowLeft, FaCheckCircle, FaTimesCircle} from 'react-icons/fa';

import { roomService } from '../api/roomService.jsx';
import { bookingService } from '../api/bookingService.js';


function MakeReservation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Pull roomId
    const roomIdFromUrl = new URLSearchParams(location.search).get("roomId");
    const initialRoom = location.state?.roomId || roomIdFromUrl || "";

    // Format timestamp for Django
    const formatForDjango = (date) => date.toISOString().slice(0, 19);

    const [formData, setFormData] = useState({
        room: String(initialRoom),
        start_date: new Date(),
        end_date: new Date(Date.now() + 60 * 60 * 1000), // +1 hour
        guests: 1,
        special_requests: "",
    });

    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAvailable, setIsAvailable] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Load available rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);

                const res = await roomService.getAvailableRooms({
                    start_date: formData.start_date.toISOString().split("T")[0],
                    end_date: formData.end_date.toISOString().split("T")[0],
                    capacity: formData.guests,
                });

                setRooms(res.data);

                // Check if selected room is available
                const found = res.data.find(r => r.id.toString() === formData.room.toString());
                setSelectedRoom(found || null);
                setIsAvailable(!!found);

            } catch {
                setError("Failed to load available rooms.");
                console.log("FULL ERROR:", error.response?.data);

            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, [formData.start_date, formData.end_date, formData.guests]);

    // Submit reservation
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        if (!formData.room) {
            setError("Room is required.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                room: Number(formData.room),
                start_time: formatForDjango(formData.start_date),
                end_time: formatForDjango(formData.end_date),
                attendees: formData.guests,
                notes: formData.special_requests,
                client: 'Anonymous User',
                status: 'scheduled'
            };

            await bookingService.createBooking(payload);
            navigate("/my-reservations");

        } catch (err) {
            console.log("SERVER ERROR:", err.response?.data);
            setError(
                err.response?.data?.room ||
                err.response?.data?.start_time ||
                err.response?.data?.end_time ||
                "Failed to create reservation."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Loading screen
    if (loading && rooms.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{minHeight: "60vh"}}>
                <Spinner animation="border"/>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
                <FaArrowLeft className="me-2"/> Back to Rooms
            </Button>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="p-3 shadow-sm">
                        <Form onSubmit={handleSubmit}>

                            <Form.Group className="mb-3">
                                <Form.Label>Start</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={formData.start_date.toISOString().slice(0, 16)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) =>
                                        setFormData({...formData, start_date: new Date(e.target.value)})
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>End</Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    value={formData.end_date.toISOString().slice(0, 16)}
                                    min={formData.start_date.toISOString().slice(0, 16)}
                                    onChange={(e) =>
                                        setFormData({...formData, end_date: new Date(e.target.value)})
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Attendees</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    value={formData.guests}
                                    onChange={e =>
                                        setFormData({...formData, guests: Number(e.target.value)})
                                    }
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={formData.special_requests}
                                    onChange={(e) =>
                                        setFormData({...formData, special_requests: e.target.value})
                                    }
                                />
                            </Form.Group>

                            <Button className="mt-3 w-100" type="submit" disabled={submitting}>
                                {submitting ? "Booking…" : "Book Room"}
                            </Button>

                        </Form>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <h5>Booking Summary</h5>
                        </Card.Header>

                        <Card.Body>
                            {selectedRoom ? (
                                <>
                                    <h6>{selectedRoom.name}</h6>
                                    <p className="text-muted">{selectedRoom.description}</p>

                                    {isAvailable !== null && (
                                        <div
                                            className={`alert ${
                                                isAvailable ? "alert-success" : "alert-warning"
                                            } d-flex align-items-center`}
                                        >
                                            {isAvailable ? (
                                                <FaCheckCircle className="me-2"/>
                                            ) : (
                                                <FaTimesCircle className="me-2"/>
                                            )}
                                            {isAvailable ? "Room available" : "Room unavailable"}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted text-center">Select a room to see booking details</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default MakeReservation;
