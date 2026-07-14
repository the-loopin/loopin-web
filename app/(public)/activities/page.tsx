"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createEvent,
  type EventItem,
  type EventPayload,
  getEvents,
  getMyLoopedEvents,
  loopInEvent,
  unloopEvent,
  EventCategory,
  SpringPage,
} from "@/lib/api";
import { withUploadedMedia } from "@/lib/media/withUploadedMedia";
import { getAuthToken } from "@/lib/auth/session";
import LocationPickerMap from "@/components/ui/LocationPickerMap";
import { EmptyState, ErrorMessage, Input, PageHeader, Select, SiteShell } from "../../site";
import { ArrowLeft, CalendarDays, CheckCircle2, CircleMinus, Clock, FileText, ImagePlus, Info, MapPin, Navigation, Plus, RefreshCw, Save, Search, Send, Ticket, Users } from "lucide-react";

const categories = ["TECH", "STARTUP", "HR", "EDUCATION", "TRAVEL", "SPORT", "SOCIAL", "LANGUAGE", "CREATIVE", "OTHER"];
const bakuCenter = { latitude: 40.3777, longitude: 49.892 };

function formatDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDateTimeFromNow(minutesFromNow: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesFromNow);
  date.setSeconds(0, 0);
  return formatDateTimeLocal(date);
}

function formatCategoryName(category: string) {
  if (!category) return "All Categories";
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function getDisplayCategory(activity: EventItem) {
  return activity.displayCategory?.trim() || formatCategoryName(activity.category);
}

function normalizeAddressText(value: string) {
  return value
    .toLowerCase()
    .replace(/[ə]/g, "e")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ü]/g, "u")
    .replace(/[ğ]/g, "g")
    .replace(/[ç]/g, "c")
    .replace(/[ş]/g, "s")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function buildBakuAddressQueries(address: string) {
  const base = address.trim();
  const variants = new Set<string>();
  const addBaku = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    variants.add(/baku|baki|bakı|azerbaijan|azərbaycan/i.test(trimmed) ? trimmed : `${trimmed}, Baku, Azerbaijan`);
  };

  addBaku(base);
  addBaku(base.replace(/\belmler akademiyasi\b/gi, "Elmlər Akademiyası"));
  addBaku(base.replace(/\bganja avenue\b/gi, "Gəncə prospekti"));
  addBaku(base.replace(/\bganja prospekti\b/gi, "Gəncə prospekti"));

  const numberMatch = base.match(/\b\d+[a-zA-Z]?\b/);
  if (numberMatch) {
    const houseNumber = numberMatch[0];
    const withoutNumber = base.replace(houseNumber, "").trim();
    addBaku(`${houseNumber} ${withoutNumber}`);
    addBaku(`${withoutNumber} ${houseNumber}`);
    addBaku(`${houseNumber} ${withoutNumber.replace(/\bavenue\b/gi, "prospekti")}`);
    addBaku(`${withoutNumber.replace(/\bavenue\b/gi, "prospekti")} ${houseNumber}`);
  }

  return [...variants];
}

type NominatimPlace = {
  lat: string;
  lon: string;
  display_name?: string;
  address?: { city?: string; town?: string; village?: string; municipality?: string };
};

function scoreAddressPlace(place: NominatimPlace, originalAddress: string) {
  const normalizedDisplay = normalizeAddressText(place.display_name ?? "");
  const normalizedOriginal = normalizeAddressText(originalAddress);
  const houseNumber = originalAddress.match(/\b\d+[a-zA-Z]?\b/)?.[0];
  const tokens = normalizedOriginal.split(" ").filter((token) => token.length > 2);

  let score = /baku|baki|bakı/.test(place.display_name ?? "") ? 30 : 0;
  if (houseNumber && normalizedDisplay.includes(houseNumber.toLowerCase())) score += 55;
  if (normalizedDisplay.includes(normalizedOriginal)) score += 40;
  score += tokens.filter((token) => normalizedDisplay.includes(token)).length * 8;

  return score;
}

function createInitialForm(): EventPayload {
  return {
    title: "Casual Photography Walk",
    description: "Meet up to walk around Icherisheher and take some photos.",
    type: "ACTIVITY",
    category: "CREATIVE",
    city: "Baku",
    address: "Old City Gate",
    latitude: bakuCenter.latitude,
    longitude: bakuCenter.longitude,
    startDateTime: getDateTimeFromNow(60),
    endDateTime: getDateTimeFromNow(180),
    isFree: true,
    price: 0,
    organizerName: "Leo Test",
  };
}

const initialFilters = { city: "", category: "", search: "", isFree: "" };
const loopedEventsStorageKey = "loopin-looped-event-ids";
type ActionToast = {
  type: "added" | "removed" | "validation" | "error";
  title: string;
  message: string;
};
type FormErrors = Partial<Record<keyof EventPayload | "customCategory" | "imageFile", string>>;
type ApiErrorResponse = {
  message?: string;
  fieldErrors?: Record<string, string>;
};
const createFieldOrder: Array<keyof FormErrors> = [
  "title",
  "description",
  "customCategory",
  "address",
  "startDateTime",
  "endDateTime",
  "organizerName",
  "price",
];
const createSteps = [
  { href: "#activity-basic", title: "Basic Information", description: "Name, description and category" },
  { href: "#activity-time", title: "Date & Time", description: "When your activity happens" },
  { href: "#activity-location", title: "Location", description: "Address and map marker" },
  { href: "#activity-image", title: "Activity Image", description: "Cover image and preview" },
  { href: "#activity-details", title: "Additional Info", description: "Organizer and pricing" },
  { href: "#activity-review", title: "Review", description: "Final hosting check" },
];

function getApiErrorResponse(caught: unknown) {
  if (
    typeof caught === "object" &&
    caught !== null &&
    "response" in caught &&
    typeof caught.response === "object" &&
    caught.response !== null &&
    "data" in caught.response
  ) {
    return caught.response.data as ApiErrorResponse;
  }

  return null;
}

function getApiErrorMessage(caught: unknown, fallback: string) {
  const apiError = getApiErrorResponse(caught);
  const firstFieldError = apiError?.fieldErrors ? Object.values(apiError.fieldErrors)[0] : null;
  const message = firstFieldError ?? apiError?.message ?? (caught instanceof Error ? caught.message : fallback);
  return message.toLowerCase().includes("already exists") ? "This activity already exists." : message;
}

function getStoredLoopedIds() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const ids = JSON.parse(window.localStorage.getItem(loopedEventsStorageKey) ?? "[]") as string[];
    return Object.fromEntries(ids.map((id) => [id, true]));
  } catch {
    return {};
  }
}

function saveStoredLoopedIds(loopedIds: Record<string, boolean>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(loopedEventsStorageKey, JSON.stringify(Object.keys(loopedIds)));
}

function getMapUrl(latitude: number, longitude: number, span = 0.018, showMarker = true) {
  const marker = showMarker ? `&marker=${latitude}%2C${longitude}` : "";
  return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - span}%2C${latitude - span * 0.66}%2C${longitude + span}%2C${latitude + span * 0.66}&layer=mapnik${marker}`;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<EventItem[]>([]);
  const [pageData, setPageData] = useState<SpringPage<EventItem> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;
  const [form, setForm] = useState(() => createInitialForm());
  const [customCategory, setCustomCategory] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [locatingAddress, setLocatingAddress] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<EventItem["id"] | null>(null);
  const [flippedActivityIds, setFlippedActivityIds] = useState<Record<string, boolean>>({});
  const [loopedActivityIds, setLoopedActivityIds] = useState<Record<string, boolean>>({});
  const [actionToast, setActionToast] = useState<ActionToast | null>(null);
  const [activeCreateStep, setActiveCreateStep] = useState(createSteps[0].href);

  async function loadActivities(page = 0) {
    setLoading(true);
    setError("");

    try {
      const data = await getEvents({
        type: "ACTIVITY",
        city: filters.city || undefined,
        category: filters.category
          ? (filters.category as EventCategory)
          : undefined,
        search: filters.search || undefined,
        isFree:
          filters.isFree === "true"
            ? true
            : filters.isFree === "false"
              ? false
              : undefined,
        page,
        size: pageSize,
      });

      setPageData(data);
      setActivities(data.content);
      setCurrentPage(data.number ?? page);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load activities.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadActivities(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.category,
    filters.city,
    filters.isFree,
    filters.search,
  ]);

  useEffect(() => {
  if (!getAuthToken()) {
    return;
  }

  async function loadLoopedActivities() {
    const storedLoopedIds =
      getStoredLoopedIds();

    try {
      const loopedEvents =
        await getMyLoopedEvents();

      const loopedIds =
        Object.fromEntries(
          (loopedEvents.content || [])
            .filter((item) => item.event && item.event.id)
            .map((item) => [
              String(item.event!.id),
              true,
            ]),
        );

      setLoopedActivityIds(loopedIds);
      saveStoredLoopedIds(loopedIds);
    } catch {
      /*
       * if Backend request fails
       * use localStorage fallback.
       */
      setLoopedActivityIds(
        storedLoopedIds,
      );
    }
  }

  void loadLoopedActivities();
}, []);

  useEffect(() => {
    if (!actionToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionToast(null), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [actionToast]);

  useEffect(() => {
    if (Object.keys(formErrors).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => setFormErrors({}), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [formErrors]);

  useEffect(() => {
    if (!showCreateForm) {
      return;
    }

    const updateActiveStep = () => {
      const sectionPositions = createSteps
        .map((step) => {
          const section = document.querySelector(step.href);
          return section ? { href: step.href, top: Math.abs(section.getBoundingClientRect().top - 150) } : null;
        })
        .filter((section): section is { href: string; top: number } => section !== null);

      const closestSection = sectionPositions.sort((first, second) => first.top - second.top)[0];
      if (closestSection) {
        setActiveCreateStep(closestSection.href);
      }
    };

    updateActiveStep();
    window.addEventListener("scroll", updateActiveStep, { passive: true });
    window.addEventListener("resize", updateActiveStep);
    return () => {
      window.removeEventListener("scroll", updateActiveStep);
      window.removeEventListener("resize", updateActiveStep);
    };
  }, [showCreateForm]);

  function updateFormField<Key extends keyof EventPayload>(field: Key, value: EventPayload[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (form.title.length > 120) nextErrors.title = "Title must be under 120 characters.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (form.category === "OTHER" && !customCategory.trim()) nextErrors.customCategory = "Tell people what kind of activity this is.";
    if (!form.address.trim()) nextErrors.address = "Address is required so people can find it.";
    if (!form.startDateTime) nextErrors.startDateTime = "Start date and time is required.";
    if (!form.endDateTime) nextErrors.endDateTime = "End date and time is required.";
    if (form.startDateTime && form.endDateTime && new Date(form.endDateTime) <= new Date(form.startDateTime)) {
      nextErrors.endDateTime = "End time must be after start time.";
    }
    if (!form.organizerName.trim()) nextErrors.organizerName = "Organizer name is required.";
    if (!form.isFree && (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0)) {
      nextErrors.price = "Paid activities need a valid price.";
    }

    setFormErrors(nextErrors);
    return nextErrors;
  }

  function focusFirstInvalidField(errors: FormErrors) {
    const firstField = createFieldOrder.find((field) => errors[field]);
    if (!firstField) return;

    window.setTimeout(() => {
      const field = document.querySelector(`[data-create-field="${firstField}"]`);
      const control = field?.querySelector<HTMLElement>("input, textarea, select, button");
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      control?.focus({ preventScroll: true });
    }, 0);
  }

  async function geocodeAddress(address = form.address) {
    const trimmedAddress = address.trim();
    if (trimmedAddress.length < 4) return;

    setLocatingAddress(true);
    try {
      const allResults: NominatimPlace[] = [];
      for (const query of buildBakuAddressQueries(trimmedAddress)) {
        if (allResults.length > 0) break;
        const params = new URLSearchParams({ q: query });
        try {
          const response = await fetch(`/api/geocode?${params.toString()}`);
          if (!response.ok) continue;
          const results = await response.json() as NominatimPlace[];
          allResults.push(...results);
        } catch {
          // Nominatim can fail from the browser; keep trying the remaining address variants.
        }
      }

      const place = allResults
        .filter((result) => /baku|baki|bakı/i.test(result.display_name ?? ""))
        .sort((first, second) => scoreAddressPlace(second, trimmedAddress) - scoreAddressPlace(first, trimmedAddress))[0] ?? allResults[0];
      if (!place) {
        setActionToast({
          type: "error",
          title: "Address not found",
          message: "Try a more specific street, venue, or nearby landmark.",
        });
        return;
      }

      setForm((current) => ({
        ...current,
        address: place.display_name || address,
        city: place.address?.city || place.address?.town || place.address?.village || place.address?.municipality || current.city || "Baku",
        latitude: Number(Number(place.lat).toFixed(6)),
        longitude: Number(Number(place.lon).toFixed(6)),
      }));
      setFormErrors((current) => ({ ...current, address: undefined, city: undefined }));
    } catch {
      setActionToast({
        type: "error",
        title: "Could not search address",
        message: "Map search is unavailable right now. You can still pick the place on the map.",
      });
    } finally {
      setLocatingAddress(false);
    }
  }

  async function reverseGeocode(latitude: number, longitude: number) {
    try {
      const params = new URLSearchParams({
        mode: "reverse",
        lat: String(latitude),
        lon: String(longitude),
      });
      const response = await fetch(`/api/geocode?${params.toString()}`);
      if (!response.ok) return;
      const place = await response.json() as { display_name?: string; address?: { city?: string; town?: string; village?: string; municipality?: string } };
      setForm((current) => ({
        ...current,
        address: place.display_name || current.address,
        city: place.address?.city || place.address?.town || place.address?.village || place.address?.municipality || current.city || "Baku",
      }));
      setFormErrors((current) => ({ ...current, address: undefined, city: undefined }));
    } catch {
      // Coordinates are still saved even if address lookup is unavailable.
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!getAuthToken()) {
      router.push(
        "/login?warning=Please%20sign%20in%20before%20creating%20an%20activity.",
      );
      return;
    }

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setError("");
      setActionToast({
        type: "validation",
        title: "Check the highlighted fields",
        message: "Fix the first marked field, then host again.",
      });
      focusFirstInvalidField(validationErrors);
      return;
    }

    setError("");

    try {
      const created = await withUploadedMedia({
        file: imageFile,
        purpose: "EVENT_IMAGE",
        commit: (imageMediaId) =>
          createEvent({
            title: form.title.trim(),
            description: form.description.trim(),
            type: "ACTIVITY",
            category: form.category,
            city: form.city.trim(),
            address: form.address.trim(),
            latitude: form.latitude,
            longitude: form.longitude,
            startDateTime: form.startDateTime,
            endDateTime: form.endDateTime,
            isFree: form.isFree,
            price: form.isFree ? 0 : Number(form.price),
            organizerName: form.organizerName.trim(),
            imageMediaId,
            interestIds: [],
          }),
      });

      const displayCategory =
        form.category === "OTHER"
          ? customCategory.trim()
          : "";

      const createdForDisplay: EventItem = {
        ...created,
        displayCategory,
        // The backend currently returns media metadata but no public
        // delivery URL. Keep the local object URL until the next reload.
        imageUrl:
          imagePreviewUrl ||
          created.imageUrl,
      };

      setActivities((current) => [
        createdForDisplay,
        ...current,
      ]);
      setSelectedActivityId(
        createdForDisplay.id,
      );
      setShowCreateForm(false);

      setForm({
        ...createInitialForm(),
        title: "Bicycle Ride Boulevard",
        category: "SPORT",
      });
      setCustomCategory("");
      setImageFile(null);
      setImagePreviewUrl("");
      setFormErrors({});
    } catch (caught) {
      /*
       * Upload completed but event creation failed.
       * Delete the unattached media asset to avoid an orphan object.
       */
      const apiError = getApiErrorResponse(caught);
      const message = getApiErrorMessage(
        caught,
        "Could not create activity.",
      );

      if (apiError?.fieldErrors) {
        setFormErrors(apiError.fieldErrors as FormErrors);
        focusFirstInvalidField(apiError.fieldErrors as FormErrors);
      }

      setError("");
      setActionToast({
        type: "error",
        title: "Could not host activity",
        message,
      });
    }
  }

  const getLocationForActivity = (activity: EventItem) => {
    if (activity.latitude != null && activity.longitude != null) {
      return {
        latitude: activity.latitude,
        longitude: activity.longitude,
        precise: true,
      };
    }

    let hash1 = 0;
    let hash2 = 0;
    const str = activity.title + (activity.address || "");
    for (let i = 0; i < str.length; i++) {
      hash1 = str.charCodeAt(i) + ((hash1 << 5) - hash1);
      hash2 = str.charCodeAt(i) * 31 + ((hash2 << 7) - hash2);
    }
    return {
      latitude: 40.35 + Math.abs(hash2 % 800) / 10000,
      longitude: 49.79 + Math.abs(hash1 % 1300) / 10000,
      precise: false,
    };
  };

  const selectedActivity = activities.find((activity) => activity.id === selectedActivityId) ?? null;
  const selectedLocation = selectedActivity ? getLocationForActivity(selectedActivity) : { latitude: 40.3777, longitude: 49.892, precise: false };
  const selectedMapUrl = getMapUrl(selectedLocation.latitude, selectedLocation.longitude);
  const pickerLatitude = form.latitude ?? bakuCenter.latitude;
  const pickerLongitude = form.longitude ?? bakuCenter.longitude;
  const activityPreviewImage = imagePreviewUrl;

  function toggleMoreInfo(activityId: EventItem["id"]) {
    setFlippedActivityIds((current) => ({ ...current, [String(activityId)]: !current[String(activityId)] }));
  }

  function resetFilters() {
    setFilters(initialFilters);
    setFlippedActivityIds({});
    setSelectedActivityId(null);
  }

  function handleSaveDraft() {
    setActionToast({
      type: "added",
      title: "Draft kept on this page",
      message: "Your current activity details are still here while you keep editing.",
    });
  }

  function removeSelectedImage() {
    setImageFile(null);
    setImagePreviewUrl("");
  }

  function handleMapLocationChange(nextLatitude: number, nextLongitude: number) {
    setForm((current) => ({
      ...current,
      latitude: nextLatitude,
      longitude: nextLongitude,
    }));
    void reverseGeocode(nextLatitude, nextLongitude);
  }

  async function handleLoopIn(activity: EventItem) {
    if (!getAuthToken()) {
      router.push("/login?warning=Please%20sign%20in%20before%20using%20Loopin.");
      return;
    }

    const activityId = String(activity.id);
    setError("");
    setActionToast(null);
    try {
      if (loopedActivityIds[activityId]) {
        await unloopEvent(activityId);
        setLoopedActivityIds((current) => {
          const next = { ...current };
          delete next[activityId];
          saveStoredLoopedIds(next);
          return next;
        });
        setActivities((current) =>
          current.map((item) =>
            String(item.id) === activityId
              ? { ...item, loopedCount: Math.max(0, (item.loopedCount ?? 1) - 1) }
              : item,
          ),
        );
        setActionToast({
          type: "removed",
          title: "Removed from Loopin",
          message: activity.title,
        });
      } else {
        const updated = await loopInEvent(activityId);
        setLoopedActivityIds((current) => {
          const next = { ...current, [activityId]: true };
          saveStoredLoopedIds(next);
          return next;
        });
        setActivities((current) =>
          current.map((item) =>
            String(item.id) === activityId
              ? { ...item, loopedCount: updated.loopedCount ?? (item.loopedCount ?? 0) + 1 }
              : item,
          ),
        );
        setActionToast({
          type: "added",
          title: "Added to Loopin",
          message: activity.title,
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not Loopin this activity.");
    }
  }

  function openGroups(activity: EventItem) {
    router.push(`/events/${activity.id}/groups`);
  }

  return (
    <SiteShell>
      <div className="listing-page listing-page-activities">
        <PageHeader 
          title="Explore Activities" 
          subtitle="Browse casual user-created meetups, board games tables, coffee chat circles, and outdoor runs."
          action={
            <button 
              className="primary-button" 
              onClick={() => {
                if (!getAuthToken()) {
                  router.push("/login?warning=Please%20sign%20in%20before%20creating%20an%20activity.");
                  return;
                }

                setShowCreateForm(!showCreateForm);
              }}
            >
              <Plus size={16} className="create-icon" /> Create Activity
            </button>
          }
        />
        <ErrorMessage message={error} />
        {actionToast ? (
          <div className={`action-toast action-toast-${actionToast.type}`} role="status">
            <span className="action-toast-icon">
              {actionToast.type === "added" ? <CheckCircle2 size={18} /> : actionToast.type === "removed" ? <CircleMinus size={18} /> : <Info size={18} />}
            </span>
            <span>
              <strong>{actionToast.title}</strong>
              <span className="action-toast-message">{actionToast.message}</span>
            </span>
          </div>
        ) : null}

      {showCreateForm && (
        <div className="create-workspace">
          <div className="create-workspace-header">
            <div>
              <div className="create-breadcrumb">
                <span>Activities</span>
                <span>/</span>
                <strong>Create Activity</strong>
              </div>
              <h2>Create Activity</h2>
              <p>Set up a casual meetup that helps people find something to do together.</p>
            </div>
            <div className="create-header-actions">
              <button className="secondary-button" type="button" onClick={handleSaveDraft}>
                <Save size={15} /> Save Draft
              </button>
              <button className="primary-button" form="create-activity-form" type="submit">
                <Send size={15} /> Host Activity
              </button>
            </div>
          </div>

          <div className="create-workspace-grid">
            <aside className="create-step-panel" aria-label="Create activity sections">
              {createSteps.map((step, index) => (
                <a className={`create-step-link ${activeCreateStep === step.href ? "is-active" : ""}`} href={step.href} key={step.href}>
                  <span>{index + 1}</span>
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </a>
              ))}
              <div className="create-side-tip">
                <CalendarDays size={22} />
                <strong>Tip</strong>
                <span>Clear timing and a realistic meeting point make activities easier to join.</span>
              </div>
            </aside>

            <form className="create-event-form create-section-stack" id="create-activity-form" onSubmit={handleCreate}>
              <section className="create-section-card" id="activity-basic">
                <div className="create-section-heading">
                  <span><FileText size={18} /></span>
                  <div>
                    <h3>Basic Information</h3>
                    <p>Name, description, and category details.</p>
                  </div>
                </div>
                <div className="create-form-grid">
                  <label className="form-field wide-field" data-create-field="title">
                    <span>Title</span>
                    <div className="field-control-with-counter">
                      <input maxLength={120} value={form.title} onChange={(event) => updateFormField("title", event.target.value)} />
                      <strong>{form.title.length}/120</strong>
                    </div>
                    {formErrors.title ? <em>{formErrors.title}</em> : <small>Keep it simple and clear for people scanning quickly.</small>}
                  </label>
                  <label className="form-field wide-field" data-create-field="description">
                    <span>Description</span>
                    <div className="field-control-with-counter field-control-with-counter-textarea">
                      <textarea maxLength={2000} value={form.description} onChange={(event) => updateFormField("description", event.target.value)} />
                      <strong>{form.description.length}/2000</strong>
                    </div>
                    {formErrors.description ? <em>{formErrors.description}</em> : <small>Describe who should join and what will happen.</small>}
                  </label>
                  <label className="form-field">
                    <span>Category</span>
                    <select value={form.category} onChange={(event) => updateFormField("category", event.target.value as EventCategory)}>
                      {categories.map((category) => <option key={category} value={category}>{formatCategoryName(category)}</option>)}
                    </select>
                  </label>
                  {form.category === "OTHER" ? (
                    <label className="form-field" data-create-field="customCategory">
                      <span>Custom category</span>
                      <input value={customCategory} onChange={(event) => { setCustomCategory(event.target.value); setFormErrors((current) => ({ ...current, customCategory: undefined })); }} />
                      {formErrors.customCategory ? <em>{formErrors.customCategory}</em> : <small>Tell people what kind of activity this is.</small>}
                    </label>
                  ) : null}
                </div>
              </section>

              <section className="create-section-card" id="activity-time">
                <div className="create-section-heading">
                  <span><Clock size={18} /></span>
                  <div>
                    <h3>Date & Time</h3>
                    <p>Choose a start and end time that feels realistic.</p>
                  </div>
                </div>
                <div className="create-form-grid">
                  <label className="form-field" data-create-field="startDateTime">
                    <span>Start</span>
                    <input type="datetime-local" value={form.startDateTime} onChange={(event) => updateFormField("startDateTime", event.target.value)} />
                    {formErrors.startDateTime ? <em>{formErrors.startDateTime}</em> : <small>Must be at least 30 minutes from now.</small>}
                  </label>
                  <label className="form-field" data-create-field="endDateTime">
                    <span>End</span>
                    <input type="datetime-local" value={form.endDateTime} onChange={(event) => updateFormField("endDateTime", event.target.value)} />
                    {formErrors.endDateTime ? <em>{formErrors.endDateTime}</em> : <small>End time should be after the start time.</small>}
                  </label>
                </div>
              </section>

              <section className="create-section-card" id="activity-location">
                <div className="create-section-heading">
                  <span><MapPin size={18} /></span>
                  <div>
                    <h3>Location</h3>
                    <p>Search an address or click on the map to place the marker.</p>
                  </div>
                </div>
                <div className="create-form-grid">
                  <label className="form-field address-field" data-create-field="address">
                    <span>Address</span>
                    <div className="address-input-row">
                      <input
                        value={form.address}
                        onBlur={() => void geocodeAddress()}
                        onChange={(event) => updateFormField("address", event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          void geocodeAddress();
                        }}
                      />
                      <button type="button" onClick={() => void geocodeAddress()} aria-label="Find address on map">
                        <Search size={16} />
                      </button>
                    </div>
                    {formErrors.address ? <em>{formErrors.address}</em> : <small>{locatingAddress ? "Finding this address on the map..." : "Click on the map or search an address to place the marker."}</small>}
                  </label>
                </div>
                <div className="location-picker-panel">
                  <div className="location-picker-copy">
                    <strong>Activity map</strong>
                    <span>Selected: {form.address || "No address selected yet"}</span>
                  </div>
                  <LocationPickerMap
                    latitude={pickerLatitude}
                    longitude={pickerLongitude}
                    label="Pick activity location"
                    onChange={handleMapLocationChange}
                  />
                </div>
              </section>

              <section className="create-section-card" id="activity-image">
                <div className="create-section-heading">
                  <span><ImagePlus size={18} /></span>
                  <div>
                    <h3>Activity Image</h3>
                    <p>Upload a JPEG, PNG or WebP cover image.</p>
                  </div>
                </div>
                <div className="image-upload-panel image-upload-panel-large">
                  <div className="image-upload-preview">
                    {activityPreviewImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={activityPreviewImage} alt="Activity preview" />
                      </>
                    ) : (
                      <ImagePlus size={28} />
                    )}
                  </div>
                  <div className="image-upload-body">
                    <strong>{imageFile ? imageFile.name : "Cover image"}</strong>
                    <span>The image is uploaded first and attached to the Activity by media ID.</span>
                    <div className="image-upload-actions">
                      <label className="upload-button">
                        <ImagePlus size={16} /> Choose image
                        <input
                          accept="image/jpeg,image/png,image/webp"
                          type="file"
                          onChange={(changeEvent) => {
                            const file = changeEvent.target.files?.[0] ?? null;
                            if (imagePreviewUrl) {
                              URL.revokeObjectURL(imagePreviewUrl);
                            }
                            setImageFile(file);
                            setImagePreviewUrl(
                              file ? URL.createObjectURL(file) : "",
                            );
                          }}
                        />
                      </label>
                      {activityPreviewImage ? (
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={removeSelectedImage}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="create-section-card" id="activity-details">
                <div className="create-section-heading">
                  <span><Ticket size={18} /></span>
                  <div>
                    <h3>Additional Info</h3>
                    <p>Set organizer details and choose whether the activity is free or paid.</p>
                  </div>
                </div>
                <div className="create-form-grid">
                  <label className="form-field" data-create-field="organizerName">
                    <span>Organizer</span>
                    <input value={form.organizerName} onChange={(event) => updateFormField("organizerName", event.target.value)} />
                    {formErrors.organizerName ? <em>{formErrors.organizerName}</em> : <small>This can be your name, team, or community.</small>}
                  </label>
                </div>
                <div className="pricing-card">
                  <button className={`price-toggle ${form.isFree ? "active" : ""}`} type="button" onClick={() => updateFormField("isFree", true)}>
                    <Ticket size={16} /> Free activity
                  </button>
                  <button className={`price-toggle ${!form.isFree ? "active" : ""}`} type="button" onClick={() => updateFormField("isFree", false)}>
                    <Ticket size={16} /> Paid activity
                  </button>
                  {!form.isFree ? (
                    <label className="form-field price-field" data-create-field="price">
                      <span>Price</span>
                      <input type="number" min="1" value={String(form.price)} onChange={(event) => updateFormField("price", Number(event.target.value))} />
                      {formErrors.price ? <em>{formErrors.price}</em> : null}
                    </label>
                  ) : null}
                </div>
              </section>

              <section className="create-section-card create-review-card" id="activity-review">
                <div className="create-section-heading">
                  <span><CheckCircle2 size={18} /></span>
                  <div>
                    <h3>Review</h3>
                    <p>Make sure everything looks right before hosting.</p>
                  </div>
                </div>
                <div className="create-review-grid">
                  <span><strong>{form.isFree ? "Free activity" : `${form.price || 0} AZN`}</strong><small>Price</small></span>
                  <span><strong>{formatCategoryName(form.category)}</strong><small>Category</small></span>
                  <span><strong>{form.address || "Address missing"}</strong><small>Address</small></span>
                </div>
                <div className="create-form-actions">
                  <button className="secondary-button" type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                  <button className="secondary-button" type="button" onClick={handleSaveDraft}><Save size={15} /> Save Draft</button>
                  <button className="primary-button" type="submit"><Send size={15} /> Host Activity</button>
                </div>
              </section>
            </form>
          </div>
        </div>
      )}

      <div className={`split-view-container listing-layout-clean ${selectedActivity ? "is-map-open" : ""}`}>
        <div className="listing-results">
          <div className="listing-filter-bar">
            <Input label="Search" value={filters.search} onChange={(search) => setFilters((c) => ({ ...c, search }))} />
            <Input label="City" value={filters.city} onChange={(city) => setFilters((c) => ({ ...c, city }))} />
            <Select label="Category" value={filters.category} options={["", ...categories]} onChange={(category) => setFilters((c) => ({ ...c, category }))} />
            <Select label="Price" value={filters.isFree} options={["", "true", "false"]} onChange={(isFree) => setFilters((c) => ({ ...c, isFree }))} />
          </div>
          <div className="filter-summary-strip">
            <span>{activities.length} activities</span>
            <strong>{filters.category ? formatCategoryName(filters.category) : "All categories"}</strong>
            <em>{filters.isFree === "true" ? "Free only" : filters.isFree === "false" ? "Paid only" : "Any price"}</em>
            <button className="small-action sync-action" onClick={resetFilters}>
              <RefreshCw size={15} /> {loading ? "Syncing..." : "Reset"}
            </button>
          </div>

          <div className="listing-card-list">
            {activities.length ? activities.map((activity) => {
              const isSelected = selectedActivityId === activity.id;
              const isFlipped = Boolean(flippedActivityIds[String(activity.id)]);

              const activityId = String(activity.id);
              const isLooped = Boolean(loopedActivityIds[activityId]);

              return (
                <div className="event-card-stack" key={activity.id}>
                  <article 
                    className={`event-card event-card-flip ${isSelected ? "event-card-active" : ""} ${isFlipped ? "is-flipped" : ""}`}
                    onClick={() => setSelectedActivityId((current) => current === activity.id ? null : activity.id)}
                  >
                    <div className="event-card-inner">
                      <div className="event-card-face event-card-front">
                        <div
                          className={`event-poster poster-orange ${activity.imageUrl ? "event-poster-image" : ""}`}
                          style={activity.imageUrl ? { backgroundImage: `url(${activity.imageUrl})` } : undefined}
                        >
                          {!activity.imageUrl ? <CalendarDays size={20} /> : null}
                          <span>{getDisplayCategory(activity)}</span>
                        </div>
                        <div className="event-card-body">
                          <div>
                            <p>{new Date(activity.startDateTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <h3>{activity.title}</h3>
                          </div>
                          <div className="event-meta-row"><MapPin size={13} /> {activity.address || activity.city}</div>
                          <div className="event-card-stats">
                            <div className="event-price-pill">{activity.isFree ? "Free" : `${activity.price} AZN`}</div>
                            <div className="event-looped-count"><Users size={13} /> {activity.loopedCount ?? 0} looped</div>
                          </div>
                          <div className="event-card-actions">
                            <button
                              className={`loopin-button ${isLooped ? "is-looped" : ""}`}
                              type="button"
                              onClick={(clickEvent) => { clickEvent.stopPropagation(); void handleLoopIn(activity); }}
                            >
                              <Users size={14} /> {isLooped ? "Looped" : "Loopin"}
                            </button>
                            {isLooped ? (
                              <button
                                className="groups-button"
                                type="button"
                                onClick={(clickEvent) => { clickEvent.stopPropagation(); openGroups(activity); }}
                              >
                                <Users size={14} /> Groups
                              </button>
                            ) : null}
                            <button className="more-info-button" type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); toggleMoreInfo(activity.id); }}>
                              <Info size={14} /> More info
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="event-card-face event-card-back">
                        <button className="card-back-button" type="button" onClick={(clickEvent) => { clickEvent.stopPropagation(); toggleMoreInfo(activity.id); }}>
                          <ArrowLeft size={14} /> Back
                        </button>
                        <div className="event-back-main">
                          <div className="event-back-copy">
                            <strong>{activity.title}</strong>
                            <p>{activity.description || "No description added yet."}</p>
                          </div>
                          <div className="event-back-details">
                            <span><CalendarDays size={13} /> {new Date(activity.startDateTime).toLocaleString()} - {new Date(activity.endDateTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                            <span><MapPin size={13} /> {activity.address || activity.city}</span>
                          </div>
                        </div>
                        <div className="event-back-footer">
                          <div className="detail-chip-row">
                            <span>{activity.isFree ? "Free" : `${activity.price} AZN`}</span>
                            <span>{getDisplayCategory(activity)}</span>
                            <span>{activity.organizerName}</span>
                          </div>
                          <div className="event-card-actions event-back-actions">
                            <button
                              className={`loopin-button ${isLooped ? "is-looped" : ""}`}
                              type="button"
                              onClick={(clickEvent) => { clickEvent.stopPropagation(); void handleLoopIn(activity); }}
                            >
                              <Users size={14} /> {isLooped ? "Looped" : "Loopin"}
                            </button>
                            {isLooped ? (
                              <button
                                className="groups-button"
                                type="button"
                                onClick={(clickEvent) => { clickEvent.stopPropagation(); openGroups(activity); }}
                              >
                                <Users size={14} /> Groups
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            }) : <EmptyState>No activities matched your filters.</EmptyState>}
          </div>

          {pageData && pageData.totalPages > 1 ? (
            <nav
              className="mt-5 flex items-center justify-between gap-3"
              aria-label="Activity pages"
            >
              <span className="text-sm text-[var(--muted)]">
                Page {pageData.number + 1} of {pageData.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={pageData.first || loading}
                  onClick={() => void loadActivities(currentPage - 1)}
                >
                  Previous
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={pageData.last || loading}
                  onClick={() => void loadActivities(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </div>

        {selectedActivity && (
          <div className="split-view-map listing-map-panel">
            <div className="map-panel-header">
              <span>Baku Activity Map</span>
              <em>Location focused</em>
            </div>
            <div className="map-stage">
              <iframe
                className="real-map-frame"
                key={`${selectedLocation.latitude}-${selectedLocation.longitude}`}
                src={selectedMapUrl}
                title={`${selectedActivity.title} map`}
              />
              <div className="selected-location-card">
                <span><Navigation size={14} /> Selected location</span>
                <strong>{selectedActivity.title}</strong>
                <p>{selectedActivity.address || selectedActivity.city}</p>
                <em>
                  {selectedLocation.precise
                    ? `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
                    : "Approximate pin from address"}
                </em>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </SiteShell>
  );
}

