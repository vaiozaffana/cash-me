"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Chrome,
  Wallet,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "../UserProvider";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: "",
    color: "bg-gray-600",
  });
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  // Watch form values
  const loginValues = loginForm.watch();
  const registerValues = registerForm.watch();

  const emailValue = isLogin ? loginValues.email : registerValues.email;
  const passwordValue = isLogin ? "" : registerValues.password;

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: "", color: "bg-gray-600" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengths = [
      { score: 1, label: "Very Weak", color: "bg-red-500" },
      { score: 2, label: "Weak", color: "bg-orange-500" },
      { score: 3, label: "Fair", color: "bg-yellow-500" },
      { score: 4, label: "Good", color: "bg-blue-500" },
      { score: 5, label: "Strong", color: "bg-green-500" },
    ];

    return (
      strengths[score - 1] || { score: 0, label: "", color: "bg-gray-600" }
    );
  };

  // Real-time email validation
  useEffect(() => {
    if (emailValue) {
      const isValid = z.string().email().safeParse(emailValue).success;
      setIsEmailValid(isValid);
    } else {
      setIsEmailValid(null);
    }
  }, [emailValue]);

  // Password strength monitoring
  useEffect(() => {
    if (!isLogin && passwordValue) {
      setPasswordStrength(calculatePasswordStrength(passwordValue));
    }
  }, [passwordValue, isLogin]);

  const { setUser } = useUser();

  const onSubmit = async (data: LoginForm | RegisterForm) => {
    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/login`,
          {
            email: (data as LoginForm).email,
            password: (data as LoginForm).password,
          }
        );

        console.log("Login success:", response.data);

        // Redirect jika berhasil login
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          setUser(response.data.user);
          window.location.href = "/dashboard";
        }
      } else {
        // Handle Sign Up (Register user)
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/register`,
          {
            name: (data as RegisterForm).name,
            email: data.email,
            password: data.password,
          }
        );

        console.log("Registration success:", response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user);
        window.location.href = "/dashboard";
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("API error:", error.response?.data || error.message);
      alert("Login failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Wallet connection initiated");
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">
          {isLogin ? "Welcome Back" : "Join the Future"}
        </h1>
        <p className="text-slate-50">
          {isLogin
            ? "Sign in to your account to continue"
            : "Create your account and start your Web3 journey"}
        </p>
      </motion.div>

      <Card className="glass-effect border-0 shadow-2xl neon-glow p-6">
        {/* Toggle Buttons */}
        <div className="grid grid-cols-2 gap-1 p-1 mb-6 bg-muted/20 rounded-lg">
          <Button
            type="button"
            variant={isLogin ? "default" : "ghost"}
            className={cn(
              "transition-all duration-300 cursor-pointer",
              isLogin &&
                "bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg cursor-pointer"
            )}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant={!isLogin ? "default" : "ghost"}
            className={cn(
              "transition-all duration-300 cursor-pointer",
              !isLogin &&
                "bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg cursor-pointer"
            )}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </Button>
        </div>

        {isLogin ? (
          <form
            onSubmit={loginForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 pr-10 h-12 glass-effect border-0 focus:ring-2 focus:ring-cyan-500"
                    {...loginForm.register("email")}
                  />
                  {isEmailValid !== null && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-3"
                    >
                      {isEmailValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                {loginForm.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {loginForm.formState.errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-50" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 glass-effect border-0 focus:ring-2 focus:ring-cyan-500"
                    {...loginForm.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {loginForm.formState.errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {loginForm.formState.errors.password.message}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full cursor-pointer"
                  />
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Username field */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-50" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    className="pl-10 h-12 glass-effect border-0 focus:ring-2 focus:ring-cyan-500"
                    {...registerForm.register("name")}
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {registerForm.formState.errors.name.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 pr-10 h-12 glass-effect border-0 focus:ring-2 focus:ring-cyan-500"
                    {...registerForm.register("email")}
                  />
                  {isEmailValid !== null && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-3"
                    >
                      {isEmailValid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                {registerForm.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {registerForm.formState.errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-50" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-12 glass-effect border-0 focus:ring-2 focus:ring-cyan-500"
                    {...registerForm.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password strength meter */}
                {passwordStrength.score > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-50">
                        Password Strength
                      </span>
                      <span
                        className={cn("text-xs font-medium", {
                          "text-red-400": passwordStrength.score <= 2,
                          "text-yellow-400": passwordStrength.score === 3,
                          "text-green-400": passwordStrength.score >= 4,
                        })}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={cn(
                            "h-1 rounded-full transition-colors duration-300",
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : "bg-gray-600"
                          )}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {registerForm.formState.errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {registerForm.formState.errors.password.message}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full cursor-pointer"
                  />
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-neutral-900 px-2 text-white">OR CONTINUE</span>
          </div>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 glass-effect border-0 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Google
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 glass-effect border-0 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              onClick={handleWalletConnect}
              disabled={isLoading}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Wallet
            </Button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-50">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}
