import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
type UserBannerProps = {
  avatarUrl?: string;
  fallback?: string;
  name?: string;
};
function UserBanner({ avatarUrl, fallback, name }: UserBannerProps) {
  return (
    <div className="flex flex-col h-ful gap-4 p-4">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-[102px] rounded-lg">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-sky-500 text-white font-bold text-5xl rounded-lg">
            {fallback}
          </AvatarFallback>
        </Avatar>
        <h1 className="capitalize text-xl font-bold flex items-center gap-2">
          {name}
          <span className="flex items-center justify-center size-2 rounded-full bg-[#481349]">
            <span className="size-1.5 bg-[#007a5a]  rounded-full shrink-0 " />
          </span>
        </h1>
      </div>
      <div className="flex flex-col gap-4 items-start">
        <p className="text-muted-foreground">
          This conversation is just between{" "}
          <span className="bg-sky-700/30 p-0.5 px-1 text-center rounded-sm text-sky-500">
            @{name}
          </span>{" "}
          and you. Check out their profile to learn more about them.
        </p>
        <Button className="font-bold" variant="outline" size="sm">
          View profile
        </Button>
      </div>
    </div>
  );
}

export default UserBanner;
