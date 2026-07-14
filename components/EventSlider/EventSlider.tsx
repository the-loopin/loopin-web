"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, User } from "lucide-react";
import styles from "./EventSlider.module.css";

export interface EventCardItem {
  id: string | number;
  title: string;
  description: string;
  type: string; // e.g. "EVENT" or "ACTIVITY"
  category: string; // e.g. "TECH", "ART", "SOCIAL"
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startDateTime: string;
  endDateTime: string;
  isFree: boolean;
  price?: number;
  organizerName: string;
  imageUrl?: string;
  status?: string;
  interestsCount?: number;
  joinUrl?: string;
  tags?: string[];
  interests?: string[];
  coverVariant?: string;
}

export interface EventSliderProps {
  events: EventCardItem[];
  onJoin?: (event: EventCardItem) => void;
}

// Helper to format LocalDateTime strings
const formatEventDateTime = (startStr: string, endStr?: string) => {
  try {
    const start = new Date(startStr);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const startFormatted = start.toLocaleString("en-US", options);
    
    if (endStr) {
      const end = new Date(endStr);
      if (start.toDateString() === end.toDateString()) {
        const endOptions: Intl.DateTimeFormatOptions = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        };
        return `${startFormatted} - ${end.toLocaleString("en-US", endOptions)}`;
      } else {
        const endFormatted = end.toLocaleString("en-US", options);
        return `${startFormatted} to ${endFormatted}`;
      }
    }
    return startFormatted;
  } catch {
    return startStr;
  }
};

// Default interests mapping for fallback cases when interests are not explicitly provided
const DEFAULT_INTERESTS: Record<string, string[]> = {
  TECH: ["AI", "Networking", "Startups"],
  ART: ["Photography", "Design", "Fine Art"],
  SOCIAL: ["Board Games", "Coffee", "Networking"],
  OUTDOOR: ["Outdoor", "Cycling", "Hiking"],
  MUSIC: ["Concerts", "Vinyl", "Live Bands"],
  SPORT: ["Running", "Fitness", "Football"],
};

const getEventInterests = (event: EventCardItem) => {
  if (event.interests && event.interests.length > 0) {
    return event.interests;
  }
  const cat = event.category?.toUpperCase() || "";
  for (const key in DEFAULT_INTERESTS) {
    if (cat.includes(key)) {
      return DEFAULT_INTERESTS[key];
    }
  }
  return ["Networking", "Social", "Community"];
};

export const EventSlider: React.FC<EventSliderProps> = ({ events, onJoin }) => {
  const router = useRouter();
  const trackWrapperRef = useRef<HTMLDivElement | null>(null);
  const [flippedIds, setFlippedIds] = useState<Record<string | number, boolean>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsReady(true);
  }, []);

  if (!events || events.length === 0) {
    return (
      <div className={styles.emptyState}>
        No opportunities are published yet.
      </div>
    );
  }

  const goToNext = () => {
    trackWrapperRef.current?.scrollBy({ left: 380, behavior: "smooth" });
  };

  const goToPrevious = () => {
    trackWrapperRef.current?.scrollBy({ left: -380, behavior: "smooth" });
  };

  const toggleFlip = (id: string | number) => {
    setFlippedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleJoinClick = (event: EventCardItem, e: React.MouseEvent) => {
    if (onJoin) {
      e.preventDefault();
      onJoin(event);
    }
  };

  const openOpportunityPage = (event: EventCardItem, e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    router.push(event.joinUrl || (event.type === "ACTIVITY" ? "/activities" : "/events"));
  };

  const handleCardMouseMove = (id: string | number, event: React.MouseEvent<HTMLElement>) => {
    const isFlipped = !!flippedIds[id];
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const px = x / rect.width;
    const py = y / rect.height;

    // Subtle 3D tilt: max 8deg, set to 0 when flipped
    const rotateY = isFlipped ? 0 : (px - 0.5) * 8;
    const rotateX = isFlipped ? 0 : (0.5 - py) * 6;

    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
    card.style.setProperty('--rx', `${rotateX}deg`);
    card.style.setProperty('--ry', `${rotateY}deg`);
  };

  const handleCardMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    card.style.setProperty('--mx', `50%`);
    card.style.setProperty('--my', `50%`);
    card.style.setProperty('--rx', `0deg`);
    card.style.setProperty('--ry', `0deg`);
  };

  const renderCard = (event: EventCardItem, index: number, isDuplicate: boolean) => {
    const isFlipped = !!flippedIds[event.id];
    const displayDate = formatEventDateTime(event.startDateTime, event.endDateTime);
    const locationStr = `${event.city}${event.address ? `, ${event.address}` : ""}`;
    const isActivity = event.type === "ACTIVITY";
    const catColor = isActivity
      ? { text: "#ff9f4a", bg: "rgba(255, 126, 21, 0.12)", border: "rgba(255, 126, 21, 0.34)" }
      : { text: "#c58cff", bg: "rgba(182, 109, 255, 0.12)", border: "rgba(182, 109, 255, 0.34)" };

    return (
      <div
        key={`${event.id}-${isDuplicate ? "dup" : "orig"}-${index}`}
        className={`${styles.cardWrapper} ${isActivity ? styles.activityCard : styles.eventCard}`}
        data-testid={isDuplicate ? undefined : `event-card-${event.id}`}
      >
        <div 
          className={styles.cardInteractive}
          onMouseMove={(e) => handleCardMouseMove(event.id, e)}
          onMouseLeave={handleCardMouseLeave}
          onClick={(e) => openOpportunityPage(event, e)}
          role="link"
          tabIndex={0}
        >
          <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ""}`}>
            
            {/* Front Face of the Card */}
            <div className={styles.cardFront}>
              <div className={styles.imageArea}>
                <span 
                  className={styles.categoryBadge}
                  style={{
                    color: catColor.text,
                    backgroundColor: catColor.bg,
                    borderColor: catColor.border
                  }}
                >
                  {event.category}
                </span>
                
                {event.interestsCount !== undefined && event.interestsCount > 0 && (
                  <div className={styles.interestsBadge}>
                    <Heart size={11} className={styles.heartIcon} fill="var(--violet)" />
                    <span>{event.interestsCount}</span>
                  </div>
                )}

                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className={styles.image}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.fallbackGradient}>
                    <div className={styles.fallbackPattern} />
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardBodyContent}>
                  <div className={styles.textGroup}>
                    <h3 className={styles.title} title={event.title}>
                      {event.title}
                    </h3>
                    
                    <div className={styles.metaInfo}>
                      <div className={styles.metaItem}>
                        <CalendarDays size={14} className={styles.metaIcon} />
                        <span>{displayDate}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={14} className={styles.metaIcon} />
                        <span className={styles.locationText}>{locationStr}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <User size={14} className={styles.metaIcon} />
                        <span>Hosted by {event.organizerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.footer}>
                    <div className={styles.priceGroup}>
                      <span className={styles.priceLabel}>Admission</span>
                      <span 
                        className={styles.priceValue}
                      >
                        {event.isFree ? "Free" : `$${event.price || 0}`}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      className={styles.moreInfoBtn}
                      onClick={() => toggleFlip(event.id)}
                      aria-label={`View more information for ${event.title}`}
                    >
                      More info
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Face of the Card */}
            <div className={styles.cardBack}>
              <div className={styles.cardBackContent}>
                <div className={styles.backMainContent}>
                  <h4 className={styles.interestsHeading}>Interests</h4>
                  <div className={styles.backInterestsList}>
                    {getEventInterests(event).map((interest, i) => (
                      <span key={i} className={styles.interestChip}>
                        {interest}
                      </span>
                    ))}
                  </div>

                  <div className={styles.detailedDescContainer}>
                    <p className={styles.detailedDescription}>
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className={styles.backActions}>
                  {event.joinUrl ? (
                    <Link
                      href={event.joinUrl}
                      className={styles.joinBtn}
                      onClick={(e) => handleJoinClick(event, e)}
                    >
                      Loopin
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={styles.joinBtn}
                      onClick={() => {
                        if (onJoin) {
                          onJoin(event);
                        } else {
                          console.log(`Joined event: ${event.title}`);
                        }
                      }}
                    >
                      Loopin
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => toggleFlip(event.id)}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.sliderContainer} ${isReady ? styles.ready : ""}`}
      id="event-slider-container"
    >
      <div className={styles.controls}>
        <button type="button" onClick={goToPrevious} aria-label="Show previous opportunity">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={goToNext} aria-label="Show next opportunity">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className={styles.trackWrapper} ref={trackWrapperRef}>
        <div className={styles.track}>
          <div className={styles.marqueeGroup}>
            {events.concat(events, events).map((event, index) => renderCard(event, index, false))}
          </div>
          <div className={styles.marqueeGroup} aria-hidden="true">
            {events.concat(events, events).map((event, index) => renderCard(event, index, true))}
          </div>
        </div>
      </div>
    </div>
  );
};
