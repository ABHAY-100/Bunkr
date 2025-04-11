import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { attendanceData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { CircleUser, House, LogOut } from "lucide-react";
import { removeToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useUser } from "@/app/api/user";
import { useProfile } from "@/app/api/myprofile";
import Image from "next/image";
import { getProfileImage } from "@/lib/utils";

interface NavbarProps {
  selectedCourse: string;
  setSelectedCourse: (value: string) => void;
}

export const Navbar = ({ selectedCourse, setSelectedCourse }: NavbarProps) => {
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const profileImageSrc = getProfileImage(profile?.gender ?? null);

  const handleLogout = () => {
    removeToken();
    redirect("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 text-white">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-semibold gradient-title">bunkr</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {Object.entries(attendanceData.courses).map(([id, course]) => (
              <SelectItem key={id} value={id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <Image
                    src={profileImageSrc}
                    alt="Avatar"
                    width={36}
                    height={36}
                  />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium lowercase">
                  {user?.username}
                </p>
                <p className="text-xs text-muted-foreground lowercase">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => redirect("/")}>
              <House className="mr-2 h-4 w-4" />
              <span>Home</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => redirect("/profile")}>
              <CircleUser className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
