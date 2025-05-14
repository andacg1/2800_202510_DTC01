import React, { useState, useEffect } from "react";

interface ComparisonSession {
  id: string;
  name: string;
  products: string[];
}

interface ComparisonSessionManagerProps {
  onSessionChange: (sessionId: string) => void;
  onNewSession: () => void;
  currentSessionId?: string;
}

export const ComparisonSessionManager: React.FC<
  ComparisonSessionManagerProps
> = ({ onSessionChange, onNewSession, currentSessionId }) => {
  const [sessions, setSessions] = useState<ComparisonSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  useEffect(() => {
    const savedSessions = localStorage.getItem("comparisonSessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);

      if (
        currentSessionId &&
        parsedSessions.some((s: ComparisonSession) => s.id === currentSessionId)
      ) {
        setSelectedSessionId(currentSessionId);
      } else if (parsedSessions.length > 0) {
        setSelectedSessionId(parsedSessions[0].id);
        onSessionChange(parsedSessions[0].id);
      }
    }
  }, [currentSessionId, onSessionChange]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("comparisonSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleSessionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSessionId = event.target.value;
    setSelectedSessionId(newSessionId);
    onSessionChange(newSessionId);
  };

  const handleNewSession = () => {
    const newSession: ComparisonSession = {
      id: `session-${Date.now()}`,
      name: `Comparison ${sessions.length + 1}`,
      products: [],
    };

    setSessions((prev) => [...prev, newSession]);
    setSelectedSessionId(newSession.id);
    onNewSession();
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <select
        value={selectedSessionId}
        onChange={handleSessionChange}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={sessions.length === 0}
      >
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
