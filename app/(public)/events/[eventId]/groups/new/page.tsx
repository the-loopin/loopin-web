"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createGroup, GroupSize } from "@/lib/api";
import { ErrorMessage, Input, PageHeader, Panel, Select, SiteShell, Textarea } from "../../../../../site";

export default function NewGroupPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "Loopin meetup group",
    groupSize: "FOUR",
    maxMembers: "4",
    groupNote: "Let us meet before the event and go together.",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const group = await createGroup({
        eventId: params.eventId,
        title: form.title,
        groupSize: form.groupSize as GroupSize,
        maxMembers: Number(form.maxMembers),
        groupNote: form.groupNote,
      });
      router.push(`/events/${params.eventId}/groups/${group.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create group.");
    }
  }

  return (
    <SiteShell>
      <PageHeader title="Create group" subtitle={`Create a group for event #${params.eventId}.`} />
      <ErrorMessage message={error} />
      <Panel>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Title" value={form.title} onChange={(title) => setForm((c) => ({ ...c, title }))} required />
            <Select label="Group size" value={form.groupSize} options={["TWO", "THREE", "FOUR", "FOUR_PLUS"]} onChange={(groupSize) => setForm((c) => ({ ...c, groupSize }))} />
            <Input label="Max members" value={form.maxMembers} onChange={(maxMembers) => setForm((c) => ({ ...c, maxMembers }))} required />
          </div>
          <Textarea label="Group note" value={form.groupNote} onChange={(groupNote) => setForm((c) => ({ ...c, groupNote }))} />
          <button className="primary-button" type="submit">Create group</button>
        </form>
      </Panel>
    </SiteShell>
  );
}
