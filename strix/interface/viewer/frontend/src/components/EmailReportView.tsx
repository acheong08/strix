import { useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { downloadReport } from "@/data/serverSource";

type Step = "ready" | "downloading" | "done";

interface EmailReportViewProps {
  activeRun: string | null;
  onExit: () => void;
}

const DOWNLOAD_ERRORS: Record<string, string> = {
  run_not_finished: "This run is still in progress. Wait for it to finish before exporting a PDF.",
  unavailable: "Could not build the PDF right now. Try again.",
};

export default function EmailReportView({ activeRun, onExit }: EmailReportViewProps) {
  const [step, setStep] = useState<Step>("ready");
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState("");

  const onDownload = async () => {
    setStep("downloading");
    setError(null);
    const result = await downloadReport(activeRun);
    if (result.ok) {
      setFilename(result.filename);
      setStep("done");
      return;
    }
    setError(DOWNLOAD_ERRORS[result.error] ?? DOWNLOAD_ERRORS.unavailable);
    setStep("ready");
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <button
        onClick={onExit}
        className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-[#888] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to results
      </button>

      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-[#888]" aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-white">Export report to PDF</h1>
      </div>

      <div
        className="w-full rounded-2xl bg-[rgba(255,255,255,0.02)] p-6"
        style={{ border: "1px solid #2a2a2a" }}
      >
        <p className="mb-4 text-xs text-[#666]">
          Generate the full report locally and download it straight to this machine.
        </p>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" aria-hidden="true" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {step === "done" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" aria-hidden="true" />
              <p className="text-xs text-emerald-200">
                PDF downloaded locally as <span className="font-mono">{filename}</span>.
              </p>
            </div>
            <button
              onClick={onDownload}
              className="w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ border: "1px solid #2a2a2a" }}
            >
              Download again
            </button>
          </div>
        ) : (
          <button
            onClick={() => void onDownload()}
            disabled={step === "downloading"}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {step === "downloading" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {step === "downloading" ? "Building PDF..." : "Download PDF"}
          </button>
        )}
      </div>
    </div>
  );
}
