"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Share, 
  Edit3, 
  Calendar, 
  Users, 
  Award,
  ChevronRight,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { SiteShell } from "@/app/site";
import { toEventItem } from "@/lib/api";

import { useProfile } from "@/hooks/useProfile";
import { useMyLoopedEvents, useEvents } from "@/hooks/useEvents";
import { useBadges } from "@/hooks/useBadges";
import { useMyGroups } from "@/hooks/useGroups";  
import { getBadgeUI } from "@/lib/data/badge-catalog";
import { BadgeIcon } from "@/components/profile/badges/BadgeIcon";

// Animation Variants
const containerVariants = {
  hidden: { },
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 }
};

const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-[var(--line)] rounded-[20px] opacity-20 ${className}`} />
);

export default function CompleteProfilePage() {
  const { data: userData, isPending: userPending, isError: userError } = useProfile();
  const { data: upcomingEvents, isPending: eventsPending, isError: eventsError } = useMyLoopedEvents();
  const { data: allEvents, isPending: suggEventsPending } = useEvents();
  const { data: myBadges, isPending: badgesPending, isError: badgesError } = useBadges();
  const { data: myGroups = [], isPending: groupsPending, isError: groupsError, } = useMyGroups();

  const user = userData?.user;
  const profile = userData?.profile;

  const activeGroups = useMemo(
  () =>
    myGroups.filter(
      (group) =>
        group.status === "OPEN" ||
        group.status === "FULL",
    ),
  [myGroups],
);

  // Suggested events derived from general events endpoint
  const suggestedEvents = allEvents?.content ? allEvents.content.slice(0, 3) : [];

  const loopedEventsList = useMemo(() => {
    return (upcomingEvents?.content || [])
      .filter((item) => item.event)
      .map((item) => ({
        ...toEventItem(item.event!),
        loopedCount: item.loopedCount ?? 0,
      }));
  }, [upcomingEvents]);

  // Derive initial/display name
  const displayName = user?.name || profile?.name || "Anonymous User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
  const location = profile?.city || "Unknown Location";

  const avatarUrl = profile?.avatar?.url;

  // Dynamic Profile Completion
  const { completionPercentage, missingFields } = useMemo(() => {
    if (!profile) return { completionPercentage: 0, missingFields: [] };
    const fields = [
      { name: "bio", label: "Write a short bio", complete: !!profile.bio },
      { name: "city", label: "Add your city", complete: !!profile.city },
      { name: "interests", label: "Complete your interests", complete: !!(profile.interests && profile.interests.length > 0) },
      { name: "name", label: "Set your full name", complete: !!profile.name },
    ];
    
    const completed = fields.filter(f => f.complete).length;
    return {
      completionPercentage: Math.round((completed / fields.length) * 100),
      missingFields: fields
    };
  }, [profile]);

  if (userPending) {
    return (
      <SiteShell>
        <div className="min-h-[70vh] flex items-center justify-center text-[var(--muted)]">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            Loading your dashboard...
          </motion.div>
        </div>
      </SiteShell>
    );
  }

  if (userError) {
    return (
      <SiteShell>
        <div className="min-h-[70vh] flex flex-col gap-4 items-center justify-center text-red-400">
          <AlertCircle size={48} className="opacity-50" />
          <p>Failed to load profile. Please try again later.</p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="pb-24 selection:bg-[var(--color-coral)]/30 relative">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-accent)]/15 via-transparent to-transparent pointer-events-none -z-10" />

        <motion.div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
          
          {/* SECTION 1 — PROFILE HERO */}
          <motion.section variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-[24px] bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-coral)] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-[var(--color-accent)]/20 border border-white/10 overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-1">{displayName}</h1>
                <p className="text-[var(--muted)] text-sm font-medium mb-3">{user?.role === "ADMIN" ? "Administrator" : "Member"}</p>
                
                <div className="flex items-center gap-4 text-sm text-[var(--muted)] mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[var(--color-coral)]" />
                    <span>{location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]/70 flex-wrap">
                  {profile?.interests?.map((interest, idx) => (
                    <React.Fragment key={interest.id}>
                      <span>{interest.name}</span>
                      {idx < profile.interests!.length - 1 && <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />}
                    </React.Fragment>
                  ))}
                  {(!profile?.interests || profile.interests.length === 0) && (
                    <span className="text-[var(--muted)] opacity-70">No interests added</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <Link href="/profile/edit">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-[16px] bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-ink)_9%,transparent)] border border-[var(--line)] text-[var(--color-ink)] text-sm font-semibold transition-colors duration-200">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </Link>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-[16px] bg-[var(--color-coral)] hover:opacity-90 text-white text-sm font-semibold shadow-lg shadow-[var(--color-coral)]/20 transition-all duration-200 hover:-translate-y-0.5">
                <Share size={16} />
                Share
              </button>
            </div>
          </motion.section>

          {/* SECTION 2 — QUICK STATS */}
          <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { label: "Events Joined", value: upcomingEvents?.totalElements ?? 0, icon: Calendar, pending: eventsPending },
              { label: "Active Groups", value: activeGroups.length, icon: Users, pending: groupsPending, },
              { label: "Badges Earned", value: myBadges?.length ?? 0, icon: Award, pending: badgesPending },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -2, scale: 1.02 }}
                className="group flex flex-col p-5 rounded-[20px] bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--color-accent)]/50 transition-all duration-300 relative overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/0 to-[var(--color-coral)]/0 group-hover:from-[var(--color-accent)]/5 group-hover:to-[var(--color-coral)]/5 transition-colors duration-500" />
                <stat.icon size={20} className="text-[var(--muted)] group-hover:text-[var(--color-coral)] transition-colors mb-4 relative z-10" />
                {stat.pending ? (
                  <SkeletonCard className="h-8 w-16 mb-1 relative z-10" />
                ) : (
                  <div className="text-2xl font-bold text-[var(--color-ink)] mb-1 relative z-10">{stat.value}</div>
                )}
                <div className="text-xs font-medium text-[var(--muted)] relative z-10">{stat.label}</div>
              </motion.div>
            ))}
          </motion.section>

          {/* SECTION 3 — MAIN DASHBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-8">
              
              {/* Upcoming Events */}
              <motion.section variants={itemVariants}>
                <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar size={14} /> Upcoming Events
                </h2>
                
                {eventsPending && (
                  <div className="flex flex-col gap-3">
                    <SkeletonCard className="h-24 w-full" />
                    <SkeletonCard className="h-24 w-full" />
                  </div>
                )}
                
                {eventsError && (
                  <div className="p-6 rounded-[20px] border border-red-500/20 bg-red-500/5 text-sm text-red-500">
                    Unable to load upcoming events.
                  </div>
                )}

                {loopedEventsList.length === 0 && (
                  <div className="p-8 rounded-[20px] border border-[var(--line)] border-dashed bg-[var(--panel)] text-center text-[var(--muted)] text-sm">
                    No upcoming events yet. <Link href="/events" className="text-[var(--color-coral)] hover:underline">Explore events to join one!</Link>
                  </div>
                )}

                {loopedEventsList.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {loopedEventsList.map((event) => {
                      const dateObj = new Date(event.startDateTime || new Date().toISOString());
                      const month = dateObj.toLocaleString('en-US', { month: 'short' });
                      const day = dateObj.getDate();
                      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <motion.div 
                          key={event.id}
                          whileHover={{ scale: 1.01 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[20px] bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--color-coral)]/50 transition-colors gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-[14px] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex flex-col items-center justify-center text-[var(--color-coral)] shrink-0">
                              <span className="text-[10px] font-bold uppercase">{month}</span>
                              <span className="text-lg font-black leading-none mt-0.5">{day}</span>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-[var(--color-coral)] mb-1">{time} • {event.city || "Online"}</div>
                              <h3 className="text-base font-bold text-[var(--color-ink)]">{event.title}</h3>
                              <div className="text-xs text-[var(--muted)] mt-1">{event.loopedCount || 0} Participants</div>
                            </div>
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <button className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-ink)_9%,transparent)] text-[var(--color-ink)] text-sm font-semibold transition-colors self-start sm:self-auto shrink-0 border border-[var(--line)]">
                              View Event <ArrowRight size={14} />
                            </button>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.section>

              {/* My Groups */}
              <motion.section
                id="groups"
                variants={itemVariants}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--muted)]">
                    <Users size={14} />
                    My Groups
                  </h2>

                  {!groupsPending && myGroups.length > 0 && (
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      {myGroups.length} total
                    </span>
                  )}
                </div>

                {groupsPending && (
                  <div className="flex flex-col gap-3">
                    <SkeletonCard className="h-28 w-full" />
                    <SkeletonCard className="h-28 w-full" />
                  </div>
                )}

                {groupsError && (
                  <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-500">
                    Unable to load your groups.
                  </div>
                )}

                {!groupsPending &&
                  !groupsError &&
                  myGroups.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--line)] bg-[var(--panel)] p-8 text-center">
                      <Users
                        size={32}
                        className="mb-3 text-[var(--muted)]/50"
                      />

                      <h3 className="mb-1 font-bold text-[var(--color-ink)]">
                        No groups yet
                      </h3>

                      <p className="max-w-sm text-sm text-[var(--muted)]">
                        You have not joined any event groups yet.
                        Explore an event and request to join a group.
                      </p>

                      <Link
                        href="/events"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-coral)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        Explore Events
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}

                {!groupsPending &&
                  !groupsError &&
                  myGroups.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {myGroups.map((group) => {
                        const isActive =
                          group.status === "OPEN" ||
                          group.status === "FULL";

                        return (
                          <Link
                            key={group.id}
                            href={
                              `/events/${group.eventId}` +
                              `/groups/${group.id}`
                            }
                            className="group rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-coral)]/50"
                          >
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10">
                                  <Users
                                    size={20}
                                    className="text-[var(--color-coral)]"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate font-bold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-coral)]">
                                    {group.title}
                                  </h3>

                                  <p className="mt-1 text-xs text-[var(--muted)]">
                                    {group.memberCount} /{" "}
                                    {group.maxMembers} members
                                  </p>
                                </div>
                              </div>

                              <ChevronRight
                                size={18}
                                className="shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-coral)]"
                              />
                            </div>

                            {group.groupNote && (
                              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                                {group.groupNote}
                              </p>
                            )}

                            <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
                              <span
                                className={
                                  isActive
                                    ? "rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-coral)]"
                                    : "rounded-full bg-[var(--line)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]"
                                }
                              >
                                {group.status}
                              </span>

                              <span className="text-xs font-semibold text-[var(--muted)]">
                                View Group
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
              </motion.section>

              {/* Recent Activity (MISSING ENDPOINT) */}
              <motion.section variants={itemVariants}>
                <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock size={14} /> Recent Activity
                </h2>
                <div className="p-8 rounded-[20px] border border-[var(--line)] border-dashed bg-[var(--panel)] flex flex-col items-center justify-center text-center">
                  <Clock size={32} className="text-[var(--muted)]/50 mb-3" />
                  <h3 className="text-[var(--color-ink)] font-bold mb-1">Coming Soon</h3>
                  <p className="text-[var(--muted)] text-sm max-w-sm">Your activity feed will be available here in a future update.</p>
                </div>
              </motion.section>

              {/* About Me */}
              <motion.section variants={itemVariants}>
                <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={14} /> About Me
                </h2>
                <div className="p-6 rounded-[20px] bg-[var(--panel)] border border-[var(--line)] text-sm leading-relaxed text-[var(--color-ink)]/90 shadow-sm">
                  {profile?.bio ? (
                    <p>{profile.bio}</p>
                  ) : (
                    <p className="text-[var(--muted)] italic">No bio provided. Update your profile to tell others about yourself!</p>
                  )}
                </div>
              </motion.section>

            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-8">
              
              {/* Profile Completion */}
              <motion.section variants={itemVariants} className="p-6 rounded-[20px] bg-gradient-to-b from-[var(--color-accent)]/5 to-[var(--panel)] border border-[var(--color-accent)]/20 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--color-ink)]">Profile {completionPercentage}% Complete</h3>
                  <span className="text-xs font-black text-[var(--color-coral)]">{completionPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--line)] mb-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-coral)] rounded-full"
                  />
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {missingFields.map((field) => (
                    <label key={field.name} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        field.complete 
                          ? "border-[var(--color-coral)]/50 bg-[var(--color-coral)]/10" 
                          : "border-[var(--line)] bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)] group-hover:border-[var(--color-ink)]"
                      }`}>
                        <CheckCircle2 size={field.complete ? 14 : 12} className={field.complete ? "text-[var(--color-coral)]" : "text-[var(--color-coral)] opacity-0"} />
                      </div>
                      <span className={`transition-colors ${
                        field.complete ? "text-[var(--color-ink)] line-through opacity-50" : "text-[var(--muted)] group-hover:text-[var(--color-ink)]"
                      }`}>
                        {field.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.section>

              {/* Top Badges */}
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider flex items-center gap-2">
                    <Award size={14} /> Top Badges
                  </h2>
                  {myBadges && myBadges.length > 0 && (
                    <Link href="/profile/my-badges" className="text-xs font-semibold text-[var(--color-coral)] hover:underline flex items-center gap-1">
                      View All <ChevronRight size={12} />
                    </Link>
                  )}
                </div>

                {badgesPending && <SkeletonCard className="h-24 w-full" />}
                {badgesError && <p className="text-red-500 text-xs">Failed to load badges</p>}
                
                {myBadges?.length === 0 && (
                  <div className="p-4 rounded-[16px] border border-[var(--line)] border-dashed bg-[var(--panel)] text-center text-[var(--muted)] text-xs">
                    No badges earned yet.
                  </div>
                )}

                {myBadges && myBadges.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {myBadges.slice(0, 3).map((badgeId: string, idx: number) => {
                      const badgeUI = getBadgeUI(badgeId);
                      return (
                        <div key={idx} className="aspect-square rounded-[16px] bg-[var(--panel)] border border-[var(--line)] flex flex-col items-center justify-center gap-2 hover:border-[var(--color-coral)]/50 transition-colors cursor-pointer group shadow-sm p-2 text-center">
                          <div className="group-hover:scale-110 transition-transform">
                            <BadgeIcon iconName={badgeUI.icon} rarity={badgeUI.rarity} size={32} />
                          </div>
                          <span className="text-[10px] font-bold text-[var(--muted)] group-hover:text-[var(--color-ink)] line-clamp-2 leading-tight">{badgeUI.title}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>

              {/* Suggested Events */}
              <motion.section variants={itemVariants}>
                <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4">
                  Explore Events
                </h2>
                
                {suggEventsPending && (
                  <div className="flex flex-col gap-3">
                    <SkeletonCard className="h-20 w-full" />
                    <SkeletonCard className="h-20 w-full" />
                  </div>
                )}

                {suggestedEvents?.length === 0 && (
                  <p className="text-xs text-[var(--muted)]">No events available right now.</p>
                )}

                {suggestedEvents && suggestedEvents.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {suggestedEvents.map((event) => {
                      const dateObj = new Date(event.startDateTime || new Date().toISOString());
                      return (
                        <div key={event.id} className="p-4 rounded-[16px] bg-[var(--panel)] border border-[var(--line)] hover:border-[var(--color-coral)]/50 transition-colors group shadow-sm flex flex-col justify-between">
                          <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-coral)] transition-colors line-clamp-1">{event.title}</h4>
                          <div className="text-xs text-[var(--muted)] flex justify-between items-center mt-1">
                            <span className="line-clamp-1 mr-2">{dateObj.toLocaleDateString()} • {event.category || "General"}</span>
                            <Link href={`/events/${event.id}`}>
                              <button className="text-[var(--color-coral)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View</button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.section>

              {/* Suggested Groups (MISSING ENDPOINT) */}
              <motion.section variants={itemVariants}>
                <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4">
                  Suggested Groups
                </h2>
                
                <div className="p-4 rounded-[16px] border border-[var(--line)] border-dashed bg-[var(--panel)] text-center text-[var(--muted)] text-xs">
                  Group recommendations coming soon.
                </div>
              </motion.section>

            </div>
          </div>

        </motion.div>
      </div>
    </SiteShell>
  );
}
