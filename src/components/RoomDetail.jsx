import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Badge, Container, Row, Col, Form } from 'react-bootstrap';
import {
  FaWifi, FaTv, FaUsers, FaVideo, FaCoffee, FaWheelchair,
  FaCalendarAlt, FaClock, FaUserFriends
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import roomService from "../api/roomService";
import bookingService from "../api/bookingService";
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  
  const defaultEndTime = new Date(now);
  defaultEndTime.setHours(now.getHours() + 1);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startTime, setStartTime] = useState(now);
  const [endTime, setEndTime] = useState(defaultEndTime);

  const [isBooking, setIsBooking] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [bookingData, setBookingData] = useState({
    title: '',
    purpose: '',
    attendees: 1,
    start_time: now,
    end_time: defaultEndTime
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomData = await roomService.getRoom(id);
        setRoom(roomData);
      } catch {
        setError("Failed to load room.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: name === "attendees" ? parseInt(value) : value
    }));
  };

  const handleDateChange = (date) => {
    if (!date) return;

    const newStart = new Date(date);
    newStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const newEnd = new Date(newStart);
    newEnd.setHours(newStart.getHours() + 1);

    setStartTime(newStart);
    setEndTime(newEnd);

    setBookingData((prev) => ({
      ...prev,
      start_time: newStart,
      end_time: newEnd
    }));
  };

  const handleStartTimeChange = (date) => {
    if (!date) return;
    
    const newStart = new Date(startTime);
    newStart.setHours(date.getHours(), date.getMinutes(), 0, 0);

    if (newStart < new Date()) {
      toast.error("Start time must be in the future");
      return;
    }

    const newEnd = new Date(newStart);
    newEnd.setHours(newStart.getHours() + 1);

    setStartTime(newStart);
    setEndTime(newEnd);

    setBookingData((prev) => ({
      ...prev,
      start_time: newStart,
      end_time: newEnd
    }));
  };

  const handleEndTimeChange = (date) => {
    const newEnd = new Date(startTime);
    newEnd.setHours(date.getHours(), date.getMinutes());

    if (newEnd <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    setEndTime(newEnd);

    setBookingData((prev) => ({
      ...prev,
      end_time: newEnd
    }));
  };

  const handleBookNow = async () => {
    if (!user) {
      const errorMsg = 'User not logged in';
      console.error(errorMsg);
      toast.error("Please log in to book a room");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const errors = {};
    if (!bookingData.title.trim()) errors.title = "Meeting title required";
    if (bookingData.attendees < 1) errors.attendees = "At least one attendee is required";
    if (bookingData.attendees > room.capacity) errors.attendees = `Maximum capacity is ${room.capacity} attendees`;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    const start = new Date(bookingData.start_time);
    const end = new Date(bookingData.end_time);

    if (start <= new Date()) {
      const errorMsg = 'Start time is in the past';
      console.error(errorMsg, { start, now: new Date() });
      toast.error("Start time must be in the future");
      return;
    }

    if (end <= start) {
      const errorMsg = 'End time is before start time';
      console.error(errorMsg, { start, end });
      toast.error("End time must be after start time");
      return;
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 8) {
      const errorMsg = 'Booking duration exceeds 8 hours';
      console.error(errorMsg, { durationHours });
      toast.error("Maximum booking duration is 8 hours");
      return;
    }

    setIsBooking(true);

    try {
      const payload = {
        room_id: parseInt(id),        client: user.email,
        title: bookingData.title.trim(),
        notes: bookingData.purpose.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        attendees: bookingData.attendees
      };
      
      await bookingService.createBooking(payload);
      
      toast.success("Room booked successfully!");
      navigate("/my-reservations");

    } catch (error) {
      let errorMessage = 'Booking failed. Please try again.';

      if (error.response) {
        console.error('Error response headers:', error.response.headers);
        
        if (error.response.status === 400) {
          const errorData = error.response.data;
          console.error('Error details:', errorData);

          if (errorData.non_field_errors) {
            const errorText = Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors.join(' ')
              : String(errorData.non_field_errors);

            if (errorText.includes('already booked')) {
              errorMessage = 'This room is already booked for the selected time. Please choose a different time or date.';
            } else {
              errorMessage = errorText;
            }
          } else if (error.response.data) {
            const fieldErrors = Object.entries(error.response.data)
              .filter(([key]) => key !== 'non_field_errors')
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`);
            
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('\n');
            }
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          navigate('/login', { state: { from: window.location.pathname } });
          return;
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else {
        console.error('Error message:', error.message);
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="text-center my-5"><Spinner /></div>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!room) return <Container><Alert>Room not found</Alert></Container>;

  const duration = (endTime - startTime) / (1000 * 60 * 60);

  return (
    <Container className="my-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Img src={room.image || "https://via.placeholder.com/800x500"} />
            <Card.Body>
              <h2>{room.name}</h2>
              <p className="text-muted">
                <FaUsers className="me-2" />
                Capacity: {room.capacity} people
              </p>

              <h5>Features</h5>
              <div className="d-flex flex-wrap gap-3 mb-3">
                <span><FaWifi /> WiFi</span>
                <span><FaVideo /> Projector</span>
                <span><FaTv /> TV</span>
                <span><FaCoffee /> Coffee Station</span>
                <span><FaWheelchair /> Accessible</span>
              </div>

              <p>{room.description || "No details provided."}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: "20px" }}>
            <Card.Body>
              <h4>Book This Room</h4>

              <Form.Group className="mb-3">
                <Form.Label>Meeting Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={bookingData.title}
                  onChange={handleBookingChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Select Date</Form.Label>
                <DatePicker
                  selected={startTime}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Start</Form.Label>
                  <DatePicker
                    selected={startTime}
                    onChange={handleStartTimeChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="form-control"
                  />
                </Col>
                <Col>
                  <Form.Label>End</Form.Label>
                  <DatePicker
                    selected={endTime}
                    onChange={handleEndTimeChange}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="form-control"
                    minTime={startTime}
                  />
                </Col>
              </Row>

              <div className="text-center mb-3">
                <Badge bg="primary">
                  {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                  {duration.toFixed(1)} hrs)
                </Badge>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Attendees</Form.Label>
                <Form.Control
                  type="number"
                  name="attendees"
                  min="1"
                  max={room.capacity}
                  value={bookingData.attendees}
                  onChange={handleBookingChange}
                  isInvalid={!!formErrors.attendees}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.attendees}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Purpose</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="purpose"
                  value={bookingData.purpose}
                  onChange={handleBookingChange}
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100"
                onClick={handleBookNow}
                disabled={isBooking}
              >
                {isBooking ? "Booking..." : "Book Now"}
              </Button>

              {!user && <p className="text-center mt-2 small text-muted">You must be logged in</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RoomDetail;
