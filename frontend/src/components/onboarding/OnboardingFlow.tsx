import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Shield,
  Users,
  CheckCircle2,
  Languages,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { emergencyAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface OnboardingData {
  preferredLanguage: "en" | "hi";
  translationProvider: string;
  // Step 1: Basic Info
  personName: string;
  personPhoto: File | null;
  relationship: string;

  // Step 2: Emergency Info
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  medicalConditions: string;
  allergies: string;
  medications: string;
  doctorName: string;
  doctorPhone: string;
  homeAddress: string;

  // Step 3: Important People
  importantPeople: Array<{
    name: string;
    relationship: string;
    photo: File | null;
  }>;
}

const TOTAL_STEPS = 5;

export const OnboardingFlow = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { language: currentLanguage, changeLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    preferredLanguage: currentLanguage === "hi" ? "hi" : "en",
    translationProvider: user?.translation_provider || "libretranslate",
    personName: "",
    personPhoto: null,
    relationship: "",
    emergencyContacts: [{ name: "", phone: "", relationship: "" }],
    medicalConditions: "",
    allergies: "",
    medications: "",
    doctorName: "",
    doctorPhone: "",
    homeAddress: "",
    importantPeople: [],
  });
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleLanguageSelect = async (lang: "en" | "hi") => {
    if (lang === onboardingData.preferredLanguage) return;
    setIsUpdatingLanguage(true);
    try {
      await changeLanguage(lang);
      setOnboardingData((prev) => ({ ...prev, preferredLanguage: lang }));
      toast({
        title: t("onboarding.languageSavedTitle"),
        description: t("onboarding.languageSavedDescription"),
      });
    } catch (error) {
      console.error("Failed to update language during onboarding", error);
      toast({
        title: t("common.error"),
        description: t("onboarding.languageSaveError"),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save emergency info to backend if provided
      if (onboardingData.personName && onboardingData.emergencyContacts.length > 0) {
        // Filter out empty contacts
        const validContacts = onboardingData.emergencyContacts.filter(
          (contact) => contact.name && contact.phone && contact.relationship
        );

        if (validContacts.length > 0) {
          await emergencyAPI.updateEmergencyInfo({
            person_name: onboardingData.personName,
            emergency_contacts: validContacts,
            medical_conditions: onboardingData.medicalConditions || undefined,
            allergies: onboardingData.allergies || undefined,
            medications: onboardingData.medications || undefined,
            doctor_name: onboardingData.doctorName || undefined,
            doctor_phone: onboardingData.doctorPhone || undefined,
            home_address: onboardingData.homeAddress || undefined,
          });
        }
      }

      toast({
        title: t("onboarding.completeTitle"),
        description: t("onboarding.completeDescription"),
      });
      
      navigate("/home");
    } catch (error: any) {
      console.error("Failed to save onboarding data", error);
      toast({
        title: "Warning",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      // Still navigate to home even if save fails
      navigate("/home");
    }
  };

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-xl border-white/10 bg-black/40 shadow-xl">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold text-white">
                {t("onboarding.headerTitle")}
              </CardTitle>
              <span className="text-sm text-white/60">
                {t("onboarding.stepIndicator", {
                  current: currentStep,
                  total: TOTAL_STEPS,
                })}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <StepLanguage
                    data={onboardingData}
                    onLanguageSelect={handleLanguageSelect}
                    isUpdatingLanguage={isUpdatingLanguage}
                  />
                )}
                {currentStep === 2 && (
                  <Step1BasicInfo
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 3 && (
                  <Step2Emergency
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 4 && (
                  <Step3People
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 5 && (
                  <Step4Complete data={onboardingData} />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("onboarding.previous")}
              </Button>
              <Button onClick={handleNext}>
                {currentStep === TOTAL_STEPS
                  ? t("onboarding.completeSetup")
                  : t("onboarding.next")}
                {currentStep < TOTAL_STEPS && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const StepLanguage = ({
  data,
  onLanguageSelect,
  isUpdatingLanguage,
}: {
  data: OnboardingData;
  onLanguageSelect: (lang: "en" | "hi") => Promise<void>;
  isUpdatingLanguage: boolean;
}) => {
  const { t } = useTranslation();
  const languageOptions: Array<{
    id: "en" | "hi";
    label: string;
    description: string;
  }> = [
    {
      id: "en",
      label: t("auth.english"),
      description: t("onboarding.languageEnglishDescription"),
    },
    {
      id: "hi",
      label: t("auth.hindi"),
      description: t("onboarding.languageHindiDescription"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-4">
        <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4">
          <Languages className="h-8 w-8 text-[#E02478]" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          {t("onboarding.languageStepTitle")}
        </h3>
        <p className="text-sm text-white/70">
          {t("onboarding.languageStepDescription")}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-white/80">{t("onboarding.languageChoiceTitle")}</Label>
          <div className="grid gap-3 md:grid-cols-2">
            {languageOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onLanguageSelect(option.id)}
                disabled={isUpdatingLanguage}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  data.preferredLanguage === option.id
                    ? "border-[#E02478] bg-[#E02478]/10 text-white"
                    : "border-white/15 bg-black/30 text-white/80 hover:border-white/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold">{option.label}</p>
                    <p className="text-sm text-white/60">{option.description}</p>
                  </div>
                  {data.preferredLanguage === option.id && (
                    <CheckCircle2 className="h-5 w-5 text-[#E02478]" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {isUpdatingLanguage && (
            <p className="text-xs text-white/60">
              {t("onboarding.languageSaving")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 1: Basic Information
const Step1BasicInfo = ({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-[#E02478]" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          {t("onboarding.basicInfo.title")}
        </h3>
        <p className="text-sm text-white/70">
          {t("onboarding.basicInfo.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="personName" className="text-white/80">
            {t("onboarding.basicInfo.personNameLabel")}
          </Label>
          <Input
            id="personName"
            placeholder={t("onboarding.basicInfo.personNamePlaceholder")}
            value={data.personName}
            onChange={(e) =>
              setData({ ...data, personName: e.target.value })
            }
            className="bg-black/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship" className="text-white/80">
            {t("onboarding.basicInfo.relationshipLabel")}
          </Label>
          <Input
            id="relationship"
            placeholder={t("onboarding.basicInfo.relationshipPlaceholder")}
            value={data.relationship}
            onChange={(e) =>
              setData({ ...data, relationship: e.target.value })
            }
            className="bg-black/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo" className="text-white/80">
            {t("onboarding.basicInfo.photoLabel")}
          </Label>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setData({ ...data, personPhoto: file });
            }}
            className="bg-black/30"
          />
        </div>
      </div>
    </div>
  );
};

// Step 2: Emergency Information
const Step2Emergency = ({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) => {
  const { t } = useTranslation();
  const updateEmergencyContact = (
    index: number,
    field: string,
    value: string
  ) => {
    const contacts = [...data.emergencyContacts];
    contacts[index] = { ...contacts[index], [field]: value };
    setData({ ...data, emergencyContacts: contacts });
  };

  const addEmergencyContact = () => {
    setData({
      ...data,
      emergencyContacts: [
        ...data.emergencyContacts,
        { name: "", phone: "", relationship: "" },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          {t("onboarding.emergency.title")}
        </h3>
        <p className="text-sm text-white/70">
          {t("onboarding.emergency.subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-white/80 mb-3 block">
            {t("onboarding.emergency.contactsTitle")}
          </Label>
          {data.emergencyContacts.map((contact, index) => (
            <div key={index} className="space-y-3 mb-4 p-4 border border-white/10 rounded-lg">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs">
                    {t("onboarding.emergency.contactName")}
                  </Label>
                  <Input
                    placeholder={t("onboarding.emergency.contactNamePlaceholder")}
                    value={contact.name}
                    onChange={(e) =>
                      updateEmergencyContact(index, "name", e.target.value)
                    }
                    className="bg-black/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs">
                    {t("onboarding.emergency.contactPhone")}
                  </Label>
                  <Input
                    placeholder={t("onboarding.emergency.contactPhonePlaceholder")}
                    value={contact.phone}
                    onChange={(e) =>
                      updateEmergencyContact(index, "phone", e.target.value)
                    }
                    className="bg-black/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">
                  {t("onboarding.emergency.contactRelationship")}
                </Label>
                <Input
                  placeholder={t("onboarding.emergency.contactRelationshipPlaceholder")}
                  value={contact.relationship}
                  onChange={(e) =>
                    updateEmergencyContact(
                      index,
                      "relationship",
                      e.target.value
                    )
                  }
                  className="bg-black/30"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmergencyContact}
            className="w-full"
          >
            {t("onboarding.emergency.addContact")}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalConditions" className="text-white/80">
              {t("onboarding.emergency.medicalConditions")}
            </Label>
            <Textarea
              id="medicalConditions"
              placeholder={t("onboarding.emergency.medicalPlaceholder")}
              value={data.medicalConditions}
              onChange={(e) =>
                setData({ ...data, medicalConditions: e.target.value })
              }
              className="bg-black/30"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-white/80">
              {t("onboarding.emergency.allergies")}
            </Label>
            <Input
              id="allergies"
              placeholder={t("onboarding.emergency.allergiesPlaceholder")}
              value={data.allergies}
              onChange={(e) => setData({ ...data, allergies: e.target.value })}
              className="bg-black/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications" className="text-white/80">
              {t("onboarding.emergency.medications")}
            </Label>
            <Textarea
              id="medications"
              placeholder={t("onboarding.emergency.medicationsPlaceholder")}
              value={data.medications}
              onChange={(e) =>
                setData({ ...data, medications: e.target.value })
              }
              className="bg-black/30"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="doctorName" className="text-white/80">
                {t("onboarding.emergency.doctorName")}
              </Label>
              <Input
                id="doctorName"
                placeholder={t("onboarding.emergency.doctorNamePlaceholder")}
                value={data.doctorName}
                onChange={(e) =>
                  setData({ ...data, doctorName: e.target.value })
                }
                className="bg-black/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorPhone" className="text-white/80">
                {t("onboarding.emergency.doctorPhone")}
              </Label>
              <Input
                id="doctorPhone"
                placeholder={t("onboarding.emergency.doctorPhonePlaceholder")}
                value={data.doctorPhone}
                onChange={(e) =>
                  setData({ ...data, doctorPhone: e.target.value })
                }
                className="bg-black/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeAddress" className="text-white/80">
              {t("onboarding.emergency.homeAddress")}
            </Label>
            <Textarea
              id="homeAddress"
              placeholder={t("onboarding.emergency.homeAddressPlaceholder")}
              value={data.homeAddress}
              onChange={(e) =>
                setData({ ...data, homeAddress: e.target.value })
              }
              className="bg-black/30"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Important People
const Step3People = ({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) => {
  const { t } = useTranslation();
  const addPerson = () => {
    setData({
      ...data,
      importantPeople: [
        ...data.importantPeople,
        { name: "", relationship: "", photo: null },
      ],
    });
  };

  const updatePerson = (
    index: number,
    field: string,
    value: string | File | null
  ) => {
    const people = [...data.importantPeople];
    people[index] = { ...people[index], [field]: value };
    setData({ ...data, importantPeople: people });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-[#E02478]" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          {t("onboarding.people.title")}
        </h3>
        <p className="text-sm text-white/70">
          {t("onboarding.people.subtitle")}
        </p>
      </div>

      <div className="space-y-4">
        {data.importantPeople.map((person, index) => (
          <div
            key={index}
            className="p-4 border border-white/10 rounded-lg space-y-3"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">
                  {t("onboarding.people.personName")}
                </Label>
                <Input
                  placeholder={t("onboarding.people.personNamePlaceholder")}
                  value={person.name}
                  onChange={(e) =>
                    updatePerson(index, "name", e.target.value)
                  }
                  className="bg-black/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">
                  {t("onboarding.people.relationship")}
                </Label>
                <Input
                  placeholder={t("onboarding.people.relationshipPlaceholder")}
                  value={person.relationship}
                  onChange={(e) =>
                    updatePerson(index, "relationship", e.target.value)
                  }
                  className="bg-black/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-xs">
                {t("onboarding.people.photoLabel")}
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  updatePerson(index, "photo", file);
                }}
                className="bg-black/30"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addPerson}
          className="w-full"
        >
          {t("onboarding.people.addPerson")}
        </Button>

        {data.importantPeople.length === 0 && (
          <p className="text-sm text-white/60 text-center py-4">
            {t("onboarding.people.emptyState")}
          </p>
        )}
      </div>
    </div>
  );
};

// Step 4: Complete
const Step4Complete = ({ data }: { data: OnboardingData }) => {
  const { t } = useTranslation();
  const name = data.personName || t("onboarding.completeDefaultName");
  return (
    <div className="space-y-6 text-center">
      <div className="text-center space-y-2 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="h-8 w-8 text-[#E02478]" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white">
          {t("onboarding.finalStepTitle")}
        </h3>
        <p className="text-sm text-white/70">
          {t("onboarding.finalStepSubtitle", { name })}
        </p>
      </div>
    </div>
  );
};
