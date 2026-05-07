"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Bell, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");

  const [profileForm, setProfileForm] = useState({
    fullName: session?.user?.fullName || "",
    email: session?.user?.email || "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      await update();
      setProfileMessage("Profile updated successfully!");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setProfileMessage(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters");
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage("");

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordMessage("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update password";
      setPasswordMessage(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-brand-navy mb-6">Settings</h1>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-brand-teal text-brand-teal font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <User size={18} />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "password"
              ? "border-brand-teal text-brand-teal font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Lock size={18} />
          Password
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "notifications"
              ? "border-brand-teal text-brand-teal font-medium"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="card">
          <h2 className="text-xl font-semibold text-brand-navy mb-4">Edit Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                required
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
            </div>
            <div className="pt-2 text-sm text-gray-500">
              <p>Role: <span className="font-medium">{session?.user?.role?.replace("_", " ")}</span></p>
            </div>
            {profileMessage && (
              <div className={`flex items-center gap-2 p-3 rounded ${
                profileMessage.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {profileMessage.includes("success") && <CheckCircle2 size={16} />}
                {profileMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={profileSaving}
              className="btn bg-brand-teal hover:bg-brand-navy text-white px-6 py-2 disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "password" && (
        <div className="card">
          <h2 className="text-xl font-semibold text-brand-navy mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
            </div>
            {passwordMessage && (
              <div className={`flex items-center gap-2 p-3 rounded ${
                passwordMessage.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {passwordMessage.includes("success") && <CheckCircle2 size={16} />}
                {passwordMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={passwordSaving}
              className="btn bg-brand-teal hover:bg-brand-navy text-white px-6 py-2 disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="card">
          <h2 className="text-xl font-semibold text-brand-navy mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-brand-navy">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-brand-teal rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-brand-navy">Report Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to submit weekly reports</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-brand-teal rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-brand-navy">Evaluation Notifications</p>
                <p className="text-sm text-gray-500">Get notified when new evaluations are posted</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-brand-teal rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-brand-navy">Message Notifications</p>
                <p className="text-sm text-gray-500">Get notified for new messages in conversations</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-brand-teal rounded" />
            </div>
            <p className="text-sm text-gray-400 italic mt-4">
              Notification preferences are saved automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
