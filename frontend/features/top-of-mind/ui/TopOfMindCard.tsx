import React from "react";
import { Card } from "@/shared/components/Card";
import { ResDetailNote } from "@/shared/services/generated/api";

type TopOfMindCardProps = {
  note: ResDetailNote;
};

const TopOfMindCard: React.FC<TopOfMindCardProps> = ({ note }) => {
  return (
    <Card className="w-34 h-full  flex flex-col justify-center items-center rounded-lg bg-white ">
      {/* <h3 className="text-base font-semibold text-center truncate w-full px-2">
        {note.title}
      </h3> */}
      <p className="text-xs text-text-muted  line-clamp-4 w-full">
        {note.content}
      </p>
    </Card>
  );
};

export default TopOfMindCard;
