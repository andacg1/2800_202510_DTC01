import React, { useState, useEffect } from "react";

interface ComparisonSession {
  id: string;
  name: string;
  productIds: string[];
}

interface ComparisonSessionManagerProps {
  sessions: ComparisonSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSessionClick: () => void;
}

export const ComparisonSessionManager: React.FC<
  ComparisonSessionManagerProps
> = ({ sessions, currentSessionId, onSessionSelect, onNewSessionClick }) => {
  const [selectedUiId, setSelectedUiId] = useState<string>("");

  useEffect(() => {
    if (currentSessionId) {
      setSelectedUiId(currentSessionId);
    } else if (sessions.length > 0) {
      setSelectedUiId(sessions[0].id);
    } else {
      setSelectedUiId("");
    }
  }, [currentSessionId, sessions]);

  const handleSessionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSessionId = event.target.value;
    setSelectedUiId(newSessionId);
    onSessionSelect(newSessionId);
  };

  const handleNewSession = () => {
    onNewSessionClick();
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg shadow mb-4">
      <select
        value={selectedUiId}
        onChange={handleSessionChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={sessions.length === 0}
      >
        {sessions.length === 0 && <option value="">No sessions</option>}
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleNewSession}
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        New Comparison
      </button>
    </div>
  );
};

export default ComparisonSessionManager;
