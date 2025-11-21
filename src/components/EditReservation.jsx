import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import roomService from "../api/roomService";
import { formatISO } from "date-fns";

function EditReservation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    start_time: "",
    end_time: "",
    notes: "",
    attendees: 1,
  });

  // Load reservation on mount
  useEffect(() => {
    const loadReservation = async () => {
      try {
        const data = await roomService.getReservation(id);
        setReservation(data);

        // Pre-fill form
        setFormData({
          start_time: data.start_time.slice(0, 16),
          end_time: data.end_time.slice(0, 16),
          notes: data.notes || "",
          attendees: data.attendees,
        });
      } catch (err) {
        setError("Failed to load reservation");
      } finally {
        setLoading(false);
      }
    };

    loadReservation();
  }, [id]);

  const updateReservation = async (e) => {
    e.preventDefault();

    try {
      await roomService.updateReservation(id, {
        start_time: formatISO(new Date(formData.start_time)),
        end_time: formatISO(new Date(formData.end_time)),
        notes: formData.notes,
        attendees: formData.attendees,
      });

      alert("Reservation updated!");
      navigate("/my-reservations");
    } catch (err) {
      console.log(err);
      setError("Update failed — check times for conflicts");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="container my-5">
      <h2>Edit Reservation</h2>

      <form onSubmit={updateReservation} className="mt-4">

        <div className="mb-3">
          <label>Start Time</label>
          <input
            type="datetime-local"
            className="form-control"
            value={formData.start_time}
            onChange={(e) =>
              setFormData({ ...formData, start_time: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label>End Time</label>
          <input
            type="datetime-local"
            className="form-control"
            value={formData.end_time}
            onChange={(e) =>
              setFormData({ ...formData, end_time: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label>Notes</label>
          <textarea
            className="form-control"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label>Attendees</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={formData.attendees}
            onChange={(e) =>
              setFormData({ ...formData, attendees: Number(e.target.value) })
            }
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditReservation;
