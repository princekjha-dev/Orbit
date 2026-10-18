import React from "react";
import { NewNoteClient } from "@/components/relay/new-note-client";

export const metadata = {
  title: "Propose Community Note | Relay - OrbitMod V5",
  description: "Objective context and decentralized community notes studio.",
};

export default function NewCommunityNotePage() {
  return <NewNoteClient />;
}
