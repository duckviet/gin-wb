// HomePage.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useNotes } from "@/shared/hooks/useNotes";
import { SearchField } from "@/features/search-content";
import { EmptyState } from "@/shared/components/EmptyState";
import { FloatingActionButton } from "@/shared/components/FloatingActionButton";
import { MasonryGrid } from "@/widgets/content-grid";
import NoteCard from "@/entities/note/ui/NoteCard";
import ArticleCard from "@/entities/web-article/ui/ArticleCard";
import AddNoteForm from "@/features/add-note/ui/AddNoteForm";
import { ReqUpdateNote, ResDetailNote } from "@/shared/services/generated/api";
import { AnimateCardProvider } from "@/entities/note/ui/AnimateCardProvider";
import {
  MultiZoneDndProvider,
  SortableItem,
  DroppableZone,
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@/shared/components/dnd";
import { TopOfMind } from "@/features/top-of-mind";
import { DragEndEvent } from "@dnd-kit/core";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);

  const [topOfMindNotes, setTopOfMindNotes] = useState<ResDetailNote[]>([]);

  const {
    notes: notesData,
    setNotes,
    isLoading,
    error,
    deleteNote,
    createNote,
    updateNote,
  } = useNotes({ limit: 50, offset: 0 });

  const notes = useMemo(() => {
    return (notesData || []).map((note) => ({
      ...note,
      score: 1.0,
    }));
  }, [notesData]);

  useEffect(() => {
    const topOfMindNotes = notes.slice(0, 5).map((note) => ({
      ...note,
      id: `tom-${note.id}`,
    }));
    setTopOfMindNotes(topOfMindNotes);
  }, [notes]);
  const filteredResults = useMemo(() => {
    if (!query.trim()) return notes;
    return notes.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content?.toLowerCase().includes(query.toLowerCase()) ||
        item.tags?.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );
  }, [notes, query]);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this note?")) {
      await deleteNote(id);
    }
  };

  const handleUpdate = async (id: string, data: ReqUpdateNote) => {
    try {
      await updateNote({ id, data });
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };
  const handleFabToggle = () => {
    setIsFabOpen(!isFabOpen);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Check if dropping into top-of-mind zone
    if (overId === "top-of-mind-zone") {
      // Find the note from main grid
      const noteToMove = notes.find((n) => n.id === activeId);
      if (noteToMove && !topOfMindNotes.find((n) => n.id === activeId)) {
        // Add to top of mind if not already there
        setTopOfMindNotes([...topOfMindNotes, noteToMove]);
      }
      return;
    }

    // Check if dropping into grid zone
    if (overId === "grid-zone") {
      // Remove from top of mind if it was there
      const wasInTopOfMind = topOfMindNotes.find((n) => n.id === activeId);
      if (wasInTopOfMind) {
        setTopOfMindNotes(topOfMindNotes.filter((n) => n.id !== activeId));
      }
      return;
    }

    // Handle reordering within top-of-mind
    const activeInTopOfMind = topOfMindNotes.find((n) => n.id === activeId);
    const overInTopOfMind = topOfMindNotes.find((n) => n.id === overId);

    if (activeInTopOfMind && overInTopOfMind && activeId !== overId) {
      const oldIndex = topOfMindNotes.findIndex((n) => n.id === activeId);
      const newIndex = topOfMindNotes.findIndex((n) => n.id === overId);
      setTopOfMindNotes(arrayMove(topOfMindNotes, oldIndex, newIndex));
      return;
    }

    // Handle reordering within grid
    const activeInGrid = notes.find((n) => n.id === activeId);
    const overInGrid = notes.find((n) => n.id === overId);

    if (activeInGrid && overInGrid && activeId !== overId) {
      const oldIndex = notes.findIndex((n) => n.id === activeId);
      const newIndex = notes.findIndex((n) => n.id === overId);
      setNotes(arrayMove(notes, oldIndex, newIndex));
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Failed to load notes</div>
      </div>
    );
  }

  return (
    <MultiZoneDndProvider
      onDragEnd={handleDragEnd}
      renderOverlay={(activeId) => {
        const noteId = activeId?.toString();
        const note =
          notes.find((n) => n.id === noteId) ||
          topOfMindNotes.find((n) => n.id === noteId);
        return note ? (
          <div className="opacity-80">
            <NoteCard match={{ ...note, score: 1.0 }} onUpdateNote={() => {}} />
          </div>
        ) : null;
      }}
    >
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <SearchField
            className="rounded-md"
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
            onEnter={() => {}}
          />

          {/* Top of Mind Zone with SortableContext */}
          <SortableContext
            items={topOfMindNotes.map((n) => n.id)}
            strategy={rectSortingStrategy}
          >
            <TopOfMind notes={topOfMindNotes} />
          </SortableContext>

          {/* Main Grid Zone with SortableContext */}
          <SortableContext
            items={notes.map((n) => n.id)}
            strategy={rectSortingStrategy}
          >
            <DroppableZone
              id="grid-zone"
              className="transition-all"
              activeClassName="ring-2 ring-green-400"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <SortableItem key={note.id} id={note.id}>
                    <NoteCard
                      match={note}
                      onDelete={handleDelete}
                      onUpdateNote={handleUpdate}
                    />
                  </SortableItem>
                ))}
              </div>
            </DroppableZone>
          </SortableContext>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-primary mt-2">
              {query ? "Search Results" : "Your Content"}
            </h2>
            <div className="text-sm text-text-muted">
              {filteredResults.length}{" "}
              {filteredResults.length === 1 ? "item" : "items"} found
            </div>
          </div>

          {filteredResults.length === 0 && !isLoading ? (
            <EmptyState
              type={query ? "no-results" : "new"}
              action={
                query
                  ? undefined
                  : {
                      label: "Add your first note",
                      onClick: () => setIsFabOpen(true),
                    }
              }
            />
          ) : (
            <MasonryGrid data={filteredResults} isLoading={isLoading}>
              {isLoading && filteredResults.length === 0 ? (
                <div key="loading">Loading...</div>
              ) : (
                <div key="content-grid">
                  <AnimateCardProvider>
                    {/* AddNoteForm */}
                    <div
                      key="add-note-form"
                      className="mb-6 break-inside-avoid"
                    >
                      <AddNoteForm onCreate={createNote} />
                    </div>
                    {/* Notes & Articles */}
                    {filteredResults.map((note) => (
                      <div
                        key={note.id}
                        className="h-fit mb-6 break-inside-avoid"
                      >
                        {note.content_type === "text" ? (
                          <NoteCard
                            match={note}
                            onDelete={handleDelete}
                            onUpdateNote={handleUpdate}
                          />
                        ) : (
                          <ArticleCard match={note} onDelete={handleDelete} />
                        )}
                      </div>
                    ))}
                  </AnimateCardProvider>
                </div>
              )}
            </MasonryGrid>
          )}
        </div>

        <FloatingActionButton isOpen={isFabOpen} onToggle={handleFabToggle} />
      </div>
    </MultiZoneDndProvider>
  );
}
