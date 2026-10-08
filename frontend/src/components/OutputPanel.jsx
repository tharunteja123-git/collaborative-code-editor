export default function OutputPanel({ result, running }) {
  return (
    <div className="h-full bg-black text-gray-100 font-mono text-sm p-3 overflow-auto">
      {running && <div className="text-yellow-400">Running in sandbox…</div>}

      {!running && !result && (
        <div className="text-gray-500">Output will appear here after you run your code.</div>
      )}

      {!running && result && (
        <>
          {result.timed_out && (
            <div className="text-red-400 mb-2">
              ⏱ Execution timed out and was terminated (limit enforced server-side).
            </div>
          )}
          {result.stdout && (
            <pre className="whitespace-pre-wrap text-green-300">{result.stdout}</pre>
          )}
          {result.stderr && (
            <pre className="whitespace-pre-wrap text-red-400">{result.stderr}</pre>
          )}
          <div className="text-gray-500 mt-2 text-xs">
            exit code: {result.exit_code ?? "—"} · {result.execution_time_ms}ms
          </div>
        </>
      )}
    </div>
  );
}
