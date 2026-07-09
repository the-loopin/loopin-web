"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Heart, User } from "lucide-react";
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
  } catch (e) {
    return startStr;
  }
};

// Helper to get category color styling
const getCategoryColor = (category: string) => {
  const cat = category.toUpperCase();
  if (cat.includes("TECH")) {
    return { text: "#d946ef", bg: "rgba(217, 70, 239, 0.12)", border: "rgba(217, 70, 239, 0.25)" }; // Pink/Purple
  }
  if (cat.includes("ART")) {
    return { text: "#ff9f43", bg: "rgba(255, 159, 67, 0.12)", border: "rgba(255, 159, 67, 0.25)" }; // Orange
  }
  if (cat.includes("SOCIAL")) {
    return { text: "#a855f7", bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.25)" }; // Purple
  }
  if (cat.includes("OUTDOOR")) {
    return { text: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)" }; // Blue
  }
  return { text: "#4DFFD2", bg: "rgba(77, 255, 210, 0.12)", border: "rgba(77, 255, 210, 0.25)" }; // Default Mint
};

export const EventSlider: React.FC<EventSliderProps> = ({ events, onJoin }) => {
  const [flippedIds, setFlippedIds] = useState<Record<string | number, boolean>>({});

  if (!events || events.length === 0) {
    return null;
  }

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

  const renderCard = (event: EventCardItem, index: number, isDuplicate: boolean) => {
    const isFlipped = !!flippedIds[event.id];
    const displayDate = formatEventDateTime(event.startDateTime, event.endDateTime);
    const locationStr = `${event.city}${event.address ? `, ${event.address}` : ""}`;
    const catColor = getCategoryColor(event.category);

    return (
      <div
        key={`${event.id}-${isDuplicate ? "dup" : "orig"}-${index}`}
        className={styles.cardWrapper}
        data-testid={isDuplicate ? undefined : `event-card-${event.id}`}
      >
        <div className={styles.cardInteractive}>
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

              <div className={styles.cardContent}>
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
                      style={{
                        color: event.isFree ? "#4DFFD2" : "#ff7e15"
                      }}
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

            {/* Back Face of the Card */}
            <div className={styles.cardBack}>
              <div className={styles.cardBackContent}>
                <div>
                  <div className={styles.backHeader}>
                    <h3 className={styles.backHeaderTitle}>{event.title}</h3>
                    <span 
                      className={styles.backCategoryBadge}
                      style={{
                        color: catColor.text,
                        backgroundColor: catColor.bg,
                        borderColor: catColor.border
                      }}
                    >
                      {event.category}
                    </span>
                  </div>

                  <div className={styles.backMetaList}>
                    <div className={styles.backMetaItem}>
                      <CalendarDays size={14} className={styles.backMetaIcon} />
                      <span>{displayDate}</span>
                    </div>
                    <div className={styles.backMetaItem}>
                      <MapPin size={14} className={styles.backMetaIcon} />
                      <span>{locationStr}</span>
                    </div>
                    <div className={styles.backMetaItem}>
                      <User size={14} className={styles.backMetaIcon} />
                      <span>Organizer: {event.organizerName}</span>
                    </div>
                    {event.interestsCount !== undefined && (
                      <div className={styles.backMetaItem}>
                        <Heart size={14} className={styles.backMetaIcon} fill="var(--violet)" />
                        <span>{event.interestsCount} interested members</span>
                      </div>
                    )}
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
                      Join event
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={styles.joinBtn}
                      onClick={(e) => {
                        if (onJoin) {
                          onJoin(event);
                        } else {
                          console.log(`Joined event: ${event.title}`);
                        }
                      }}
                    >
                      Join event
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
    <div className={styles.sliderContainer} id="event-slider-container">
      <div className={styles.trackWrapper}>
        <div className={styles.track}>
          <div className={styles.marqueeGroup}>
            {events.map((event, index) => renderCard(event, index, false))}
          </div>
          <div className={styles.marqueeGroup} aria-hidden="true">
            {events.map((event, index) => renderCard(event, index, true))}
          </div>
        </div>
      </div>
    </div>
  );
};
