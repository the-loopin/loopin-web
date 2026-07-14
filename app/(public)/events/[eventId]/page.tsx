"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  deleteEvent,
  type EventCategory,
  type EventItem,
  type EventPayload,
  type EventUpdateRequest,
  getEvent,
  updateEvent,
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
} from "../../../site";

const categories = [
  "TECH",
  "STARTUP",
  "HR",
  "EDUCATION",
  "TRAVEL",
  "SPORT",
  "SOCIAL",
  "LANGUAGE",
  "CREATIVE",
  "OTHER",
];

function toForm(
  event: EventItem,
): EventPayload {
  return {
    title: event.title,
    description: event.description,
    type: event.type,
    category: event.category,
    city: event.city,
    address: event.address,
    latitude: event.latitude ?? 0,
    longitude: event.longitude ?? 0,
    startDateTime: event.startDateTime,
    endDateTime: event.endDateTime,
    isFree: event.isFree,
    price: Number(event.price ?? 0),
    organizerName: event.organizerName,
  };
}

function getInterestIds(
  event: EventItem,
): string[] {
  return event.interests
    .map((interest) => interest.id)
    .filter(
      (id): id is string =>
        typeof id === "string" &&
        id.length > 0,
    );
}

export default function EventDetailRoutePage() {
  const params =
    useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params.eventId;

  const [event, setEvent] =
    useState<EventItem | null>(null);
  const [form, setForm] =
    useState<EventPayload | null>(null);
  const [imageFile, setImageFile] =
    useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] =
    useState("");
  const [removeExistingImage, setRemoveExistingImage] =
    useState(false);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] = useState("");

  async function loadEvent() {
    setError("");

    try {
      const loaded = await getEvent(eventId);
      setEvent(loaded);
      setForm(toForm(loaded));
      setRemoveExistingImage(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load event.",
      );
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(
      () => void loadEvent(),
      0,
    );

    return () =>
      window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

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

    if (file) {
      setRemoveExistingImage(false);
    }
  }

  async function handleUpdate(
    submitEvent:
      FormEvent<HTMLFormElement>,
  ) {
    submitEvent.preventDefault();

    if (!form || !event) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const existingImageMediaId =
        removeExistingImage
          ? undefined
          : event.image?.id;

      const updated =
        await withUploadedMedia({
          file: imageFile,
          purpose: "EVENT_IMAGE",
          commit: (uploadedMediaId) => {
            const payload:
              EventUpdateRequest = {
                title: form.title.trim(),
                description:
                  form.description.trim(),
                type: form.type,
                category: form.category,
                city: form.city.trim(),
                address:
                  form.address.trim() ||
                  undefined,
                latitude: form.latitude,
                longitude: form.longitude,
                startDateTime:
                  form.startDateTime,
                endDateTime:
                  form.endDateTime,
                isFree: form.isFree,
                price: form.isFree
                  ? 0
                  : Number(form.price),
                organizerName:
                  form.organizerName.trim(),
                imageMediaId:
                  uploadedMediaId ??
                  existingImageMediaId,
                interestIds:
                  getInterestIds(event),
              };

            return updateEvent(
              eventId,
              payload,
            );
          },
        });

      setEvent(updated);
      setForm(toForm(updated));
      setImageFile(null);
      setRemoveExistingImage(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not update event.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this event permanently?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEvent(eventId);
      router.push("/events");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not delete event.",
      );
    }
  }

  return (
    <SiteShell>
      <PageHeader
        title={
          event?.title ?? "Event detail"
        }
        subtitle={
          event
            ? `${event.city} - ${event.category} - ${event.status}`
            : "Loading event"
        }
        action={
          <Link
            className="primary-link"
            href={`/events/${eventId}/groups/new`}
          >
            Create group
          </Link>
        }
      />

      <ErrorMessage message={error} />

      {form && event ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <Panel title="Edit event">
            <form
              className="grid gap-3"
              onSubmit={handleUpdate}
            >
              <Input
                label="Title"
                value={form.title}
                onChange={(title) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          title,
                        }
                      : current,
                  )
                }
              />

              <Textarea
                label="Description"
                value={form.description}
                onChange={(description) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          description,
                        }
                      : current,
                  )
                }
              />

              <div className="grid gap-3 md:grid-cols-2">
                <Select
                  label="Category"
                  value={form.category}
                  options={categories}
                  onChange={(category) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            category:
                              category as EventCategory,
                          }
                        : current,
                    )
                  }
                />

                <div className="grid gap-1">
                  <span className="text-sm font-medium">
                    Status
                  </span>
                  <p className="rounded-md border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
                    {event.status}
                  </p>
                </div>

                <Input
                  label="City"
                  value={form.city}
                  onChange={(city) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            city,
                          }
                        : current,
                    )
                  }
                />

                <Input
                  label="Address"
                  value={form.address}
                  onChange={(address) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            address,
                          }
                        : current,
                    )
                  }
                />

                <Input
                  label="Start"
                  value={
                    form.startDateTime
                  }
                  onChange={(
                    startDateTime,
                  ) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            startDateTime,
                          }
                        : current,
                    )
                  }
                />

                <Input
                  label="End"
                  value={form.endDateTime}
                  onChange={(
                    endDateTime,
                  ) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            endDateTime,
                          }
                        : current,
                    )
                  }
                />

                <Input
                  label="Organizer"
                  value={
                    form.organizerName
                  }
                  onChange={(
                    organizerName,
                  ) =>
                    setForm((current) =>
                      current
                        ? {
                            ...current,
                            organizerName,
                          }
                        : current,
                    )
                  }
                />
              </div>

              <div className="grid gap-2 rounded-xl border border-[var(--line)] p-4">
                <span className="text-sm font-medium">
                  Event image
                </span>

                {imagePreviewUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="max-h-72 rounded-xl object-cover"
                      src={imagePreviewUrl}
                      alt="New event image preview"
                    />
                  </>
                ) : null}

                <input
                  accept="image/jpeg,image/png,image/webp"
                  type="file"
                  onChange={(changeEvent) =>
                    selectImage(
                      changeEvent.target
                        .files?.[0] ??
                        null,
                    )
                  }
                />

                {event.image?.id &&
                !removeExistingImage ? (
                  <p className="text-sm text-[var(--muted)]">
                    Attached media:{" "}
                    {event.image.id}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {imageFile ? (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() =>
                        selectImage(null)
                      }
                    >
                      Clear new image
                    </button>
                  ) : null}

                  {event.image?.id &&
                  !removeExistingImage ? (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => {
                        selectImage(null);
                        setRemoveExistingImage(
                          true,
                        );
                      }}
                    >
                      Remove attached image
                    </button>
                  ) : null}

                  {removeExistingImage ? (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() =>
                        setRemoveExistingImage(
                          false,
                        )
                      }
                    >
                      Keep attached image
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save event"}
                </button>

                <button
                  className="secondary-button"
                  onClick={
                    handleDelete
                  }
                  type="button"
                >
                  Delete event
                </button>
              </div>
            </form>
          </Panel>

          <Panel title="Event actions">
            <div className="grid gap-2">
              <Link
                className="primary-link justify-center"
                href={`/events/${eventId}/groups/new`}
              >
                Create group
              </Link>

              <Link
                className="secondary-link justify-center"
                href="/events"
              >
                Back to events
              </Link>
            </div>
          </Panel>
        </div>
      ) : null}
    </SiteShell>
  );
}
