import { useEffect, useState } from "react";
import API from "../api/api";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

 const loadPending = async () => {
  const res = await API.get("/properties/pending");
  setPending(res.data);
};

const approve = async (id) => {
  await API.patch(`/properties/${id}/approve`);
  loadPending();
};

const reject = async (id) => {
  await API.patch(`/properties/${id}/reject`);
  loadPending();
};

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {pending.length === 0 ? (
        <p>No pending properties</p>
      ) : (
        pending.map((item) => (
          <div key={item._id}>
            <h3>{item.title}</h3>
            <p>{item.county} - {item.area}</p>
            <p>Ksh {item.price}</p>

            <button onClick={() => approve(item._id)}>Approve</button>
            <button onClick={() => reject(item._id)}>Reject</button>
          </div>
        ))
      )}
    </div>
  );
}