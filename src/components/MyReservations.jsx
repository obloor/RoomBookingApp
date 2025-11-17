import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, Spinner, Alert, Table } from "react-bootstrap";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import roomService from "../api/roomService";

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await roomService.getUserReservations();
        setReservations(data);
      } catch {
        setError("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cancelReservation = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;

    try {
      await roomService.deleteReservation(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to cancel");
    }
  };

  if (loading) return <Spinner className="my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="my-5">
      <h2>My Reservations</h2>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Room</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>{r.room?.name || "No Room"}</td>
              <td>{format(new Date(r.start_time), "MMM d, yyyy h:mm a")}</td>
              <td>{format(new Date(r.end_time), "MMM d, yyyy h:mm a")}</td>
              <td>
                <Badge bg={r.status === "cancelled" ? "danger" : "success"}>
                  {r.status}
                </Badge>
              </td>
              <td className="d-flex gap-2">
                <Link
                  to={`/reservations/${r.id}/edit`}
                  className="btn btn-outline-primary btn-sm"
                >
                  Edit
                </Link>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => cancelReservation(r.id)}
                >
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default MyReservations;
