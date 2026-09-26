import { useState } from "react";
import { resolveMediaUrl } from "../utils/fileLinks";
import { getWhatsAppUrl } from "../utils/whatsapp";

export default function AgentCard({ agent, rentalId }) {
  if (!agent) return null;

  const { name, agentProfile } = agent;
  const { phone, county, bio, verificationStatus, photo } = agentProfile || {};
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const isVerified = verificationStatus === "verified";

  const whatsappUrl = isVerified && phone ? getWhatsAppUrl(
    phone,
    `Hello ${name}, I'm interested in a property you're representing.`
  ) : null;

  const handleWhatsAppClick = async (e) => {
    if (!isVerified || !phone) return;

    // Log inquiry (fire-and-forget, don't block WhatsApp redirect)
    if (rentalId) {
      fetch(`${process.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api"}/inquiries/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId,
          agentId: agent._id,
        }),
      }).catch((err) => console.error("Failed to log inquiry:", err));
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason || !reporterContact) {
      alert("Please select a reason and provide your contact information");
      return;
    }

    setSubmittingReport(true);
    try {
      const response = await fetch(`${process.env.VITE_API_URL || "https://axx-spaces-backend-1.onrender.com/api"}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent._id,
          rentalId: rentalId || null,
          reason: reportReason,
          details: reportDetails,
          reporterContact,
        }),
      });

      if (response.ok) {
        alert("Report submitted successfully");
        setShowReportModal(false);
        setReportReason("");
        setReportDetails("");
        setReporterContact("");
      } else {
        alert("Failed to submit report");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-200">
      <div className="flex items-start gap-4">
        {/* Agent Photo */}
        <div className="flex-shrink-0">
          {photo ? (
            <img
              src={resolveMediaUrl(photo)}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-500">{name?.charAt(0) || "A"}</span>
            </div>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
            {isVerified ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                ✓ Verified
              </span>
            ) : (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                Verification Pending
              </span>
            )}
          </div>

          {county && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">County:</span> {county}
            </p>
          )}

          {bio && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{bio}</p>
          )}

          {/* WhatsApp Button - Only show if verified */}
          {isVerified && whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contact on WhatsApp
            </a>
          )}

          {!isVerified && (
            <p className="mt-4 text-sm text-gray-500 italic">
              Contact information hidden until agent verification is complete
            </p>
          )}

          {/* Report Agent Link */}
          <button
            onClick={() => setShowReportModal(true)}
            className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
          >
            Report this agent
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report Agent</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="no_show">Agent didn't show up</option>
                  <option value="fake_listing">Fake listing</option>
                  <option value="payment_requested">Requested payment before viewing</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Please provide more details..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Contact (Phone/Email) *
                </label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  placeholder="phone or email"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
