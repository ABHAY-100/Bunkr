"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { setToken, getToken } from "@/utils/auth";

import { Loading } from "./loading";
import { Footer } from "@/components/footer";
import { PasswordResetForm } from "./password-reset-form";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

import BunkrLogo from "@/assets/bunkr.svg";

interface LoginFormProps extends HTMLMotionProps<"div"> {
  className?: string;
}

interface ErrorResponse {
  message: string;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false); // for login button text change
  const [isLoadingPage, setIsLoadingPage] = useState(true); // for actuall loading page
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordResetForm, setShowPasswordResetForm] = useState(false);
  const [loginMethod, setLoginMethod] = useState<
    "username" | "email" | "phone"
  >("username");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    stay_logged_in: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();

      if (token) {
        router.push("/dashboard");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]); // redirect to dashboard if token exist

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []); // a 1s mandatory loading animation regardless of auth

  const loginMethodProps = {
    username: {
      label: "Username",
      type: "text",
      placeholder: "therealdoe",
    },
    email: {
      label: "Email",
      type: "email",
      placeholder: "johndoe@gmail.com",
    },
    phone: {
      label: "Phone",
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
      // router.push("/dashboard");
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
  }; // handling ezygo auth

  // framer motion variants: start
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
      transition: { duration: 0.3 },
    },
  };

  const footerVariants = {
    hidden: { scale: 0.8, opacity: 0, y: -15 },
    visible: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        // type: "spring",
        duration: 0.3,
        // damping: 12,
        delay: 0.65,
      },
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
  // framer motion variants: end

  if (isLoadingPage) {
    return <Loading />;
  } // rendering loading page

  if (showPasswordResetForm) {
    return (
      <>
        {!isLoadingPage && (
          <PasswordResetForm
            className={className}
            onCancel={() => setShowPasswordResetForm(false)}
          />
        )}
      </>
    );
  } // rendering reset form

  return (
    <>
      {!isLoadingPage && (
        <motion.div
          className={cn("flex flex-col gap-6 mt-10", className)}
          {...props}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <motion.div
                className="flex flex-col items-center gap-2.5"
                variants={logoVariants}
              >
                <div className="flex justify-center items-center flex-col gap-2.5">
                  <Image src={BunkrLogo} alt="Bunkr" className="w-[36px]" />
                  <h1 className="text-5xl font-semibold font-klick tracking-wide">
                    Bunkr
                  </h1>
                </div>
                <p className="text-center text-sm font-medium max-w-[322px] text-white/60">
                  {
                    "Drop your ezygo credentials — we're just the aesthetic upgrade you deserved"
                  }
                </p>
              </motion.div>
              <div className="flex flex-col gap-5 pt-2 mt-1">
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
                        className="h-6 w-6 p-3"
                        onClick={() => setLoginMethod("username")}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          loginMethod === "email" ? "secondary" : "ghost"
                        }
                        className="h-6 w-6 p-3"
                        onClick={() => setLoginMethod("email")}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          loginMethod === "phone" ? "secondary" : "ghost"
                        }
                        className="h-6 w-6 p-3"
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
                      className="custom-input"
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
                <motion.div className="grid gap-2.5" variants={itemVariants}>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordResetForm(true)}
                      className="text-[13px] text-muted-foreground hover:text-primary duration-100 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      // placeholder="••••••••••••"
                      required
                      value={formData.password}
                      className="custom-input"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent mr-1.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6" />
                      ) : (
                        <Eye className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </motion.div>
                <motion.div
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Button
                    type="submit"
                    className="w-full font-semibold min-h-[46px] rounded-[12px] mt-4 font-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </motion.div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-destructive border rounded-lg bg-red-400/15 border-red-400/75 p-2"
                  >
                    {"Ezygo: "}
                    {error}
                  </motion.div>
                )}
              </div>
            </div>
          </form>
          <motion.div
            variants={footerVariants}
            initial="hidden"
            animate="visible"
          >
            <Footer />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
