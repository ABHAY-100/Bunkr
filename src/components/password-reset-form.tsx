"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Eye, EyeOff, Mail, Phone, User } from "lucide-react";

import axios from "@/lib/axios";
import { setToken } from "@/utils/auth";

import { motion } from "framer-motion";

interface PasswordResetFormProps {
  className?: string;
  onCancel: () => void;
}

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

interface ResetOptions {
  username: string;
  options: {
    emails: string[];
    mobiles: string[];
  };
}

export function PasswordResetForm({
  className,
  onCancel,
}: PasswordResetFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"username" | "option" | "otp">("username");
  const [username, setUsername] = useState("");
  const [resetOptions, setResetOptions] = useState<ResetOptions | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [loginMethod, setLoginMethod] = useState<
    "username" | "email" | "phone"
  >("username");

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/password/reset/options", {
        username,
      });
      setResetOptions(response.data);
      setStep("option");
    } catch (error: any) {
      setError(
        `Ezygo: ${error.response?.data?.message}` ||
          "Ezygo: Failed to fetch reset options."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await axios.post("/password/reset/request", {
        username,
        option: selectedOption,
      });
      setStep("otp");
    } catch (error: any) {
      setError(
        `Ezygo: ${error.response?.data?.message}` ||
          "Ezygo: Failed to fetch reset options."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/password/reset", {
        otp,
        username,
        password,
        password_confirmation: passwordConfirmation,
      });

      setToken(response.data.access_token);
      router.push("/dashboard");
    } catch (error: any) {
      setError(
        `Ezygo: ${error.response?.data?.message}` ||
          "Ezygo: Failed to fetch reset options."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex flex-col gap-8", className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-center text-sm text-muted-foreground font-medium">
          {step === "username"
            ? `Enter your ${loginMethodProps[
                loginMethod
              ].label.toLowerCase()} to begin`
            : step === "option"
            ? "Choose how to receive your reset code"
            : "Enter the code and your new password"}
        </p>
      </div>

      {step === "username" && (
        <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login">
                {loginMethodProps[loginMethod].label}
              </Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant={loginMethod === "username" ? "secondary" : "ghost"}
                  className="h-6 w-6 p-3"
                  onClick={() => setLoginMethod("username")}
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={loginMethod === "email" ? "secondary" : "ghost"}
                  className="h-6 w-6 p-3"
                  onClick={() => setLoginMethod("email")}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant={loginMethod === "phone" ? "secondary" : "ghost"}
                  className="h-6 w-6 p-3"
                  onClick={() => setLoginMethod("phone")}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Input
              id="reset-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full custom-input"
              placeholder={loginMethodProps[loginMethod].placeholder}
              required
            />
          </div>
          <div className="flex gap-2 w-full justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-semibold min-h-[46px] mt-4 rounded-[12px] font-sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold min-h-[46px] mt-4 rounded-[12px] font-sm"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Continue"}
            </Button>
          </div>
        </form>
      )}

      {step === "option" && resetOptions && (
        <form onSubmit={handleOptionSubmit} className="flex flex-col gap-4">
          <RadioGroup
            value={selectedOption}
            onValueChange={setSelectedOption}
            className="flex justify-center flex-col gap-3"
          >
            {resetOptions.options.emails.map((email) => (
              <div
                key={email}
                className="flex items-center space-x-2 custom-input justify-between px-4 pr-2"
              >
                <Label htmlFor={email}>{email}</Label>
                <RadioGroupItem value="mail" id={email} />
              </div>
            ))}
            {resetOptions.options.mobiles.map((mobile) => (
              <div
                key={mobile}
                className="flex items-center space-x-2 custom-input justify-between pl-4 pr-2"
              >
                <Label htmlFor={mobile}>+{mobile}</Label>
                <RadioGroupItem value="sms" id={mobile} />
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-semibold min-h-[46px] mt-4 rounded-[12px] font-sm"
              onClick={() => setStep("username")}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold min-h-[46px] mt-4 rounded-[12px] font-sm"
              disabled={isLoading || !selectedOption}
            >
              {isLoading ? "Sending..." : "Send code"}
            </Button>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
          <div className="grid gap-3">
            <Label htmlFor="otp">Reset Code</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the reset code"
              className="custom-input"
              required
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                className="custom-input"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent mr-1.5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showNewPassword ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm your new password"
                className="custom-input"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent mr-1.5"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-semibold min-h-[46px] mt-4 rounded-[12px] font-sm"
              onClick={() => setStep("option")}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold min-h-[46px] mt-4 rounded-[12px] font-sm"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-destructive border rounded-lg bg-red-400/15 border-red-400/75 p-2"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}
