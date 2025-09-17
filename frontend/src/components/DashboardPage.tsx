import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, PlayCircle, Trash2, Upload } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  photoUrl: string;
}

interface DashboardPageProps {
  onStartQuiz: (members: FamilyMember[]) => void;
}

export const DashboardPage = ({ onStartQuiz }: DashboardPageProps) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      relationship: 'Daughter',
      photoUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      name: 'Michael Johnson',
      relationship: 'Son',
      photoUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    photoUrl: ''
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) return;

    const member: FamilyMember = {
      id: Date.now().toString(),
      name: newMember.name,
      relationship: newMember.relationship,
      photoUrl: newMember.photoUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    setFamilyMembers(prev => [...prev, member]);
    setNewMember({ name: '', relationship: '', photoUrl: '' });
    setShowAddForm(false);
  };

  const handleDeleteMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
                    onClick={() => familyMembers.length > 0 && onStartQuiz(familyMembers)}
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
              animate={{ opacity: 1, height: 'auto' }}
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
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship</Label>
                      <Input
                        id="relationship"
                        placeholder="e.g., Son, Daughter, Spouse"
                        value={newMember.relationship}
                        onChange={(e) => setNewMember(prev => ({ ...prev, relationship: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                      <Input
                        id="photoUrl"
                        placeholder="Enter photo URL or leave blank for default"
                        value={newMember.photoUrl}
                        onChange={(e) => setNewMember(prev => ({ ...prev, photoUrl: e.target.value }))}
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
                    <Button onClick={handleAddMember}>
                      Add Member
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
                    <p className="text-white/60 text-lg mb-4">No family members added yet</p>
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
                              <img
                                src={member.photoUrl}
                                alt={member.name}
                                className="w-24 h-24 rounded-full mx-auto object-cover ring-2 ring-[#E02478]/20"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400';
                                }}
                              />
                              <button
                                onClick={() => handleDeleteMember(member.id)}
                                className="absolute -top-2 -right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                            <p className="text-white/70 text-sm">{member.relationship}</p>
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
      </div>
    </div>
  );
};