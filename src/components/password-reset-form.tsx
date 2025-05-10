"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "@/lib/axios";
import { setToken } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PasswordResetFormProps {
  className?: string;
  onCancel: () => void;
}

interface ResetOptions {
  username: string;
  options: {
    emails: string[];
    mobiles: string[];
  };
}

export function PasswordResetForm({ className, onCancel }: PasswordResetFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"username" | "option" | "otp">("username");
  const [username, setUsername] = useState("");
  const [resetOptions, setResetOptions] = useState<ResetOptions | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/password/reset/options", { username });
      setResetOptions(response.data);
      setStep("option");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch reset options");
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
      setError(error.response?.data?.message || "Failed to send reset request");
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
      setError(error.response?.data?.message || "Failed to reset password");
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
      className={cn("flex flex-col gap-6", className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-center text-sm text-muted-foreground">
          {step === "username"
            ? "Enter your username to begin"
            : step === "option"
            ? "Choose how to receive your reset code"
            : "Enter the code and your new password"}
        </p>
      </div>

      {step === "username" && (
        <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-username">Username</Label>
            <Input
              id="reset-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="flex gap-2 w-full justify-between">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "checking..." : "continue"}
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
              <div key={email} className="flex items-center space-x-2">
                <RadioGroupItem value="mail" id={email} />
                <Label htmlFor={email}>{email}</Label>
              </div>
            ))}
            {resetOptions.options.mobiles.map((mobile) => (
              <div key={mobile} className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id={mobile} />
                <Label htmlFor={mobile}>{mobile}</Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep("username")}
            >
              back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !selectedOption}
            >
              {isLoading ? "sending..." : "send code"}
            </Button>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="otp">Reset Code</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the reset code"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep("option")}
            >
              back
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "resetting..." : "reset password"}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-destructive border rounded-lg bg-red-400/15 border-red-400/75 p-2 lowercase"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
} 