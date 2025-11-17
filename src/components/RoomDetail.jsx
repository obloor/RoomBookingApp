
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Badge, Container, Row, Col, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import roomService from '../api/roomService';
import bookingService from '../api/bookingService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Round to next 15 min block
  const roundToInterval = (d, interval = 15) => {
    const copy = new Date(d);
    const minutes = Math.ceil(copy.getMinutes() / interval) * interval;
    copy.setMinutes(minutes, 0, 0);
    return copy;
  };

  const initialStart = roundToInterval(new Date());
  const initialEnd = new Date(initialStart.getTime() + 60 * 60 * 1000);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [booking, setBooking] = useState({
    title: '',
    purpose: '',
    attendees: 1,
    start: initialStart,
    end: initialEnd,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

// Load room data
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await roomService.getRoom(id);
        setRoom(data);
      } catch {
        setError('Failed to load room.');
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [id]);

  const updateTime = (field, value) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  // Validation
  const handleBookNow = async () => {
    if (!user) {
      toast.error('Please login first');
      return navigate('/login');
    }
    const { title, attendees, start, end } = booking;
    if (!title.trim()) return toast.error('Meeting title required');
    if (attendees < 1) return toast.error('Attendees must be at least 1');
    if (attendees > room.capacity) return toast.error(`Max capacity is ${room.capacity}`);
    if (start <= new Date()) return toast.error('Start must be in the future');
    if (end <= start) return toast.error('End must be after start');
    if ((end - start) / (1000 * 60 * 60) > 8) return toast.error('Max duration is 8 hours');

    setIsSubmitting(true);

    try {
        // API payload
      await bookingService.createBooking({
        room_id: Number(id),
        title: title.trim(),
        notes: booking.purpose.trim(),
        attendees,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

      toast.success('Room booked successfully');
      navigate('/my-reservations');
    } catch (err) {
      let msg = 'Booking failed.';
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        msg = Array.isArray(first) ? first[0] : first;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center my-5"><Spinner /></div>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!room) return <Container><Alert>Room not found</Alert></Container>;

  const duration = (booking.end - booking.start) / (1000 * 60 * 60);

  // UI Layout
  return (
    <Container className="my-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Img src={room.image || 'https://via.placeholder.com/800x500'} />
            <Card.Body>
              <h2>{room.name}</h2>
              <p className="text-muted">Capacity: {room.capacity} people</p>
              <h5>Amenities</h5>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {(room.amenities || []).map((a, i) => (
                  <Badge key={i} bg="secondary">{a}</Badge>
                ))}
              </div>
              <p>{room.description || 'No details provided.'}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Body>
              <h4>Book This Room</h4>

              <Form.Group className="mb-3">
                <Form.Label>Meeting Title</Form.Label>
                <Form.Control
                  type="text"
                  value={booking.title}
                  onChange={e => setBooking({ ...booking, title: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <DatePicker
                  selected={booking.start}
                  onChange={d => updateTime('start', new Date(d.setHours(booking.start.getHours(), booking.start.getMinutes())))}
                  minDate={new Date()}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Start Time</Form.Label>
                  <DatePicker
                    selected={booking.start}
                    onChange={d => updateTime('start', d)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="form-control"
                  />
                </Col>
                <Col>
                  <Form.Label>End Time</Form.Label>
                  <DatePicker
                    selected={booking.end}
                    onChange={d => updateTime('end', d)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="form-control"
                  />
                </Col>
              </Row>

              <div className="text-center mb-3">
                <Badge bg="primary">
                  {booking.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {booking.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({duration.toFixed(1)} hrs)
                </Badge>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Attendees</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={room.capacity}
                  value={booking.attendees}
                  onChange={e => setBooking({ ...booking, attendees: Number(e.target.value) })}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Purpose</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={booking.purpose}
                  onChange={e => setBooking({ ...booking, purpose: e.target.value })}
                />
              </Form.Group>

              <Button
                variant="primary"
                disabled={isSubmitting}
                onClick={handleBookNow}
                className="w-100"
              >
                {isSubmitting ? 'Booking...' : 'Book Now'}
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
