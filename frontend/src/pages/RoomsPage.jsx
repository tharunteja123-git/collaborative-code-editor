import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listRooms, createRoom, logout } from "../lib/api";

const LANGUAGES = ["python", "javascript"];

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("python");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200">
        
        {/* Header */}
       <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      Your Rooms
    </span>
  </h1>
          <button
  onClick={handleLogout}
  className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-lg shadow-sm hover:bg-red-100 hover:text-red-700 transition-all duration-200 ease-in-out transform hover:scale-105"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2"
    />
  </svg>
  Log out
</button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleCreate}
          className="flex gap-3 mb-8 bg-white/70 backdrop-blur-md p-5 rounded-xl shadow-md hover:shadow-lg transition"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter room name..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-md transition-transform transform hover:-translate-y-0.5">
            Create
          </button>
        </form>

        {/* Rooms List */}
        <ul className="space-y-4">
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="w-full text-left border border-gray-200 rounded-lg px-5 py-3 bg-white hover:bg-blue-50 transition-colors shadow-sm flex justify-between items-center hover:shadow-md"
              >
                <span className="font-semibold text-gray-800">{room.name}</span>
                <span className="text-gray-500 text-sm italic">{room.language}</span>
              </button>
            </li>
          ))}
          {rooms.length === 0 && (
            <p className="text-gray-400 text-sm text-center italic flex items-center justify-center gap-2">
              🚀 No rooms yet — create one above.
            </p>
          )}
        </ul>
      </div>
    </div>

  );
}



