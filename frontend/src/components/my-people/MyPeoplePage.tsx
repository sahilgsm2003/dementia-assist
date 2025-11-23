import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Camera, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PeopleGallery } from "./PeopleGallery";
import { AddPersonForm } from "./AddPersonForm";
import { WhoIsThisFlow } from "./WhoIsThisFlow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export const MyPeoplePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"gallery" | "add" | "search">("gallery");

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">
      <div className="space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15 backdrop-blur"
        >
          <Users className="h-4 w-4 text-[#E02478]" />
          {t("myPeople.title")}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-semibold tracking-tight text-white md:text-4xl"
        >
          {t("myPeople.heading")}
        </motion.h1>
        <p className="mx-auto max-w-2xl text-base text-white/70">
          {t("myPeople.description")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        <TabsList className="bg-white/10">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("myPeople.gallery")}
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("myPeople.addPerson")}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t("myPeople.whoIsThis")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery">
          <PeopleGallery />
        </TabsContent>

        <TabsContent value="add">
          <AddPersonForm onSuccess={() => setActiveTab("gallery")} />
        </TabsContent>

        <TabsContent value="search">
          <WhoIsThisFlow />
        </TabsContent>
      </Tabs>
    </div>
  );
};

