import React from "react";
import { DroppableZone, SortableItem } from "@/shared/components/dnd";
import { ResDetailNote } from "@/shared/services/generated/api";
import TopOfMindCard from "./TopOfMindCard";

type Props = {
  notes: ResDetailNote[];
  handleDelete?: (id: string) => void;
  handleUpdate?: (id: string, note: ResDetailNote) => void;
};

const TopOfMind = ({ notes, handleDelete, handleUpdate }: Props) => {
  return (
    <DroppableZone
      id="top-of-mind-zone"
      className="flex gap-3 justify-center items-center bg-[#dee2ea] w-full rounded-md my-4 p-4 min-h-[120px] transition-all"
      activeClassName="ring-2 ring-blue-400 bg-blue-50"
    >
      {notes.length === 0 ? (
        <div className="text-text-muted text-sm">
          Drag notes here to pin them
        </div>
      ) : (
        notes.map((note) => (
          <SortableItem key={note.id} id={note.id}>
            <TopOfMindCard note={note} />
          </SortableItem>
        ))
      )}
    </DroppableZone>
  );
};

export default TopOfMind;
