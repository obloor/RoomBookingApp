import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Container, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { bookingService } from "../api/bookingService.js";
import { toast } from "react-toastify";

function EditReservation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [attendees, setAttendees] = useState(1);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  // Load Reservation on page load
  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookingService.getBooking(id);
        setReservation(data);
        setTitle(data.title || "");
        setNotes(data.notes || "");
        setAttendees(data.attendees);
        setStartTime(new Date(data.start_time));
        setEndTime(new Date(data.end_time));
      } catch (e) {
        console.error(e);
        toast.error("Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Update function
const save = async () => {

  const payload = {
    title,
    notes,
    attendees,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    room_id: reservation.room.id,
  };

  try {
    await bookingService.updateBooking(id, payload);
    toast.success("Updated!");
    navigate("/my-reservations");
  } catch (err) {
    console.error("Full error:", err.response?.data);

    let msg = "Failed to update.";
    if (err.response?.data) {
      const first = Object.values(err.response.data)[0];
      msg = Array.isArray(first) ? first[0] : first;
    }
    toast.error(msg);
  }
};


  if (loading) return <Spinner className="my-5" />;
  if (!reservation) return <Alert variant="danger">Not found.</Alert>;

  return (
    <Container className="my-4">
      <Card>
        <Card.Body>
          <h3>Edit Reservation</h3>

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <DatePicker
              selected={startTime}
              onChange={(d) => setStartTime(d)}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <DatePicker
              selected={endTime}
              onChange={(d) => setEndTime(d)}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>

          <Button onClick={save}>Save</Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditReservation;
