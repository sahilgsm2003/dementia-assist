import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, User, Lock, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

interface AuthPageProps {
  type: "login" | "register";
}

export const AuthPage = ({ type }: AuthPageProps) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { changeLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    language: "en",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(type === "login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = t("auth.usernameRequired");
    if (!formData.password) newErrors.password = t("auth.passwordRequired");

    if (!showLogin) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("auth.passwordsDontMatch");
      }
      if (formData.password.length < 6) {
        newErrors.password = t("auth.passwordMinLength");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      if (showLogin) {
        await login(formData.username, formData.password);
        navigate("/home");
      } else {
        // Set language before registration
        await changeLanguage(formData.language as "en" | "hi");
        await register(formData.username, formData.password, formData.language);
        // Redirect to onboarding after registration
        navigate("/onboarding");
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || error?.message || "An error occurred";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-xl border-white/10 bg-black/40 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Heart className="h-8 w-8 text-[#E02478]" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl md:text-3xl">
                {showLogin ? t("auth.welcomeBack") : t("auth.joinMoments")}
              </CardTitle>
              <CardDescription className="text-white/70 mt-2 leading-relaxed">
                {showLogin
                  ? t("auth.signInDescription")
                  : t("auth.signUpDescription")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Show error message if login/register fails */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-sm text-red-200">{errors.submit}</p>
                </motion.div>
              )}

              {!showLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="language">{t("auth.selectLanguage")}</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 z-10" />
                    <Select
                      value={formData.language}
                      onValueChange={(value) => {
                        handleInputChange("language", value);
                        changeLanguage(value as "en" | "hi");
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t("auth.english")}</SelectItem>
                        <SelectItem value="hi">{t("auth.hindi")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="username"
                    type="text"
                    placeholder={t("auth.username")}
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-400"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("auth.password")}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-400"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {!showLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t("auth.confirmPassword")}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-400"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading
                  ? t("auth.loading")
                  : showLogin
                  ? t("auth.signIn")
                  : t("auth.createAccount")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                {showLogin
                  ? t("auth.dontHaveAccount")
                  : t("auth.alreadyHaveAccount")}{" "}
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="text-[#E02478] hover:underline font-medium transition-colors"
                  disabled={isLoading}
                >
                  {showLogin ? t("auth.signUp") : t("auth.signIn")}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
