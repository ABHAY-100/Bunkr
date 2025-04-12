"use client";

import { Navbar } from "@/components/navbar";
import { useProfile } from "@/app/api/users/myprofile";
import { useUser } from "@/app/api/users/user";
import { ProfileForm } from "@/app/(root)/profile/profile-form";
import { InstitutionSelector } from "./institution-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfileImage } from "@/lib/utils";
import Image from "next/image";

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: user, isLoading: userLoading } = useUser();

  const isLoading = profileLoading || userLoading;
  const profileImageSrc = getProfileImage(profile?.gender ?? null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-4 md:py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          <div className="md:col-span-1 space-y-4 md:space-y-6">
            <Card className="relative">
              <CardContent className="flex flex-col items-center md:items-start pt-12">
                <div className="h-[120px] md:h-[140px] w-full bg-white/8 absolute top-0 left-0 right-0 z-[0] rounded-t-xl" />
                <div className="relative w-24 h-24 mb-3">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-full z-10" />
                  ) : (
                    <Image
                      src={profileImageSrc || "/placeholder.svg"}
                      alt="Profile"
                      width={118}
                      height={118}
                      className="rounded-full object-cover border-4 border-primary/10 w-full h-full"
                    />
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                ) : (
                  <div className="text-center md:text-left w-full flex flex-col gap-1">
                    <h3 className="text-lg md:text-xl font-semibold mt-2">
                      {profile?.first_name} {profile?.last_name}
                    </h3>
                    <p className="text-muted-foreground text-sm lowercase">
                      @{user?.username}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="block">
              <InstitutionSelector />
            </div>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4">
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription className="hidden md:block">
                      Update your personal details here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : profile ? (
                      <ProfileForm profile={profile} />
                    ) : (
                      <div>Failed to load profile</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="mt-4">
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription className="hidden md:block">
                      View your account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Username</h3>
                            <div className="p-3 bg-secondary/50 rounded-md lowercase">
                              {user?.username}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Email</h3>
                            <div className="p-3 bg-secondary/50 rounded-md lowercase">
                              {user?.email}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">Mobile</h3>
                            <div className="p-3 bg-secondary/50 rounded-md">
                              +{user?.mobile}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">
                              Account Created
                            </h3>
                            <div className="p-3 bg-secondary/50 rounded-md">
                              {user?.created_at
                                ? new Date(user.created_at).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
