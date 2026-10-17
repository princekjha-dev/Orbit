"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  image: string | null;
  username: string;
}

export function NewConversationDialog({ currentUserId }: { currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.users || []);
    setLoading(false);
  };

  const startChat = async (userId: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId: userId }),
    });
    const data = await res.json();
    if (res.ok) {
      setOpen(false);
      router.push(`/messages/${data.id}`);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        New message
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="New message" description="Start a conversation with someone.">
        <div className="space-y-4">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Search by name or username..."
            value={query}
            onChange={(e) => search(e.target.value)}
            autoFocus
          />
          {loading && <p className="text-sm text-neutral-500">Searching...</p>}
          {results.length > 0 && (
            <ul className="space-y-1">
              {results.filter((u) => u.id !== currentUserId).map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => startChat(u.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-left"
                  >
                    <Avatar src={u.image} name={u.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{u.name}</p>
                      <p className="text-xs text-neutral-500">@{u.username}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.length >= 2 && !loading && results.length === 0 && (
            <p className="text-sm text-neutral-500">No users found</p>
          )}
        </div>
      </Dialog>
    </>
  );
}
