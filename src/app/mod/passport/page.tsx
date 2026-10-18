import React from "react";
import { getEvidencePassport } from "@/lib/passport/passport-service";
import { PassportView } from "@/components/passport/passport-view";

export const metadata = {
  title: "Evidence Passport | OrbitMod V5",
  description: "Verifiable proof-of-work passport aggregating Avis trust, Quill evidence artifacts, and Scout pod outcomes.",
};

export default async function PassportPage() {
  const passport = await getEvidencePassport("candidate-alex-chen");
  return <PassportView passport={passport} />;
}
