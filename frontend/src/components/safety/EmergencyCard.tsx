import { Shield, Phone, MapPin, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { emergencyAPI } from "@/services/api";
import { useTranslation } from "react-i18next";

interface EmergencyCardProps {
  className?: string;
  compact?: boolean;
}

interface EmergencyInfo {
  name: string;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  medicalConditions: string;
  allergies: string;
  medications: string;
  homeAddress: string;
}

export const EmergencyCard = ({ className, compact = false }: EmergencyCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>({
    name: "",
    emergencyContacts: [],
    medicalConditions: "",
    allergies: "",
    medications: "",
    homeAddress: "",
  });

  useEffect(() => {
    const loadEmergencyInfo = async () => {
      try {
        const data = await emergencyAPI.getEmergencyInfo();
        if (data) {
          setEmergencyInfo({
            name: data.person_name,
            emergencyContacts: data.emergency_contacts || [],
            medicalConditions: data.medical_conditions || "",
            allergies: data.allergies || "",
            medications: data.medications || "",
            homeAddress: data.home_address || "",
          });
        }
      } catch (error: any) {
        // 404 is OK - no emergency info set yet
        if (error?.response?.status !== 404) {
          console.error("Failed to load emergency info", error);
        }
      }
    };
    loadEmergencyInfo();
  }, []);

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={`border-red-500/50 bg-red-500/10 backdrop-blur-sm cursor-pointer ${className}`}
          onClick={() => navigate("/safety")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {t("emergency.emergencyInfo")}
                </h3>
                <p className="text-xs text-white/70">
                  {emergencyInfo.name
                    ? t("emergency.tapToView", { name: emergencyInfo.name })
                    : t("emergency.tapToSetup")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className={`border-red-500/50 bg-red-500/10 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t("emergency.emergencyInformation")}</h3>
            <p className="text-sm text-white/70">{t("emergency.criticalInfo")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
              {t("emergency.myName")}
            </p>
            <p className="text-lg font-semibold text-white">{emergencyInfo.name}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
              {t("emergency.emergencyContacts")}
            </p>
            <div className="space-y-2">
              {emergencyInfo.emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/30"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-white/60">{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
              {t("emergency.medicalInformation")}
            </p>
            <div className="space-y-2 text-sm text-white/80">
              <div>
                <span className="text-white/60">{t("emergency.conditions")}: </span>
                <span>{emergencyInfo.medicalConditions || t("emergency.noneListed")}</span>
              </div>
              <div>
                <span className="text-white/60">{t("emergency.allergies")}: </span>
                <span className="text-red-300">{emergencyInfo.allergies || t("emergency.noneListed")}</span>
              </div>
              <div>
                <span className="text-white/60">{t("emergency.medications")}: </span>
                <span>{emergencyInfo.medications || t("emergency.noneListed")}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
              {t("emergency.homeAddress")}
            </p>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/80">{emergencyInfo.homeAddress}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate("/safety")}
          className="w-full bg-red-500/20 text-red-200 border border-red-500/50 hover:bg-red-500/30"
        >
          {t("emergency.viewFullCard")}
        </Button>
      </CardContent>
    </Card>
  );
};

