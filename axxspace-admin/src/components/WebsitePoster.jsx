// Bump this when the poster PNG changes so browsers/CDNs don't serve a stale file.
const POSTER_VERSION = "20260926b";
const POSTER_PATH = "/axxspace_website_qr_poster_v2.png";
const POSTER_SRC = `${POSTER_PATH}?v=${POSTER_VERSION}`;
const POSTER_FILENAME = "axxspace_website_qr_poster.png";

export default function WebsitePoster() {
  const handleDownload = async () => {
    try {
      const response = await fetch(POSTER_SRC, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to fetch poster (${response.status})`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = POSTER_FILENAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      // Fallback: open image directly if blob download fails
      window.open(POSTER_SRC, "_blank", "noopener,noreferrer");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      window.alert("Please allow pop-ups to print the poster.");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>AXXSPACE Website QR Poster</title>
    <style>
      @page { margin: 0; size: auto; }
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
      img {
        display: block;
        width: 100%;
        max-width: 100%;
        height: auto;
        page-break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <img src="${POSTER_SRC}" alt="AXXSPACE Website QR Poster" onload="window.focus(); window.print();" />
  </body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="website-poster-page">
      <div className="website-poster-header">
        <div>
          <h2 className="website-poster-title">Website QR Poster</h2>
          <p className="website-poster-subtitle">
            Print-ready poster linking to <strong>www.axxspace.com</strong>. Download or print for gates, offices, and noticeboards.
          </p>
        </div>
        <div className="website-poster-actions">
          <button type="button" className="btn-poster-download" onClick={handleDownload}>
            Download PNG
          </button>
          <button type="button" className="btn-poster-print" onClick={handlePrint}>
            Print Poster
          </button>
        </div>
      </div>

      <div className="website-poster-preview-wrap">
        <img
          src={POSTER_SRC}
          alt="AXXSPACE website QR poster preview"
          className="website-poster-preview"
        />
      </div>
    </div>
  );
}
