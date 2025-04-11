import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { attendanceData } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface NavbarProps {
  selectedCourse: string;
  setSelectedCourse: (value: string) => void;
}

export const Navbar = ({ selectedCourse, setSelectedCourse }: NavbarProps) => {
  const handleLogout = () => {
    console.log("Logging out...");
  };

  return (
    <header className="sticky top-0 z-10 flex h-18 items-center gap-4 border-b bg-background px-4 md:px-6 text-white">
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-semibold gradient-title">bunkr</h1>
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
        <Button variant={"destructive"} onClick={handleLogout}>
          <LogOut className="mr-1 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};
