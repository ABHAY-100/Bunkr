"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, CircleUser, LogOut, Building2, Shapes } from "lucide-react";
import { removeToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/api/users/user";
import { useProfile } from "@/app/api/users/myprofile";
import { useNotifications } from "@/app/api/users/notifications";
import {
  useInstitutions,
  useDefaultInstitutionUser,
  useUpdateDefaultInstitutionUser,
} from "@/app/api/users/institutions";
import Image from "next/image";
import { getProfileImage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Navbar = () => {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: profile } = useProfile();
  const { data: notifications, isLoading: notificationsLoading } =
    useNotifications();
  const { data: institutions, isLoading: institutionsLoading } =
    useInstitutions();
  const { data: defaultInstitutionUser } = useDefaultInstitutionUser();
  const updateDefaultInstitutionUser = useUpdateDefaultInstitutionUser();
  const queryClient = useQueryClient();

  const [selectedInstitution, setSelectedInstitution] = useState<string>("");

  const profileImageSrc = getProfileImage(profile?.gender ?? null);
  const unreadNotifications =
    notifications?.filter((n) => n.read_at === null) || [];

  useEffect(() => {
    if (defaultInstitutionUser) {
      setSelectedInstitution(defaultInstitutionUser.toString());
    }
  }, [defaultInstitutionUser]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleInstitutionChange = (value: string) => {
    setSelectedInstitution(value);
    updateDefaultInstitutionUser.mutate(Number.parseInt(value), {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["defaultInstitutionUser"] });
        queryClient.invalidateQueries({ queryKey: ["institutions"] });
        toast("Institution updated", {
          description: "Your default institution has been updated.",
        });
      },
      onError: () => {
        setSelectedInstitution(defaultInstitutionUser?.toString() || "");
        toast("Error", {
          description: "Failed to update institution. Please try again.",
        });
      },
    });
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const parseNotificationData = (data: string) => {
    const deviceMatch = data.match(/Date:(.+?), Time:(.+?) $$UTC$$, (.+)/);
    if (deviceMatch) {
      const [, date, time, device] = deviceMatch;
      return {
        date,
        time,
        device: device.split("/").slice(0, 2).join(" • "),
      };
    }
    return { date: "", time: "", device: "Unknown device" };
  };

  const truncateText = (text: string, limit: number) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  return (
    <header className="sticky top-0 z-10 flex h-17 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 text-white">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold gradient-logo">
          bunkr
        </h1>
      </div>

      <div className="flex items-center justify-between gap-2 md:gap-6 lowercase">
        {!institutionsLoading && institutions && institutions.length > 0 && (
          <div className="flex max-[400px]:hidden">
            <Select
              value={selectedInstitution}
              onValueChange={handleInstitutionChange}
            >
              <SelectTrigger className="w-[140px] md:w-[220px]">
                <SelectValue>
                  {selectedInstitution &&
                    institutions?.find(
                      (i) => i.id.toString() === selectedInstitution
                    ) && (
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        <span className="truncate">
                          {truncateText(
                            (
                              institutions.find(
                                (i) => i.id.toString() === selectedInstitution
                              )?.institution.name || ""
                            ).toLowerCase(),
                            window.innerWidth < 768 ? 10 : 16
                          )}
                        </span>
                      </div>
                    )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id.toString()}>
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{inst.institution.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground hidden md:inline">
                        ({inst.institution_role.name})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications.length > 9
                      ? "9+"
                      : unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                {unreadNotifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadNotifications.length} unread
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <ScrollArea className="h-[400px]">
                {notificationsLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2 items-start p-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const { device } = parseNotificationData(notification.data);
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-secondary/50 ${
                          notification.read_at === null ? "bg-secondary/20" : ""
                        }`}
                      >
                        <div className="flex gap-2 items-start">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Bell className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium">
                              New login detected
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {device}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatNotificationDate(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 outline-2">
                  <AvatarFallback>
                    <Image
                      src={profileImageSrc || "/placeholder.svg"}
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
              <DropdownMenuItem onClick={() => navigateTo("/dashboard")}>
                <Shapes className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo("/profile")}>
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
      </div>
    </header>
  );
};
