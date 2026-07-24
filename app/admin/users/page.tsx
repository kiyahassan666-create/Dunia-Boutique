"use client";

import { useEffect, useState } from "react";
import { getDocuments, updateDocument, deleteDocument } from "@/lib/firebaseDb";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const all = await getDocuments("users");
        setUsers(all);
      } catch {}
    })();
  }, []);

  const toggleStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateDocument("users", uid, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, status: newStatus } : u));
    } catch {}
  };

  const deleteUser = async (uid: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteDocument("users", uid);
      setUsers(prev => prev.filter(u => u.id !== uid));
    } catch {}
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-medium text-charcoal dark:text-[#E8E0D8]">Users</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body mt-1">{filtered.length} registered users</p>
        </div>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full border border-gold/10 bg-ivory dark:bg-[#0A0A0A] px-4 py-3 text-sm text-charcoal dark:text-[#E8E0D8] outline-none focus:border-gold/30 transition-colors mb-6 font-body" />

      <div className="border border-gold/10 overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-gold/10">
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Name</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Email</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Phone</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Status</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Role</th>
              <th className="text-[10px] tracking-[0.2em] uppercase text-warm-gray font-body px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-xs text-warm-gray font-body">No users found</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3 font-serif text-sm text-charcoal dark:text-[#E8E0D8]">{u.name || "—"}</td>
                <td className="px-4 py-3 text-xs text-warm-gray font-body">{u.email || "—"}</td>
                <td className="px-4 py-3 text-xs text-warm-gray font-body">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] tracking-[0.15em] uppercase font-body px-2 py-0.5 ${u.status === "active" ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-red-400 bg-red-50 dark:bg-red-900/20"}`}>
                    {u.status || "active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[10px] tracking-[0.15em] uppercase text-warm-gray font-body">{u.role || "customer"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => toggleStatus(u.id, u.status || "active")} className="text-[10px] tracking-[0.15em] uppercase text-gold-dark hover:text-gold font-body transition-colors">
                    {u.status === "suspended" ? "Activate" : "Suspend"}
                  </button>
                  <button onClick={() => deleteUser(u.id)} className="text-[10px] tracking-[0.15em] uppercase text-red-400 hover:text-red-500 font-body transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
