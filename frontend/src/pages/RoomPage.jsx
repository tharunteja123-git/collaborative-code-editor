import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import CollabEditor from "../components/CollabEditor";
import OutputPanel from "../components/OutputPanel";
import { getRoom, executeCode } from "../lib/api";

export default function RoomPage() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const editorApiRef = useRef(null);

  useEffect(() => {
    getRoom(roomId).then(setRoom).catch(() => setRoom(null));
  }, [roomId]);

  const handleEditorReady = useCallback((api) => {
    editorApiRef.current = api;
  }, []);

  async function handleRun() {
    const code = editorApiRef.current?.getValue() ?? "";
    setRunning(true);
    try {
      const res = await executeCode(code, room?.language || "python");
      setResult(res);
    } catch (err) {
      setResult({
        stdout: "",
        stderr: err?.response?.data?.detail || "Execution failed",
        exit_code: null,
        timed_out: false,
        execution_time_ms: 0,
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white">
        <h1 className="text-sm font-semibold">
          {room ? room.name : "Loading room…"}
        </h1>
        <button
          onClick={handleRun}
          disabled={running}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-3 py-1 rounded"
        >
          {running ? "Running…" : "▶ Run"}
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-h-0">
          <CollabEditor
            roomId={roomId}
            language={room?.language || "python"}
            userName="You"
            onReady={handleEditorReady}
          />
        </div>
        <div className="w-96 shrink-0 border-l border-gray-700">
          <OutputPanel result={result} running={running} />
        </div>
      </div>
    </div>
  );
}
