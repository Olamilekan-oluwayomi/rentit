/*
|--------------------------------------------------------------------------
| PublicProfilePage.jsx
|--------------------------------------------------------------------------
|
| Read-only public profile for any user. Shows avatar, name, bio, rating
| summary, recent reviews, and their other active listings.
|
| Route: /users/:userId (public, no auth required)
| Entry points: Clickable avatar/name in BookingChatPage, InboxPage, Messages
| Responsibilities: Display user profile without editing controls or private fields
| Dependencies: supabase, design/Avatar/Heading/Text/Skeleton, useListings, ReviewsSection
| Notes: Uses supabase directly for profile+review fetch (no auth hook needed).
|        Listings query excludes inactive/soft-deleted ones by default.
|
|--------------------------------------------------------------------------
*/

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "../../../shared/lib/supabase";
import {
  Avatar,
  Heading,
  Text,
  Skeleton,
  AvatarSkeleton,
  CardSkeleton,
  StarRatingInput,
} from "../../../design";
import ListingCard from "../../listings/components/ListingCard";
import { useListings } from "../../listings/hooks/useListings";
import ReviewsSection from "../../reviews/components/ReviewsSection";
import { getAvatarUrl } from "../../../utils/storage";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [reviewStatsLoading, setReviewStatsLoading] = useState(true);

  const {
    listings,
    loading: listingsLoading,
    error: listingsError,
  } = useListings({ owner_id: userId, sort: "newest", limit: 12 });

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, location")
        .eq("id", userId)
        .single();

      if (error) {
        setProfileError(error.message);
      } else if (data) {
        setProfile(data);
      }
      setProfileLoading(false);
    };

    Promise.resolve().then(loadProfile);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const loadReviewStats = async () => {
      setReviewStatsLoading(true);

      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", userId);

      if (!error && data) {
        const count = data.length;
        const avg =
          count > 0
            ? (data.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
            : 0;
        setReviewStats({ avg: Number(avg), count });
      }
      setReviewStatsLoading(false);
    };

    Promise.resolve().then(loadReviewStats);
  }, [userId]);

  const avatarUrl = profile?.avatar_url
    ? getAvatarUrl(profile.avatar_url, { width: 128, height: 128 })
    : null;

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {profileLoading ? (
          <div className="flex flex-col items-center gap-4 mb-10">
            <AvatarSkeleton size="2xl" />
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-56 h-4" />
          </div>
        ) : profileError || !profile ? (
          <div className="text-center py-16">
            <Text variant="secondary">User not found.</Text>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-10">
              <Avatar
                src={avatarUrl}
                name={profile.full_name}
                size="2xl"
                className="mb-4"
              />
              <Heading as="h1" className="mb-1">
                {profile.full_name || "User"}
              </Heading>

              {profile.location && (
                <div className="flex items-center gap-1 text-sm text-text-secondary mb-2">
                  <MapPin size={14} />
                  {profile.location}
                </div>
              )}

              {profile.bio && (
                <Text variant="secondary" className="max-w-md mx-auto mb-3">
                  {profile.bio}
                </Text>
              )}

              {reviewStatsLoading ? (
                <Skeleton className="w-28 h-4" />
              ) : reviewStats.count > 0 ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <StarRatingInput value={reviewStats.avg} readOnly size="sm" />
                  <span>
                    {reviewStats.avg} ({reviewStats.count}{" "}
                    {reviewStats.count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mb-10">
              <Heading as="h2" className="mb-5">
                Listings
              </Heading>

              {listingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : listingsError ? (
                <Text variant="secondary">
                  Could not load listings.
                </Text>
              ) : listings.length === 0 ? (
                <Text variant="secondary">
                  No active listings yet.
                </Text>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <ReviewsSection
                ownerId={userId}
                ratingCount={reviewStats.count}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
