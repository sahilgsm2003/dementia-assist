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
  Heart,
  ArrowRight,
  ArrowLeft,
  User,
  Shield,
  Users,
  Calendar,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { emergencyAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";

interface OnboardingData {
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

  // Step 4: Daily Routines
  routines: {
    morning: Array<{ time: string; activity: string }>;
    afternoon: Array<{ time: string; activity: string }>;
    evening: Array<{ time: string; activity: string }>;
  };

  // Step 5: Important Places
  places: Array<{
    name: string;
    address: string;
    description: string;
  }>;
}

const TOTAL_STEPS = 6;

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
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
    routines: {
      morning: [],
      afternoon: [],
      evening: [],
    },
    places: [],
  });

  const progress = (currentStep / TOTAL_STEPS) * 100;

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
        title: "Success",
        description: "Onboarding complete! Welcome to Moments.",
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
                Let's set up Moments
              </CardTitle>
              <span className="text-sm text-white/60">
                Step {currentStep} of {TOTAL_STEPS}
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
                  <Step1BasicInfo
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Emergency
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 3 && (
                  <Step3People
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Routines
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 5 && (
                  <Step5Places
                    data={onboardingData}
                    setData={setOnboardingData}
                  />
                )}
                {currentStep === 6 && (
                  <Step6Complete data={onboardingData} />
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
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentStep === TOTAL_STEPS ? "Complete Setup" : "Next"}
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

// Step 1: Basic Information
const Step1BasicInfo = ({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-[#E02478]" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          Basic Information
        </h3>
        <p className="text-sm text-white/70">
          Let's start with the basics. Who are you setting this up for?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="personName" className="text-white/80">
            Name of person you're caring for
          </Label>
          <Input
            id="personName"
            placeholder="Enter their name"
            value={data.personName}
            onChange={(e) =>
              setData({ ...data, personName: e.target.value })
            }
            className="bg-black/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship" className="text-white/80">
            Your relationship
          </Label>
          <Input
            id="relationship"
            placeholder="e.g., Son, Daughter, Spouse, Caregiver"
            value={data.relationship}
            onChange={(e) =>
              setData({ ...data, relationship: e.target.value })
            }
            className="bg-black/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo" className="text-white/80">
            Their photo (optional)
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
          Emergency Information
        </h3>
        <p className="text-sm text-white/70">
          This is the most important step. Add emergency contacts and medical
          information.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-white/80 mb-3 block">
            Emergency Contacts
          </Label>
          {data.emergencyContacts.map((contact, index) => (
            <div key={index} className="space-y-3 mb-4 p-4 border border-white/10 rounded-lg">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs">Name</Label>
                  <Input
                    placeholder="Contact name"
                    value={contact.name}
                    onChange={(e) =>
                      updateEmergencyContact(index, "name", e.target.value)
                    }
                    className="bg-black/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70 text-xs">Phone</Label>
                  <Input
                    placeholder="Phone number"
                    value={contact.phone}
                    onChange={(e) =>
                      updateEmergencyContact(index, "phone", e.target.value)
                    }
                    className="bg-black/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Relationship</Label>
                <Input
                  placeholder="e.g., Son, Doctor, Neighbor"
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
            Add another contact
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalConditions" className="text-white/80">
              Medical Conditions
            </Label>
            <Textarea
              id="medicalConditions"
              placeholder="e.g., Diabetes, High Blood Pressure"
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
              Allergies
            </Label>
            <Input
              id="allergies"
              placeholder="e.g., Penicillin, Peanuts"
              value={data.allergies}
              onChange={(e) => setData({ ...data, allergies: e.target.value })}
              className="bg-black/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications" className="text-white/80">
              Current Medications
            </Label>
            <Textarea
              id="medications"
              placeholder="List current medications"
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
                Doctor's Name
              </Label>
              <Input
                id="doctorName"
                placeholder="Primary doctor"
                value={data.doctorName}
                onChange={(e) =>
                  setData({ ...data, doctorName: e.target.value })
                }
                className="bg-black/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorPhone" className="text-white/80">
                Doctor's Phone
              </Label>
              <Input
                id="doctorPhone"
                placeholder="Phone number"
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
              Home Address
            </Label>
            <Textarea
              id="homeAddress"
              placeholder="Full address"
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
          Important People
        </h3>
        <p className="text-sm text-white/70">
          Who are the most important people in their life? Add family members
          and close friends.
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
                <Label className="text-white/70 text-xs">Name</Label>
                <Input
                  placeholder="Person's name"
                  value={person.name}
                  onChange={(e) =>
                    updatePerson(index, "name", e.target.value)
                  }
                  className="bg-black/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Relationship</Label>
                <Input
                  placeholder="e.g., Daughter, Son, Friend"
                  value={person.relationship}
                  onChange={(e) =>
                    updatePerson(index, "relationship", e.target.value)
                  }
                  className="bg-black/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-xs">Photo (optional)</Label>
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
          Add person
        </Button>

        {data.importantPeople.length === 0 && (
          <p className="text-sm text-white/60 text-center py-4">
            You can add people later. Click "Add person" to start.
          </p>
        )}
      </div>
    </div>
  );
};

// Step 4: Daily Routines
const Step4Routines = ({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-[#E02478]" />
        </div>
        <h3 className="text-xl font-semibold text-white">Daily Routines</h3>
        <p className="text-sm text-white/70">
          Structure helps with memory. Add daily routines (you can add more
          later).
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-white/10 rounded-lg">
          <p className="text-sm text-white/70 mb-4">
            Routines can be added later from the "My Day" section. For now,
            you're all set!
          </p>
          <p className="text-xs text-white/50">
            You'll be able to create morning, afternoon, and evening routines
            with specific times and activities.
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 5: Important Places
const Step5Places = ({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-[#E02478]" />
        </div>
        <h3 className="text-xl font-semibold text-white">Important Places</h3>
        <p className="text-sm text-white/70">
          Add frequently visited places for safety and orientation.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-white/10 rounded-lg">
          <p className="text-sm text-white/70 mb-4">
            Places can be added later from the "My Places" section. For now,
            you're all set!
          </p>
          <p className="text-xs text-white/50">
            You'll be able to add home address, doctor's office, pharmacy, and
            other important locations.
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 6: Complete
const Step6Complete = ({ data }: { data: OnboardingData }) => {
  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto w-20 h-20 bg-[#E02478]/20 rounded-full flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="h-10 w-10 text-[#E02478]" />
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white">
          You're all set!
        </h3>
        <p className="text-sm text-white/70 max-w-md mx-auto">
          Moments is ready to help {data.personName || "your loved one"}{" "}
          remember what matters most. You can always add more information later.
        </p>
      </div>

      <div className="pt-6 space-y-3">
        <p className="text-sm font-medium text-white/80">
          Here's what you can do next:
        </p>
        <ul className="text-sm text-white/70 space-y-2 text-left max-w-sm mx-auto">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#E02478] flex-shrink-0" />
            <span>Add more people and memories</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#E02478] flex-shrink-0" />
            <span>Set up daily routines and reminders</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#E02478] flex-shrink-0" />
            <span>Start asking questions with the assistant</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

