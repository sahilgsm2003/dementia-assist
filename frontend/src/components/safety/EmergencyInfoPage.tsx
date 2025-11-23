import { useState, useEffect } from "react";
import { Shield, Phone, MapPin, Heart, AlertCircle, Printer, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ExportDialog } from "@/components/shared/ExportDialog";
import { emergencyAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/errorUtils";
import { useTranslation } from "react-i18next";

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
  doctorName: string;
  doctorPhone: string;
  homeAddress: string;
}

export const EmergencyInfoPage = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>({
    name: "",
    emergencyContacts: [{ name: "", phone: "", relationship: "" }],
    medicalConditions: "",
    allergies: "",
    medications: "",
    doctorName: "",
    doctorPhone: "",
    homeAddress: "",
  });

  useEffect(() => {
    loadEmergencyInfo();
  }, []);

  const loadEmergencyInfo = async () => {
    try {
      setIsLoading(true);
      const data = await emergencyAPI.getEmergencyInfo();
      if (data) {
        setEmergencyInfo({
          name: data.person_name,
          emergencyContacts: data.emergency_contacts || [],
          medicalConditions: data.medical_conditions || "",
          allergies: data.allergies || "",
          medications: data.medications || "",
          doctorName: data.doctor_name || "",
          doctorPhone: data.doctor_phone || "",
          homeAddress: data.home_address || "",
        });
      }
    } catch (error: any) {
      // 404 is OK - no emergency info set yet
      if (error?.response?.status !== 404) {
        console.error("Failed to load emergency info", error);
        toast({
          title: t("common.error"),
          description: t("emergency.loadError"),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (emergencyInfo.name && emergencyInfo.emergencyContacts.length > 0) {
        await emergencyAPI.updateEmergencyInfo({
          person_name: emergencyInfo.name,
          emergency_contacts: emergencyInfo.emergencyContacts,
          medical_conditions: emergencyInfo.medicalConditions,
          allergies: emergencyInfo.allergies,
          medications: emergencyInfo.medications,
          doctor_name: emergencyInfo.doctorName,
          doctor_phone: emergencyInfo.doctorPhone,
          home_address: emergencyInfo.homeAddress,
        });
        setIsEditing(false);
        toast({
          title: t("common.success"),
          description: t("emergency.saveSuccess"),
        });
        loadEmergencyInfo(); // Reload from API
      } else {
        toast({
          title: t("common.error"),
          description: t("emergency.validationError"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to save emergency info", error);
      toast({
        title: t("common.error"),
        description: getErrorMessage(error) || t("emergency.saveError"),
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const addEmergencyContact = () => {
    setEmergencyInfo({
      ...emergencyInfo,
      emergencyContacts: [
        ...emergencyInfo.emergencyContacts,
        { name: "", phone: "", relationship: "" },
      ],
    });
  };

  const updateEmergencyContact = (
    index: number,
    field: string,
    value: string
  ) => {
    const contacts = [...emergencyInfo.emergencyContacts];
    contacts[index] = { ...contacts[index], [field]: value };
    setEmergencyInfo({ ...emergencyInfo, emergencyContacts: contacts });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/70">{t("emergency.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 ring-1 ring-red-500/30 backdrop-blur"
          >
            <Shield className="h-4 w-4" />
            {t("emergency.safetyFirst")}
          </motion.div>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {t("emergency.emergencyInformation")}
          </h1>
          <p className="text-base text-white/70">
            {t("emergency.description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDialog
            type="emergency-card"
            data={{
              person_name: emergencyInfo.name,
              emergency_contacts: emergencyInfo.emergencyContacts,
              medical_conditions: emergencyInfo.medicalConditions,
              allergies: emergencyInfo.allergies,
              medications: emergencyInfo.medications,
              doctor_name: emergencyInfo.doctorName,
              doctor_phone: emergencyInfo.doctorPhone,
              home_address: emergencyInfo.homeAddress,
            }}
          />
          <Button
            variant="outline"
            onClick={handlePrint}
            className="hidden print:hidden"
          >
            <Printer className="mr-2 h-4 w-4" />
            {t("emergency.print")}
          </Button>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                {t("emergency.edit")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("emergency.editEmergencyInformation")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("emergency.name")}</Label>
                  <Input
                    id="name"
                    value={emergencyInfo.name}
                    onChange={(e) =>
                      setEmergencyInfo({ ...emergencyInfo, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>{t("emergency.emergencyContacts")}</Label>
                  {emergencyInfo.emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-4 border border-white/10 rounded-lg space-y-3"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs">{t("emergency.name")}</Label>
                          <Input
                            value={contact.name}
                            onChange={(e) =>
                              updateEmergencyContact(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">{t("emergency.phone")}</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) =>
                              updateEmergencyContact(index, "phone", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t("emergency.relationship")}</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) =>
                            updateEmergencyContact(
                              index,
                              "relationship",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmergencyContact}
                  >
                    {t("emergency.addContact")}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">{t("emergency.medicalConditions")}</Label>
                  <Textarea
                    id="medicalConditions"
                    value={emergencyInfo.medicalConditions}
                    onChange={(e) =>
                      setEmergencyInfo({
                        ...emergencyInfo,
                        medicalConditions: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">{t("emergency.allergies")}</Label>
                  <Input
                    id="allergies"
                    value={emergencyInfo.allergies}
                    onChange={(e) =>
                      setEmergencyInfo({ ...emergencyInfo, allergies: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">{t("emergency.currentMedications")}</Label>
                  <Textarea
                    id="medications"
                    value={emergencyInfo.medications}
                    onChange={(e) =>
                      setEmergencyInfo({
                        ...emergencyInfo,
                        medications: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">{t("emergency.doctorsName")}</Label>
                    <Input
                      id="doctorName"
                      value={emergencyInfo.doctorName}
                      onChange={(e) =>
                        setEmergencyInfo({
                          ...emergencyInfo,
                          doctorName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorPhone">{t("emergency.doctorsPhone")}</Label>
                    <Input
                      id="doctorPhone"
                      value={emergencyInfo.doctorPhone}
                      onChange={(e) =>
                        setEmergencyInfo({
                          ...emergencyInfo,
                          doctorPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeAddress">{t("emergency.homeAddress")}</Label>
                  <Textarea
                    id="homeAddress"
                    value={emergencyInfo.homeAddress}
                    onChange={(e) =>
                      setEmergencyInfo({
                        ...emergencyInfo,
                        homeAddress: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t("emergency.cancel")}
                  </Button>
                  <Button onClick={handleSave}>{t("emergency.saveChanges")}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Emergency Information Display */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm mb-6">
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
                {t("emergency.myName")}
              </p>
              <p className="text-2xl font-bold text-white">{emergencyInfo.name || t("emergency.notSet")}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-3">
                {t("emergency.emergencyContacts")}
              </p>
              {emergencyInfo.emergencyContacts.length === 0 || 
               emergencyInfo.emergencyContacts.every(c => !c.name && !c.phone) ? (
                <div className="p-4 rounded-lg bg-black/30 border border-white/10 text-center">
                  <p className="text-sm text-white/60">{t("emergency.noContactsAdded")}</p>
                  <p className="text-xs text-white/40 mt-1">{t("emergency.clickEditToAdd")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emergencyInfo.emergencyContacts
                    .filter(contact => contact.name || contact.phone)
                    .map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-white/10"
                    >
                      <div>
                        <p className="text-base font-semibold text-white">
                          {contact.name || t("emergency.notSet")}
                        </p>
                        <p className="text-sm text-white/60">{contact.relationship || ""}</p>
                      </div>
                      {contact.phone && (
                        <a
                          href={`tel:${contact.phone}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors font-medium"
                        >
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-3">
                {t("emergency.medicalInformation")}
              </p>
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-lg bg-black/30">
                  <span className="text-white/60">{t("emergency.conditions")}: </span>
                  <span className="text-white">
                    {emergencyInfo.medicalConditions || t("emergency.noneListed")}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <span className="text-white/60">{t("emergency.allergies")}: </span>
                  <span className="text-red-200 font-medium">
                    {emergencyInfo.allergies || t("emergency.noneListed")}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-black/30">
                  <span className="text-white/60">{t("emergency.medications")}: </span>
                  <span className="text-white">
                    {emergencyInfo.medications || t("emergency.noneListed")}
                  </span>
                </div>
              </div>
            </div>

            {emergencyInfo.doctorName && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
                  {t("emergency.primaryDoctor")}
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/30">
                  <p className="text-sm font-medium text-white">
                    {emergencyInfo.doctorName}
                  </p>
                  {emergencyInfo.doctorPhone && (
                    <a
                      href={`tel:${emergencyInfo.doctorPhone}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      {emergencyInfo.doctorPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60 mb-2">
                {t("emergency.homeAddress")}
              </p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-black/30">
                <MapPin className="h-4 w-4 text-white/60 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/80">
                  {emergencyInfo.homeAddress || t("emergency.notSet")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-yellow-500/50 bg-yellow-500/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              {t("emergency.importantNotes")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-yellow-100/90">
            <p>
              • {t("emergency.note1")}
            </p>
            <p>
              • {t("emergency.note2")}
            </p>
            <p>
              • {t("emergency.note3")}
            </p>
            <p>
              • {t("emergency.note4")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

