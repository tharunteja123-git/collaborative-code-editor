import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const SYNC_SERVER_URL = "ws://localhost:1234";

const CURSOR_COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"];

function randomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

export default function CollabEditor({ roomId, language = "python", userName = "Anonymous", onReady }) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const bindingRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);

  const [connectedUsers, setConnectedUsers] = useState(1);
  const [syncStatus, setSyncStatus] = useState("connecting");

  useEffect(() => {
    if (!editorContainerRef.current) return;


    const editor = monaco.editor.create(editorContainerRef.current, {
      value: "",
      language,
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
    });
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(SYNC_SERVER_URL, roomId, ydoc);
    providerRef.current = provider;

    provider.on("status", ({ status }) => setSyncStatus(status)); // "connected" | "disconnected"

  
    provider.awareness.setLocalStateField("user", {
      name: userName,
      color: randomColor(),
    });

    provider.awareness.on("change", () => {
      setConnectedUsers(provider.awareness.getStates().size);
    });

    const yText = ydoc.getText("monaco");
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;

  
    if (onReady) {
      onReady({ getValue: () => editor.getValue() });
    }

    return () => {
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
      editor.dispose();
    };
  }, [roomId, language, userName]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 text-gray-200 text-xs">
        <span>
          Sync:{" "}
          <span className={syncStatus === "connected" ? "text-green-400" : "text-yellow-400"}>
            {syncStatus}
          </span>
        </span>
        <span>{connectedUsers} user{connectedUsers !== 1 ? "s" : ""} in room</span>
      </div>
      <div ref={editorContainerRef} className="flex-1 min-h-0" />
    </div>
  );
}
