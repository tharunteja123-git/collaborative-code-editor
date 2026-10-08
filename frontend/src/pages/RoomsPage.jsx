import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listRooms, createRoom, logout } from "../lib/api";

const LANGUAGES = ["python", "javascript"];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("python");
  const navigate = useNavigate();

  useEffect(() => {
    refreshRooms();
  }, []);

  function refreshRooms() {
    listRooms().then(setRooms).catch(() => setRooms([]));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const room = await createRoom(name.trim(), language);
    setName("");
    refreshRooms();
    navigate(`/rooms/${room.id}`);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Your Rooms</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:underline">
          Log out
        </button>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Room name"
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded px-2 py-2 text-sm"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm">
          Create
        </button>
      </form>

      <ul className="space-y-2">
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="w-full text-left border rounded px-4 py-3 hover:bg-gray-50"
            >
              <span className="font-medium">{room.name}</span>
              <span className="text-gray-400 text-sm ml-2">({room.language})</span>
            </button>
          </li>
        ))}
        {rooms.length === 0 && (
          <p className="text-gray-400 text-sm">No rooms yet — create one above.</p>
        )}
      </ul>
    </div>
  );
}
