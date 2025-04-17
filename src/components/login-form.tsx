"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { setToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

interface LoginFormProps extends HTMLMotionProps<"div"> {
  className?: string;
}

interface ErrorResponse {
  message: string;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<
    "username" | "email" | "phone"
  >("username");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMethodProps = {
    username: {
      label: "username",
      type: "text",
      placeholder: "therealdoe",
    },
    email: {
      label: "email",
      type: "email",
      placeholder: "johndoe@gmail.com",
    },
    phone: {
      label: "phone",
      type: "tel",
      placeholder: "919234567890",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/login", formData);
      setToken(response.data.access_token);
      router.push("/dashboard");
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred");
      }
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration: 0.6,
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.4,
      },
    },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.97,
      transition: { duration: 0.1 },
    },
  };

  const placeholderVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.div
        className={cn("flex flex-col gap-6", className)}
        {...props}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <motion.div
              className="flex flex-col items-center gap-2"
              variants={logoVariants}
            >
              <h1 className="text-3xl font-semibold">
                welcome to <span className="gradient-logo">bunkr</span>
              </h1>
              <div className="text-center text-sm italic text-muted-foreground">
                use your ezygo credentials!
              </div>
            </motion.div>
            <div className="flex flex-col gap-6 pt-2">
              <motion.div className="grid gap-2" variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="login">
                    {loginMethodProps[loginMethod].label}
                  </Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant={
                        loginMethod === "username" ? "secondary" : "ghost"
                      }
                      className="h-6 w-6"
                      onClick={() => setLoginMethod("username")}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={loginMethod === "email" ? "secondary" : "ghost"}
                      className="h-6 w-6"
                      onClick={() => setLoginMethod("email")}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={loginMethod === "phone" ? "secondary" : "ghost"}
                      className="h-6 w-6"
                      onClick={() => setLoginMethod("phone")}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="login"
                    type={loginMethodProps[loginMethod].type}
                    value={formData.username}
                    className="max-md:text-sm"
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder={loginMethodProps[loginMethod].placeholder}
                    required
                  />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loginMethod}
                      className="pointer-events-none absolute left-3 top-2/4 -translate-y-2/4 text-sm text-muted-foreground"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={placeholderVariants}
                      style={{ opacity: formData.username ? 0 : 0.5 }}
                    >
                      {/* {loginMethodProps[loginMethod].placeholder} */}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
              <motion.div className="grid gap-2" variants={itemVariants}>
                <Label htmlFor="password">password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    className="max-md:text-sm"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                initial="hidden"
                animate="visible"
              >
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "logging in..." : "login"}
                </Button>
              </motion.div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm text-destructive border rounded-lg bg-red-400/15 border-red-400 p-2 lowercase"
                >
                  ezygo says... <br />
                  {error}
                </motion.div>
              )}
            </div>
          </div>
        </form>
        <motion.div
          className="italic text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {
            "\"ezygo handles the login — we don't see your info, and honestly, we don't want to\" ~ admin"
          }
        </motion.div>
      </motion.div>
    </>
  );
}
