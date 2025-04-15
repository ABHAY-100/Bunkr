"use client";

import { Navbar } from "@/components/navbar";
import { useProfile } from "@/app/api/users/myprofile";
import { useEffect } from "react";
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
import { motion } from "framer-motion";
import { getToken } from "@/utils/auth";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Loading } from "@/components/loading";

export default function ProfilePage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: user, isLoading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      redirect("/");
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />;
  }

  const isLoading = profileLoading || userLoading;
  const profileImageSrc = getProfileImage(profile?.gender ?? null);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-4 md:py-8 px-4 md:px-6"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            className="md:col-span-1 space-y-4 md:space-y-6"
          >
            <Card className="relative">
              <CardContent className="flex flex-col items-center md:items-start pt-12">
                {isLoading ? (
                  <Skeleton className="h-[120px] md:h-[140px] w-full absolute top-0 left-0 right-0 z-[0] rounded-t-xl" />
                ) : (
                  <div className="h-[120px] md:h-[140px] w-full bg-white/4 absolute top-0 left-0 right-0 z-[0] rounded-t-xl" />
                )}
                {/* cover image */}
                <div className="relative w-24 h-24 mb-3 flex items-start mt-0.5">
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
                  <div className="w-full flex flex-col items-start justify-between gap-3 mt-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
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
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0, transition: { duration: 0.1 } },
            }}
            className="md:col-span-2"
          >
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">personal</TabsTrigger>
                <TabsTrigger value="account">account</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={tabContentVariants}
                >
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
                </motion.div>
              </TabsContent>

              <TabsContent value="account" className="mt-4">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={tabContentVariants}
                >
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
                          <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-4 text-sm">
                            <motion.div
                              className="space-y-2"
                              custom={0}
                              variants={fieldVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <h3 className="text-sm font-normal">Username</h3>
                              <div className="p-2 pl-3 bg-secondary/50 rounded-md lowercase">
                                {user?.username}
                              </div>
                            </motion.div>
                            <motion.div
                              className="space-y-2"
                              custom={1}
                              variants={fieldVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <h3 className="text-sm font-medium">Email</h3>
                              <div className="p-2 pl-3 bg-secondary/50 rounded-md lowercase">
                                {user?.email}
                              </div>
                            </motion.div>
                            <motion.div
                              className="space-y-2"
                              custom={2}
                              variants={fieldVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <h3 className="text-sm font-medium">Mobile</h3>
                              <div className="p-2 pl-3 bg-secondary/50 rounded-md">
                                +{user?.mobile}
                              </div>
                            </motion.div>
                            <motion.div
                              className="space-y-2"
                              custom={3}
                              variants={fieldVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <h3 className="text-sm font-medium">
                                Account Created
                              </h3>
                              <div className="p-2 pl-3 bg-secondary/50 rounded-md">
                                {user?.created_at
                                  ? new Date(
                                      user.created_at
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
}
