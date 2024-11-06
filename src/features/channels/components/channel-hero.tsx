import { format } from "date-fns";
import React from "react";
type ChannelHeroProps = {
  name: string;
  creationTime: Date;
};

function ChannelHero({ creationTime, name }: ChannelHeroProps) {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-[28px] font-bold flex items-center mb-2"># {name}</p>
      <p className="font-normal text-muted-foreground mb-4">
        This channel was created on {format(creationTime, "MMM do, yyyy")}. This
        is the very beginning of <strong># {name}</strong>.
      </p>
    </div>
  );
}

export default ChannelHero;
