import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  User,
  PlayCircle,
  Trash2,
  Upload,
  Camera,
  Brain,
  MessageCircle,
} from "lucide-react";
import { familyAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface FamilyMember {
  id: number;
  name: string;
  relationship_name?: string;
  created_at: string;
  images: Array<{
    id: number;
    file_path: string;
    created_at: string;
  }>;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [uploadingPhotoFor, setUploadingPhotoFor] = useState<number | null>(
    null
  );
  const [newMember, setNewMember] = useState({
    name: "",
    relationship_name: "",
  });

  // Fetch family members on component mount
  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        setIsLoading(true);
        const members = await familyAPI.getMembers();
        setFamilyMembers(members);
        setError(null);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(
          error?.response?.data?.detail || "Failed to fetch family members"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyMembers();
  }, []);

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return;

    try {
      setIsAddingMember(true);
      const memberData = {
        name: newMember.name.trim(),
        relationship_name: newMember.relationship_name.trim() || null,
      };
      const newMemberData = await familyAPI.createMember(memberData);
      setFamilyMembers((prev) => [...prev, newMemberData]);
      setNewMember({ name: "", relationship_name: "" });
      setShowAddForm(false);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || "Failed to add family member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      // Call backend API to delete the member
      await familyAPI.deleteMember(id);

      // Remove from local state only if backend deletion succeeds
      setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error?.response?.data?.detail || "Failed to delete family member"
      );
    }
  };

  const handlePhotoUpload = async (memberId: number, file: File) => {
    try {
      setUploadingPhotoFor(memberId);
      setError(null);

      const result = await familyAPI.uploadPhoto(memberId, file);

      // Update the family member with the new photo
      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === memberId
            ? {
                ...member,
                images: [
                  ...member.images,
                  {
                    id: result.id,
                    file_path: result.file_path,
                    created_at: result.created_at || new Date().toISOString(),
                  },
                ],
              }
            : member
        )
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error?.response?.data?.detail || "Failed to upload photo");
    } finally {
      setUploadingPhotoFor(null);
    }
  };

  const handleFileSelect = (
    memberId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB");
        return;
      }

      handlePhotoUpload(memberId, file);
    }

    // Reset input value so the same file can be selected again
    event.target.value = "";
  };

  const handleStartQuiz = () => {
    if (familyMembers.length > 0) {
      navigate("/quiz");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Family Dashboard
          </h1>
          <p className="text-xl text-white/70">
            Manage family members and create meaningful recognition experiences
          </p>
        </motion.div>

        {/* Feature Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl mb-4">
                Choose Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Family Recognition Feature */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={handleStartQuiz}
                >
                  <Card className="p-6 h-full hover:shadow-[#E02478]/30 transition-all duration-300 border-2 hover:border-[#E02478]/50">
                    <CardContent className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center group-hover:bg-[#E02478]/30 transition-colors">
                        <Brain className="h-8 w-8 text-[#E02478]" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        Family Recognition Quiz
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Practice identifying family members through interactive
                        photo exercises
                      </p>
                      <Button
                        size="lg"
                        className="w-full"
                        disabled={familyMembers.length === 0}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Start Quiz
                      </Button>
                      {familyMembers.length === 0 && (
                        <p className="text-yellow-400 text-xs">
                          Add family members first to start the quiz
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* RAG Chatbot Feature */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group cursor-pointer"
                  onClick={() => navigate("/chatbot")}
                >
                  <Card className="p-6 h-full hover:shadow-[#E02478]/30 transition-all duration-300 border-2 hover:border-[#E02478]/50">
                    <CardContent className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-[#E02478]/20 rounded-full flex items-center justify-center group-hover:bg-[#E02478]/30 transition-colors">
                        <MessageCircle className="h-8 w-8 text-[#E02478]" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        Personal Life Assistant
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Get AI-powered answers to your personal questions and
                        important dates
                      </p>
                      <Button size="lg" className="w-full">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Open Assistant
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#E02478] mx-auto"></div>
            <p className="mt-4 text-lg">Loading your family members...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="h-6 w-6 text-[#E02478]" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      disabled={familyMembers.length === 0}
                      className="flex-1"
                    >
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Start Recognition Quiz
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex-1"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Add Family Member
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Add Member Form */}
            {showAddForm && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Family Member</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="memberName">Full Name</Label>
                        <Input
                          id="memberName"
                          placeholder="Enter full name"
                          value={newMember.name}
                          onChange={(e) =>
                            setNewMember((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memberRelationship">
                          Relationship (Optional)
                        </Label>
                        <Input
                          id="memberRelationship"
                          placeholder="e.g., Son, Daughter, Spouse"
                          value={newMember.relationship_name}
                          onChange={(e) =>
                            setNewMember((prev) => ({
                              ...prev,
                              relationship_name: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMember}
                        disabled={isAddingMember}
                      >
                        {isAddingMember ? "Adding..." : "Add Member"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Family Members Grid */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-6 w-6 text-[#E02478]" />
                    <span>Family Members ({familyMembers.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {familyMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="mx-auto h-16 w-16 text-white/30 mb-4" />
                      <p className="text-white/60 text-lg mb-4">
                        No family members added yet
                      </p>
                      <p className="text-white/50 text-sm">
                        Add family members to start creating recognition quizzes
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {familyMembers.map((member, index) => (
                        <motion.div
                          key={member.id}
                          variants={itemVariants}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="group"
                        >
                          <Card className="hover:shadow-[#E02478]/30">
                            <CardContent className="p-6 text-center">
                              <div className="relative mb-4">
                                {/* Photo Display */}
                                <div className="relative">
                                  {member.images && member.images.length > 0 ? (
                                    <img
                                      src={`http://localhost:8000/uploads/${member.images[0].file_path}`}
                                      alt={member.name}
                                      className="w-24 h-24 rounded-full mx-auto object-cover ring-2 ring-[#E02478]/20"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-24 h-24 rounded-full mx-auto bg-gray-600 flex items-center justify-center ring-2 ring-[#E02478]/20">
                                      <User className="h-12 w-12 text-gray-400" />
                                    </div>
                                  )}

                                  {/* Upload Overlay */}
                                  <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    {uploadingPhotoFor === member.id ? (
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    ) : (
                                      <Camera className="h-6 w-6 text-white" />
                                    )}
                                  </div>

                                  {/* Hidden File Input */}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleFileSelect(member.id, e)
                                    }
                                    className="absolute inset-0 w-24 h-24 mx-auto opacity-0 cursor-pointer"
                                    disabled={uploadingPhotoFor === member.id}
                                  />
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="absolute -top-2 -right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <h3 className="font-semibold text-lg mb-1">
                                {member.name}
                              </h3>
                              <p className="text-white/70 text-sm mb-1">
                                {member.relationship_name || "Family Member"}
                              </p>
                              <p className="text-white/50 text-xs mb-3">
                                {member.images?.length || 0} photo
                                {member.images?.length === 1 ? "" : "s"}
                              </p>

                              {/* Upload Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                disabled={uploadingPhotoFor === member.id}
                                onClick={() => {
                                  const input = document.getElementById(
                                    `file-input-${member.id}`
                                  ) as HTMLInputElement;
                                  input?.click();
                                }}
                              >
                                {uploadingPhotoFor === member.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E02478] mr-2"></div>
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {member.images?.length > 0
                                      ? "Add Photo"
                                      : "Upload Photo"}
                                  </>
                                )}
                              </Button>

                              {/* Additional Hidden File Input for Button */}
                              <input
                                id={`file-input-${member.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(member.id, e)}
                                className="hidden"
                                disabled={uploadingPhotoFor === member.id}
                              />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
