"use client";

import { formatDate } from "@/lib/utils";
import { Link } from "next/link";
import { Plus, Users, FileText, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface Program {
  id: string;
  title: string;
  organization: string;
  description: string;
  durationWeeks: number;
  seats: number;
  applicationDeadline: Date | null;
  createdAt: Date;
  _count: {
    applications: number;
    internships: number;
  };
}

interface ProgramCardProps {
  program: Program;
  canDelete: boolean;
  onDelete: (id: string) => void;
}

export function ProgramCard({ program, canDelete, onDelete }: ProgramCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/programs/${program.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete program");
      }

      onDelete(program.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete program";
      alert(message);
      setDeleting(false);
    }
  };

  const availableSeats = program.seats - program._count.internships;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-brand-navy">
            {program.title}
          </h3>
          <p className="text-sm text-gray-500">{program.organization}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/supervisor/programs/${program.id}/edit`}
            className="text-brand-teal hover:underline text-sm flex items-center gap-1"
          >
            <Edit size={14} />
            Edit
          </Link>
          {canDelete && program._count.internships === 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={14} />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {program.description}
      </p>

      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{availableSeats} / {program.seats} seats</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText size={16} />
          <span>{program.durationWeeks} weeks</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">
            <strong className="text-brand-navy">{program._count.applications}</strong>{" "}
            applicants
          </span>
          <span className="text-gray-500">
            <strong className="text-brand-navy">{program._count.internships}</strong>{" "}
            active
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {formatDate(program.createdAt)}
        </span>
      </div>

      {program.applicationDeadline && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-gray-500">
            Deadline: {formatDate(program.applicationDeadline)}
          </span>
        </div>
      )}
    </div>
  );
}
