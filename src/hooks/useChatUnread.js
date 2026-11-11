import { useEffect, useState } from "react";
import { getConversationSummary } from "../api/conversations";

// Shared unread counter for portal navigation badges. Best-effort: a failed
// poll leaves the previous count in place.
export default function useChatUnread(pollMs = 60000) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getConversationSummary();
        if (active) setUnread(Number(data?.totalUnread) || 0);
      } catch {
        // Badge is nice-to-have; keep the last known value.
      }
    };
    load();
    const timer = setInterval(load, pollMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [pollMs]);

  return unread;
}
