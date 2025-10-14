/**
 * Photo Gallery Section Component
 *
 * Auto-scrolling carousel displaying hotel photos with:
 * - Automatic horizontal scrolling
 * - Pause on hover/touch
 * - Rounded image cards
 * - "Photo Gallery" title with blue accent
 * - Data from database (hotel_settings.images_url)
 */

import { useRef, useEffect } from "react";
import { useHotelSettings } from "../../../../../hooks/queries/useHotelSettings";

interface PhotoGalleryItem {
  id: string;
  imageUrl: string;
  title: string;
}

interface PhotoGallerySectionProps {
  hotelId: string;
}

export const PhotoGallerySection = ({ hotelId }: PhotoGallerySectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const scrollPositionRef = useRef(0);
  const isPausedRef = useRef(false);
  const lastTimestampRef = useRef<number>();

  console.log("🖼️ [PhotoGallery] Component rendered with hotelId:", hotelId);

  // Fetch hotel settings from database
  const { data: settings, isLoading, error } = useHotelSettings(hotelId);

  console.log("🖼️ [PhotoGallery] Settings loading state:", isLoading);
  console.log("🖼️ [PhotoGallery] Settings data:", settings);
  console.log("🖼️ [PhotoGallery] Settings error:", error);

  // Find the photo gallery setting
  const gallerySetting = settings?.find(
    (s) => s.setting_key === "hotelPhotoGallery"
  );

  console.log("🖼️ [PhotoGallery] Gallery setting found:", gallerySetting);
  console.log(
    "🖼️ [PhotoGallery] images_url value:",
    gallerySetting?.images_url
  );

  // Parse images_url field (can be JSON array or comma-separated string)
  const parseImageUrls = (imagesUrl: string | null): string[] => {
    console.log("🖼️ [PhotoGallery] Parsing images_url:", imagesUrl);
    console.log("🖼️ [PhotoGallery] Type of images_url:", typeof imagesUrl);

    if (!imagesUrl) {
      console.log(
        "🖼️ [PhotoGallery] No images_url provided, returning empty array"
      );
      return [];
    }

    // If it's already an array (shouldn't happen, but just in case)
    if (Array.isArray(imagesUrl)) {
      console.log(
        "🖼️ [PhotoGallery] images_url is already an array:",
        imagesUrl
      );
      return imagesUrl.filter((url) => typeof url === "string" && url.trim());
    }

    // If it's a string, try to parse it
    if (typeof imagesUrl === "string") {
      try {
        // Try parsing as JSON array first
        const parsed = JSON.parse(imagesUrl);
        console.log("🖼️ [PhotoGallery] JSON parsed successfully:", parsed);
        console.log(
          "🖼️ [PhotoGallery] Parsed type:",
          typeof parsed,
          "Is array:",
          Array.isArray(parsed)
        );

        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (url) => typeof url === "string" && url.trim()
          );
          console.log("🖼️ [PhotoGallery] Filtered JSON array:", filtered);
          return filtered;
        }
      } catch (error) {
        console.log(
          "🖼️ [PhotoGallery] JSON parse failed, trying comma-separated:",
          error
        );
        // If not JSON, try comma-separated string
        const urls = imagesUrl
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean);
        console.log("🖼️ [PhotoGallery] Comma-separated URLs:", urls);
        if (urls.length > 0) return urls;
      }
    }

    console.log("🖼️ [PhotoGallery] No valid URLs found, returning empty array");
    return [];
  };

  const imageUrls = parseImageUrls(gallerySetting?.images_url || null);
  console.log("🖼️ [PhotoGallery] Final imageUrls:", imageUrls);

  // Fallback demo images if database is empty
  const defaultImages = [
    "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&h=400&fit=crop",
  ];

  // Use demo images if no images in database
  const finalImageUrls = imageUrls.length > 0 ? imageUrls : defaultImages;

  console.log(
    "🖼️ [PhotoGallery] Using",
    imageUrls.length > 0 ? "database" : "demo",
    "images:",
    finalImageUrls
  );

  // Convert URLs to photo items
  const photos: PhotoGalleryItem[] = finalImageUrls.map((url, index) => ({
    id: `photo-${index}`,
    imageUrl: url,
    title: `Hotel Photo ${index + 1}`,
  }));

  console.log("🖼️ [PhotoGallery] Generated photos array:", photos);
  console.log("🖼️ [PhotoGallery] Photos count:", photos.length);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || photos.length === 0 || isLoading) return;

    // Animation speed (pixels per millisecond)
    const SCROLL_SPEED = 0.15;

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (!isPausedRef.current && container) {
        // Calculate scroll distance based on time elapsed
        const scrollDistance = SCROLL_SPEED * deltaTime;
        scrollPositionRef.current += scrollDistance;

        // Get the width of content to determine when to loop
        const scrollWidth = container.scrollWidth;
        const containerWidth = container.clientWidth;
        const maxScroll = (scrollWidth - containerWidth) / 2;

        // Reset position for seamless loop
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0;
        }

        container.scrollLeft = scrollPositionRef.current;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [photos.length, isLoading]);

  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
  };

  const handleTouchEnd = () => {
    isPausedRef.current = false;
  };

  // Loading state
  if (isLoading) {
    console.log("🖼️ [PhotoGallery] Rendering loading state");
    return (
      <div className="mt-8">
        <div className="px-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Photo <span className="text-blue-600">Gallery</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Discover our beautiful spaces and amenities
          </p>
        </div>
        <div className="px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // Don't render if no photos
  if (photos.length === 0) {
    console.log(
      "🖼️ [PhotoGallery] No photos found, returning null (component hidden)"
    );
    return null;
  }

  console.log(
    "🖼️ [PhotoGallery] Rendering gallery with",
    photos.length,
    "photos"
  );

  // Duplicate photos for seamless scrolling
  const duplicatedPhotos = [...photos, ...photos];

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Photo <span className="text-blue-600">Gallery</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Discover our beautiful spaces and amenities
        </p>
      </div>

      {/* Scrolling Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-hidden scrollbar-hide px-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {duplicatedPhotos.map((photo, index) => (
          <div
            key={`${photo.id}-${index}`}
            className="flex-shrink-0 w-[280px] h-[200px] rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
