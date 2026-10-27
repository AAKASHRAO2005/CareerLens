"use client";

import React, { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useMockData } from "@/features/mock-context";

export default function ProfilePage() {
  const { profile, updateProfile, addSkill, removeSkill } = useMockData();
  const [displayName, setDisplayName] = useState(profile.displayName || "Alex Rivera");
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
    const added = addSkill(newSkill.trim());
    if (!added) {
      setSkillError("Skill already exists in your inventory.");
      return;
    }
    setNewSkill("");
    setSuccessMessage("Skill added to your inventory!");
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AR";

  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Header Profile Banner */}
      <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] p-space-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
        <div className="flex items-start sm:items-center gap-space-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-fixed text-primary font-bold text-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-primary-fixed-dim">
            {initials}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold">
                {displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                Verified Student
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              MIT Course 6-3 • Computer Science & Engineering (Class of 2025)
            </p>
            <div className="flex items-center gap-space-md text-caption font-caption text-outline flex-wrap pt-0.5">
              <span className="flex items-center gap-1">
                <MaterialIcon name="school" className="text-[16px]" />
                Massachusetts Institute of Technology
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MaterialIcon name="location_on" className="text-[16px]" />
                Cambridge, MA
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MaterialIcon name="mail" className="text-[16px]" />
                {profile.email}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Readiness Gauge */}
        <div className="bg-surface-container-low p-space-md rounded-xl border border-[#e2e8f0] flex items-center gap-space-md flex-shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface-container"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-tertiary"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="96, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm font-bold text-on-surface">
              96%
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Full Clearance
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Registrar attestation verified
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-space-md rounded-xl bg-tertiary-fixed/40 border border-tertiary-fixed-dim text-on-tertiary-fixed-variant font-body-sm text-body-sm flex items-center gap-2">
          <MaterialIcon name="check_circle" className="text-[20px] text-tertiary" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (8 cols): Skills Inventory & Coursework */}
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          {/* Skills Tag Inventory Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Technical Inventory
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Declared Skill Tags ({profile.skills.length})
                </h3>
              </div>
              <span className="font-caption text-caption text-outline">
                Used in Deterministic Match
              </span>
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add verified skill (e.g. Go, Kubernetes, Kafka, Rust)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="h-10 flex-1 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
              />
              <button
                type="submit"
                className="h-10 px-space-lg rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <MaterialIcon name="add" className="text-[18px]" />
                <span>Add Skill</span>
              </button>
            </form>
            {skillError && (
              <p className="font-label-sm text-label-sm text-error font-medium">{skillError}</p>
            )}

            {/* Current Skills Chips */}
            <div className="pt-2">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold block mb-2">
                Active Verified Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container border border-primary-fixed-dim text-primary font-label-sm text-label-sm font-semibold group"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
                      title="Remove skill"
                    >
                      <MaterialIcon name="close" className="text-[14px]" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Transcripts Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Academic Attestation
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Verified EECS Coursework
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                Registrar Sealed
              </span>
            </div>

            <div className="space-y-space-sm">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-[#e2e8f0] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    6.824 • Distributed Computer Systems
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Raft Consensus, Fault Tolerant State Machines, Paxos
                  </span>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-tertiary">Grade: A</span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-[#e2e8f0] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    6.006 • Introduction to Algorithms
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Graph algorithms, Dynamic Programming, Hashing
                  </span>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-tertiary">Grade: A</span>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low border border-[#e2e8f0] flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    6.033 • Computer Systems Engineering
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Client-Server Systems, Virtual Memory, Security Principles
                  </span>
                </div>
                <span className="font-label-sm text-label-sm font-bold text-tertiary">Grade: A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Account & Affiliation */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Account Details Form */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-md">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Account Credentials
            </span>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-[#cbd5e1] font-body-md text-body-md"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Verified Email (AWS Cognito)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-10 px-3 rounded-lg border border-[#cbd5e1] bg-surface-container-low font-body-md text-body-md text-on-surface-variant cursor-not-allowed"
                />
                <span className="font-caption text-caption text-outline">
                  Cryptographically bound to your User Pool JWT.
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md font-semibold transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Institutional Affiliation */}
          <div className="bg-surface-container-lowest rounded-xl border border-[#e2e8f0] shadow-sm p-space-xl flex flex-col gap-space-sm">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Institutional ID
            </span>
            <div className="space-y-2 pt-1 font-body-sm text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">University:</span>
                <span className="font-semibold text-on-surface">MIT (EECS)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Student ID:</span>
                <span className="font-semibold text-on-surface">928174028</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Cumulative GPA:</span>
                <span className="font-semibold text-tertiary">4.9 / 5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Placement Officer:</span>
                <span className="font-semibold text-on-surface">Dr. Linda Chen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
