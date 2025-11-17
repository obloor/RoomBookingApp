import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import roomService from '../api/roomService';

function MakeReservation() {
  const location = useLocation();
  const navigate = useNavigate();
  const roomIdFromUrl = new URLSearchParams(location.search).get('roomId');

  const [formData, setFormData] = useState({
    room: location.state?.roomId || roomIdFromUrl || '',
    start_date: location.state?.startDate ? new Date(location.state.startDate) : new Date(),
    end_date: location.state?.endDate
      ? new Date(location.state.endDate)
      : new Date(new Date().setDate(new Date().getDate() + 1)),
    guests: 1,
    special_requests: '',
  });

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const res = await roomService.getAvailableRooms({
          start_date: formData.start_date.toISOString().split('T')[0],
          end_date: formData.end_date.toISOString().split('T')[0],
          capacity: formData.guests,
        });
        setRooms(res.data);

        const found = res.data.find(r => r.id.toString() === formData.room.toString());
        setSelectedRoom(found || null);
      } catch {
        setError('Failed to load available rooms. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [formData.start_date, formData.end_date, formData.guests]);




  if (loading && rooms.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" /> Back to Rooms
      </Button>

      <Row className="g-4">
        <Col lg={8}>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white"><h5>Booking Summary</h5></Card.Header>
            <Card.Body>
              {selectedRoom ? (
                <>
                  <h6>{selectedRoom.name}</h6>
                  <p className="text-muted">{selectedRoom.description}</p>
                  <div className="d-flex justify-content-between"><span>Total:</span><strong>${calculateTotal()}</strong></div>
                  {isAvailable !== null && (
                    <div className={`alert ${isAvailable ? 'alert-success' : 'alert-warning'} d-flex align-items-center mt-3`}>
                      {isAvailable ? <FaCheckCircle className="me-2" /> : <FaTimesCircle className="me-2" />}
                      {isAvailable ? 'Room available' : 'Room unavailable'}
                    </div>
                  )}
                </>
              ) : <p className="text-muted text-center">Select a room to see booking details</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MakeReservation;
