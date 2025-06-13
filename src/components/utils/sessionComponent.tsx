"use client";

import { useState, useEffect } from "react";

const useSession = () => {
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    setSession(userData);
  }, []);

  return session;
}

export default useSession;