import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { Check, X, Users } from "lucide-react";
import { formatDate, applicationStatusClass } from "@/lib/utils";

export default async function ApplicationsPage() {
  const session = await requireRole(["FIELD_SUPERVISOR", "ADMIN"]);

  const applications = await db.trainingApplication.findMany({
    where: { status: "PENDING" },
    include: {
      student: {
        select: { id: true, fullName: true, email: true },
      },
      program: {
        select: { id: true, title: true, organization: true, durationWeeks: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const academicSupervisors = await db.user.findMany({
    where: { role: "ACADEMIC_SUPERVISOR" },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Application Review Queue</h1>
        <Link href="/supervisor/students" className="btn btn-outline">
          <Users size={18} className="mr-2" />
          Assigned Students
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No pending applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              academicSupervisors={academicSupervisors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  academicSupervisors,
}: {
  application: any;
  academicSupervisors: any[];
}) {
  return (
    <div className="card">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-lg text-brand-navy">
                {application.student.fullName}
              </h3>
              <p className="text-sm text-gray-500">{application.student.email}</p>
            </div>
            <span className="text-xs text-gray-400">
              Applied {formatDate(application.createdAt)}
            </span>
          </div>

          <div className="mb-4">
            <p className="font-medium text-brand-navy">
              {application.program.title}
            </p>
            <p className="text-sm text-gray-600">
              {application.program.organization} • {application.program.durationWeeks} weeks
            </p>
          </div>

          {application.coverLetter && (
            <div className="bg-brand-beige/50 p-3 rounded text-sm">
              <p className="font-medium text-gray-700 mb-1">Cover Letter:</p>
              <p className="text-gray-600 line-clamp-3">{application.coverLetter}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <ApproveForm
            applicationId={application.id}
            academicSupervisors={academicSupervisors}
          />
          <RejectForm applicationId={application.id} />
        </div>
      </div>
    </div>
  );
}

function ApproveForm({
  applicationId,
  academicSupervisors,
}: {
  applicationId: string;
  academicSupervisors: any[];
}) {
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const academicSupervisorId = formData.get("academicSupervisorId") as string;

        const res = await fetch(`/api/applications/${applicationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "APPROVED",
            academicSupervisorId,
          }),
        });

        if (res.ok) {
          window.location.reload();
        } else {
          const result = await res.json();
          alert(result.error || "Failed to approve application");
        }
      }}
    >
      <select
        name="academicSupervisorId"
        required
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-brand-teal focus:border-brand-teal"
      >
        <option value="">Assign supervisor...</option>
        {academicSupervisors.map((sup) => (
          <option key={sup.id} value={sup.id}>
            {sup.fullName}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
      >
        <Check size={16} className="mr-1" />
        Approve
      </button>
    </form>
  );
}

function RejectForm({ applicationId }: { applicationId: string }) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const res = await fetch(`/api/applications/${applicationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "REJECTED" }),
        });

        if (res.ok) {
          window.location.reload();
        } else {
          const result = await res.json();
          alert(result.error || "Failed to reject application");
        }
      }}
    >
      <button
        type="submit"
        className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm"
      >
        <X size={16} className="mr-1" />
        Reject
      </button>
    </form>
  );
}
