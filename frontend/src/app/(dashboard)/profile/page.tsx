"use client";

import React, { useState } from "react";
import { User, Sparkles, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useMockData } from "@/features/mock-context";

export default function ProfilePage() {
  const { profile, updateProfile, addSkill, removeSkill } = useMockData();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [newSkill, setNewSkill] = useState("");
  const [skillError, setSkillError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    updateProfile({ displayName: displayName.trim() });
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    setSkillError(null);
    if (!newSkill.trim()) return;
    const added = addSkill(newSkill);
    if (!added) {
      setSkillError("Skill already exists in your inventory.");
      return;
    }
    setNewSkill("");
    setSuccessMessage("Skill added to your inventory!");
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Profile & Skills Inventory
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details and declared skill tags used across CareerLens.
        </p>
      </div>

      {successMessage && (
        <Alert variant="success">
          {successMessage}
        </Alert>
      )}

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Account Details</span>
          </div>
          <CardTitle className="text-lg">Student Profile</CardTitle>
          <CardDescription>Verified Cognito identity and contact information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              label="Verified Email (Cognito Claim)"
              type="email"
              value={profile.email}
              disabled
              helperText="Email is bound to your verified AWS Cognito User Pool identity and cannot be edited arbitrarily."
            />
          </CardContent>
          <CardFooter className="border-t border-slate-100 pt-4 flex justify-end">
            <Button size="sm" type="submit">
              Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Skills Inventory Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Skill Inventory</span>
            </div>
            <Badge variant="default" size="sm">
              {profile.skills.length} Skills Declared
            </Badge>
          </div>
          <CardTitle className="text-lg">Declared Skills</CardTitle>
          <CardDescription>
            These skills are used by the deterministic Skill-Gap Analyzer to calculate role match rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddSkill} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. AWS, GraphQL, Kafka, Tailwind)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button size="sm" type="submit">
                <Plus className="w-4 h-4 mr-1" />
                Add Skill
              </Button>
            </div>
            {skillError && (
              <p className="text-xs text-rose-600 font-medium">{skillError}</p>
            )}
          </form>

          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Current Skill Tags
            </p>
            {profile.skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="default"
                    className="gap-2 py-1.5 px-3 text-xs font-medium bg-indigo-50/80 text-indigo-700 border-indigo-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-full hover:bg-indigo-200 p-0.5 text-indigo-500 hover:text-indigo-800 transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
