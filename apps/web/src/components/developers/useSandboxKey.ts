import { useState, useEffect } from "react";

export function useSandboxKey() {
  const [apiKey, setApiKey] = useState<string>("");
  const [keyCopied, setKeyCopied] = useState<boolean>(false);

  const generateNewSandboxKey = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const newKey = `pp_test_${randomHex}`;
    setApiKey(newKey);
    try {
      localStorage.setItem("pressprotocol_sandbox_key", newKey);
    } catch {}
    return newKey;
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pressprotocol_sandbox_key");
      if (stored && stored.startsWith("pp_test_")) {
        setApiKey(stored);
      } else {
        generateNewSandboxKey();
      }
    } catch {
      generateNewSandboxKey();
    }
  }, []);

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  return {
    apiKey,
    keyCopied,
    generateNewSandboxKey,
    copyApiKey,
  };
}
