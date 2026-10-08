import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const SYNC_SERVER_URL = "ws://localhost:1234";

// A small palette so each connected user gets a distinct cursor color.
const CURSOR_COLORS = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f472b6"];

function randomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

/**
 * roomId   - the Yjs doc name; all clients on the same roomId see the same document
 * language - Monaco syntax highlighting language
 * userName - shown next to this user's live cursor to other collaborators
 */
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

    // 1. Create the Monaco editor instance
    const editor = monaco.editor.create(editorContainerRef.current, {
      value: "",
      language,
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
    });
    editorRef.current = editor;

    // 2. Create the Yjs CRDT document and connect it to the sync server.
    //    All conflict resolution for concurrent edits happens inside Yjs —
    //    we never have to write merge logic ourselves.
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(SYNC_SERVER_URL, roomId, ydoc);
    providerRef.current = provider;

    provider.on("status", ({ status }) => setSyncStatus(status)); // "connected" | "disconnected"

    // 3. Set this user's presence (name + cursor color) so others can see who's who
    provider.awareness.setLocalStateField("user", {
      name: userName,
      color: randomColor(),
    });

    provider.awareness.on("change", () => {
      setConnectedUsers(provider.awareness.getStates().size);
    });

    // 4. Bind the Yjs shared text type to the Monaco editor model.
    //    From here on, every keystroke is automatically synced to all
    //    other clients via CRDT updates — this is the "no manual merge
    //    logic" payoff of using Yjs.
    const yText = ydoc.getText("monaco");
    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;

    // Hand the parent a stable way to read the current editor contents
    // (used by the "Run" button) without reaching into globals.
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
