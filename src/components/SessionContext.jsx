import { createContext, useContext, useState, useEffect } from "react";

// Session Context to provide and store session information
const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState("");

  // On component mount, retrieve the session ID from localStorage
  useEffect(() => {
    const storedSession = localStorage.getItem("sessionID");
    if (storedSession) {
      setSession(storedSession);
    }
  }, []);

  // When the session ID changes, store it in localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem("sessionID", session);
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
