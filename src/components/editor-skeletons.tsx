import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function EditorSkeletons() {
  return (
    <div className="w-full rounded-md flex flex-col gap-1 border bg-background p-2">
      {/* Top toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Skeleton className="h-8 w-8" />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Message input area */}
      <Skeleton className="h-10 w-full" />

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  )
}