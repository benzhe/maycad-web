import { useRef, useEffect, type KeyboardEvent } from 'react';
import { useCadStore } from '../store/cadStore';

export function CommandLine() {
  const { commandHistory, commandInput, setCommandInput, executeCommand } = useCadStore();
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      executeCommand(commandInput.trim());
    }
  };

  return (
    <div className="command-line">
      <div className="command-history" ref={historyRef}>
        {commandHistory.map((line, i) => (
          <div key={i} className={`cmd-line ${line.startsWith('>') ? 'cmd-input-echo' : 'cmd-output'}`}>
            {line}
          </div>
        ))}
      </div>
      <div className="command-input-row">
        <span className="cmd-prompt">Command:</span>
        <input
          type="text"
          className="cmd-input"
          value={commandInput}
          onChange={e => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="LINE, CIRCLE, ARC, RECT, POLYLINE, TEXT, MOVE, UNDO, REDO, DELETE, ZOOM..."
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
