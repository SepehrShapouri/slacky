import React from "react";
import { Skeleton } from "./ui/skeleton";
import EditorSkeletons from "./editor-skeletons";

function MessageListSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-5">
      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[110px] md:w-[410px]" />
          <Skeleton className="h-3 w-[110px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[50px]" />
          <Skeleton className="h-3 w-[80px]" />
          <Skeleton className="h-3 w-[131px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[60px]" />
          <Skeleton className="h-3 w-[170px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[170px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[90px]" />
          <Skeleton className="h-3 w-[110px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[145px]" />
          <Skeleton className="h-3 w-[70px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="md:flex hidden items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="md:flex hidden items-start gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="md:flex items-start gap-2 hidden">
        <Skeleton className="size-9 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="h-3 w-[210px]" />
        </div>
      </div>

      <div className="mt-10 md:mt-0"><EditorSkeletons /></div>
    </div>
  );
}

export default MessageListSkeleton;
