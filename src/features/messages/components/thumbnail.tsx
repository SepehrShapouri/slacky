import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";

type ThumbnailProps = {
  image: string | null | undefined;
};

export default function Thumbnail({ image }: ThumbnailProps) {
  if (!image) return null;
  return (
    <Dialog>
      <DialogTrigger>
        <div className="relatice overflow-hidden max-w-[230px] border rounded-lg my-2 cursor-zoom-in">
          <img
            src={image}
            alt="attachemnt"
            className="rounded-md object-cover size-full"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] borde-none bg-transparent p-0 shadow-non">
        <img
          src={image}
          alt="attachemnt"
          className="rounded-md object-cover size-full"
        />
      </DialogContent>
    </Dialog>
  );
}
