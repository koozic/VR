import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "curator-conversation-session";
const CuratorSessionContext = createContext(null);

function createId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function createSession() {
  return {
    id: createId("session"),
    startedAt: new Date().toISOString(),
    messages: [],
  };
}

function loadSession() {
  if (typeof window === "undefined") return createSession();

  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    if (saved?.id && Array.isArray(saved.messages)) {
      return {
        ...saved,
        messages: saved.messages.filter((message) => message.source !== "stored"),
      };
    }
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  return createSession();
}

export function CuratorSessionProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const addMessage = useCallback((message) => {
    if (message.source === "stored") return null;

    const savedMessage = {
      id: createId("message"),
      createdAt: new Date().toISOString(),
      ...message,
    };
    setSession((current) => ({
      ...current,
      messages: [...current.messages, savedMessage],
    }));
    return savedMessage;
  }, []);

  const clearMessages = useCallback(() => {
    setSession(createSession());
  }, []);

  const value = useMemo(
    () => ({
      sessionId: session.id,
      messages: session.messages,
      addMessage,
      clearMessages,
    }),
    [addMessage, clearMessages, session.id, session.messages],
  );

  return (
    <CuratorSessionContext.Provider value={value}>
      {children}
    </CuratorSessionContext.Provider>
  );
}

export function useCuratorSession() {
  const context = useContext(CuratorSessionContext);
  if (!context) {
    throw new Error("useCuratorSession must be used inside CuratorSessionProvider");
  }
  return context;
}
