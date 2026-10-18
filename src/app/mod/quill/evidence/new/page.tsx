import React from "react";
import { NewEvidenceClient } from "@/components/quill/new-evidence-client";

export const metadata = {
  title: "Issue Evidence Artifact | Quill - OrbitMod V5",
  description: "Cryptographically hashed verifiable proof-of-work submission.",
};

export default function NewEvidencePage() {
  return <NewEvidenceClient />;
}
