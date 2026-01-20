"use client";

import { useState, useEffect } from "react";
import { SchoolData } from "@/app/lib/types";
import { US_STATES, USState } from "@/app/lib/constants";

interface SchoolSelectionPopupProps {
  onComplete: () => void;
}

async function getIdToken(): Promise<string | null> {
  const { getAuth } = await import("firebase/auth");
  const auth = getAuth();
  return auth.currentUser?.getIdToken() || null;
}

export default function SchoolSelectionPopup({ onComplete }: SchoolSelectionPopupProps) {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<USState | "">("");
  const [createName, setCreateName] = useState("");
  const [createState, setCreateState] = useState<USState>("CA");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    let filtered = schools;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.state.toLowerCase().includes(query)
      );
    }

    if (filterState) {
      filtered = filtered.filter(s => s.state === filterState);
    }

    setFilteredSchools(filtered);
  }, [schools, searchQuery, filterState]);

  async function fetchSchools() {
    try {
      const response = await fetch("/api/schools");
      if (response.ok) {
        const data = await response.json();
        setSchools(data);
        setFilteredSchools(data);
      }
    } catch (err) {
      console.error("Error fetching schools:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectSchool(schoolId: string) {
    setSelectedSchoolId(schoolId);
    setSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/users/school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ schoolId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign school");
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select school");
      setSelectedSchoolId(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: createName, state: createState }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create school");
      }

      await response.json();
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create school");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="m-4 w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-2xl">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading schools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border/50 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border bg-card">
          <h2 className="text-xl font-bold tracking-tight">Select Your School</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your school to see listings from your campus community
          </p>
        </div>

        <div className="p-4 border-b border-border bg-muted/30">
          {!showCreateForm ? (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-none bg-background py-2.5 pl-10 pr-4 text-sm shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterState("")}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    filterState === ""
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-background text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted hover:text-foreground"
                  }`}
                >
                  All States
                </button>
                <div className="relative">
                   <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value as USState | "")}
                    className="appearance-none rounded-full px-4 py-1.5 pr-8 text-xs font-semibold bg-background text-muted-foreground ring-1 ring-inset ring-border focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted transition-all"
                  >
                    <option value="">More States...</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                   <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setShowCreateForm(false);
                setError(null);
              }}
              className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background ring-1 ring-inset ring-border group-hover:bg-primary group-hover:text-white group-hover:ring-primary transition-colors">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              Back to schools
            </button>
          )}
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh] bg-muted/10">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-red-100 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-900/20">
              {error}
            </div>
          )}

          {!showCreateForm ? (
            filteredSchools.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-muted-foreground mb-6 font-medium">No schools found matching your search</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-0.5"
                >
                  Create New School
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSelectSchool(school.id)}
                    disabled={submitting && selectedSchoolId === school.id}
                    className="group w-full flex items-center justify-between rounded-xl border border-transparent bg-background p-4 text-left shadow-sm ring-1 ring-border/50 transition-all hover:border-primary/30 hover:shadow-md hover:ring-primary/30 active:scale-[0.99] disabled:opacity-50"
                  >
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{school.name}</p>
                      <p className="text-sm text-muted-foreground">{school.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{school.memberCount}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">members</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 p-4 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Can't find your school? Create it
                </button>
              </div>
            )
          ) : (
            <form onSubmit={handleCreateSchool} className="space-y-5 py-2">
              <div className="space-y-2">
                <label htmlFor="schoolName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  School Name
                </label>
                <input
                  id="schoolName"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Enter school name"
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="schoolState" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  State
                </label>
                <div className="relative">
                  <select
                    id="schoolState"
                    value={createState}
                    onChange={(e) => setCreateState(e.target.value as USState)}
                    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  >
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                   <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Create School"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
