import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redireciona automaticamente para /welcome
    setLocation("/welcome");
  }, [setLocation]);

  return null;
}
