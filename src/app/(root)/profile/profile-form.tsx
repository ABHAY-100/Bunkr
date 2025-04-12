"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/app/api/users/update-profile";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Profile } from "@/app/api/users/myprofile";
import { motion, AnimatePresence } from "framer-motion";

const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  birth_date: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Define the same animation variants used in the profile page
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  // Individual field animation variants with staggered effect
  const fieldVariants = {
    hidden: { opacity: 0 },
    visible: (custom: number) => ({
      opacity: 1,
      transition: { 
        delay: custom * 0.1,
        duration: 0.3
      }
    })
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      gender: profile?.gender || "male",
      birth_date: profile?.birth_date || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfile(profile.id, values),
    onSuccess: () => {
      toast("Profile updated", {
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("Error", {
        description: "Failed to update profile. Please try again.",
      });
      console.error("Error updating profile:", error);
    },
  });

  function onSubmit(data: ProfileFormValues) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <motion.form 
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-5"
      >
        <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-5">
          <motion.div custom={0} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      className="lowercase"
                      {...field}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div custom={1} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your last name"
                      className="lowercase"
                      {...field}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 min-[1300px]:grid-cols-2 gap-5">
          <motion.div custom={2} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">male</SelectItem>
                      <SelectItem value="female">female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div custom={3} variants={fieldVariants}>
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                      disabled={!isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <motion.div 
          className="flex justify-end gap-4"
          custom={4} 
          variants={fieldVariants}
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              <>
                <motion.div
                  key="cancel-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  key="save-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                key="edit-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.form>
    </Form>
  );
}