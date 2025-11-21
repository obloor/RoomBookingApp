import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Badge, Container, Row, Col, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import roomService from '../api/roomService';
import { bookingService } from "../api/bookingService";

import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // round to 15min
  const roundToInterval = (d, interval = 15) => {
    const copy = new Date(d);
    const minutes = Math.ceil(copy.getMinutes() / interval) * interval;
    copy.setMinutes(minutes, 0, 0);
    return copy;
  };

  const now = roundToInterval(new Date());

  // store date + times SEPARATELY
  const [booking, setBooking] = useState({
    title: "",
    purpose: "",
    attendees: 1,
    date: now,
    startTime: now,
    endTime: new Date(now.getTime() + 60 * 60 * 1000)
  });

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // merge date + time into full datetime
  const mergeDateTime = (date, time) => {
    const d = new Date(date);
    d.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return d;
  };

  const formatLocal = (date) => {
    const pad = (n) => (n < 10 ? "0" + n : n);
    return (
      date.getFullYear() +
      "-" + pad(date.getMonth() + 1) +
      "-" + pad(date.getDate()) +
      "T" + pad(date.getHours()) +
      ":" + pad(date.getMinutes()) +
      ":00"
    );
  };

  // load room info
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const data = await roomService.getRoom(id);
        setRoom(data);
      } catch {
        setError("Failed to load room.");
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [id]);

  // booking handler
  const handleBookNow = async () => {
    if (!user) {
      toast.error("Please login first");
      return navigate("/login");
    }

    const start = mergeDateTime(booking.date, booking.startTime);
    const end = mergeDateTime(booking.date, booking.endTime);

    if (!booking.title.trim()) return toast.error("Meeting title required");
    if (booking.attendees < 1) return toast.error("Attendees must be at least 1");
    if (booking.attendees > room.capacity) return toast.error(`Max capacity is ${room.capacity}`);
    if (start <= new Date()) return toast.error("Start must be in the future");
    if (end <= start) return toast.error("End must be after start");
    if ((end - start) / (1000 * 60 * 60) > 8) return toast.error("Max duration is 8 hours");

    setIsSubmitting(true);

    try {
      await bookingService.createBooking({
        room: Number(id),
        title: booking.title.trim(),
        notes: booking.purpose.trim(),
        attendees: booking.attendees,
        start_time: formatLocal(start),
        end_time: formatLocal(end)
      });

      toast.success("Room booked successfully");
      navigate("/my-reservations");


    } catch (err) {
      const raw = err.response?.data;
      let msg = raw ? Object.values(raw)[0] : "Booking failed.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center my-5"><Spinner /></div>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!room) return <Container><Alert>Room not found</Alert></Container>;

  const startFull = mergeDateTime(booking.date, booking.startTime);
  const endFull = mergeDateTime(booking.date, booking.endTime);
  const duration = (endFull - startFull) / (1000 * 60 * 60);

  return (
    <Container className="my-4">
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Img src={room.image || "https://via.placeholder.com/800x500"} />
            <Card.Body>
              <h2>{room.name}</h2>
              <p className="text-muted">Capacity: {room.capacity} people</p>
              <h5>Amenities</h5>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {(room.amenities || []).map((a, i) => (
                  <Badge key={i} bg="secondary">{a}</Badge>
                ))}
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
                  value={booking.title}
                  onChange={(e) =>
                    setBooking({ ...booking, title: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <DatePicker
                  selected={booking.date}
                  onChange={(date) =>
                    setBooking({ ...booking, date })
                  }
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  className="form-control"
                />
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Start Time</Form.Label>
                  <DatePicker
                    selected={booking.startTime}
                    onChange={(time) =>
                      setBooking({ ...booking, startTime: time })
                    }
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
                    selected={booking.endTime}
                    onChange={(time) =>
                      setBooking({ ...booking, endTime: time })
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="form-control"
                  />
                </Col>
              </Row>

              {/* duration */}
              <div className="text-center mb-3">
                <Badge bg="primary">
                  {startFull.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                  {endFull.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {" "}( {duration.toFixed(1)} hrs )
                </Badge>
              </div>

              {/* attendees */}
              <Form.Group className="mb-3">
                <Form.Label>Attendees</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={room.capacity}
                  value={booking.attendees}
                  onChange={(e) =>
                    setBooking({ ...booking, attendees: Number(e.target.value) })
                  }
                />
              </Form.Group>

              {/* purpose */}
              <Form.Group className="mb-4">
                <Form.Label>Purpose</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={booking.purpose}
                  onChange={(e) =>
                    setBooking({ ...booking, purpose: e.target.value })
                  }
                />
              </Form.Group>

              <Button
                variant="primary"
                disabled={isSubmitting}
                onClick={handleBookNow}
                className="w-100"
              >
                {isSubmitting ? "Booking..." : "Book Now"}
              </Button>

              {!user && (
                <p className="text-center mt-2 small text-muted">
                  You must be logged in
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RoomDetail;
