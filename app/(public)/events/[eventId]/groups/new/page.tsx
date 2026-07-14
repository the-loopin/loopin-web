"use client";

import {
  type FormEvent,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  createGroup,
  type GroupSize,
} from "@/lib/api";
import { withUploadedMedia } from "@/lib/media/withUploadedMedia";

import {
  ErrorMessage,
  Input,
  PageHeader,
  Panel,
  Select,
  SiteShell,
  Textarea,
} from "../../../../../site";

export default function NewGroupPage() {
  const params =
    useParams<{ eventId: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "Loopin meetup group",
    groupSize: "FOUR",
    maxMembers: "4",
    groupNote:
      "Let us meet before the event and go together.",
  });

  const [imageFile, setImageFile] =
    useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  function selectImage(
    file: File | null,
  ) {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(
        imagePreviewUrl,
      );
    }

    setImageFile(file);
    setImagePreviewUrl(
      file
        ? URL.createObjectURL(file)
        : "",
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const group =
        await withUploadedMedia({
          file: imageFile,
          purpose: "GROUP_IMAGE",
          commit: (imageMediaId) =>
            createGroup({
              eventId: params.eventId,
              title: form.title.trim(),
              groupSize:
                form.groupSize as GroupSize,
              maxMembers: Number(
                form.maxMembers,
              ),
              groupNote:
                form.groupNote.trim(),
              imageMediaId,
            }),
        });

      router.push(
        `/events/${params.eventId}/groups/${group.id}`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not create group.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <PageHeader
        title="Create group"
        subtitle={`Create a group for event #${params.eventId}.`}
      />

      <ErrorMessage message={error} />

      <Panel>
        <form
          className="grid gap-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Title"
              value={form.title}
              onChange={(title) =>
                setForm((current) => ({
                  ...current,
                  title,
                }))
              }
              required
            />

            <Select
              label="Group size"
              value={form.groupSize}
              options={[
                "TWO",
                "THREE",
                "FOUR",
                "FOUR_PLUS",
              ]}
              onChange={(groupSize) =>
                setForm((current) => ({
                  ...current,
                  groupSize,
                }))
              }
            />

            <Input
              label="Max members"
              value={form.maxMembers}
              onChange={(maxMembers) =>
                setForm((current) => ({
                  ...current,
                  maxMembers,
                }))
              }
              required
            />
          </div>

          <Textarea
            label="Group note"
            value={form.groupNote}
            onChange={(groupNote) =>
              setForm((current) => ({
                ...current,
                groupNote,
              }))
            }
          />

          <label className="grid gap-2 text-sm">
            <span className="font-medium">
              Group image
            </span>

            {imagePreviewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="max-h-64 rounded-xl object-cover"
                  src={imagePreviewUrl}
                  alt="Group image preview"
                />
              </>
            ) : null}

            <input
              accept="image/jpeg,image/png,image/webp"
              type="file"
              onChange={(changeEvent) =>
                selectImage(
                  changeEvent.target.files?.[0] ??
                    null,
                )
              }
            />
          </label>

          {imageFile ? (
            <button
              className="secondary-button"
              type="button"
              onClick={() => selectImage(null)}
            >
              Remove selected image
            </button>
          ) : null}

          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Creating..."
              : "Create group"}
          </button>
        </form>
      </Panel>
    </SiteShell>
  );
}
