import React, { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Images,
  Play,
  X,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Pause,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Gallery.css";

type GalleryType = "photo" | "video";

interface GalleryItem {
  id: number;
  type: GalleryType;
  title: string;
  category: string;
  src: string;
  thumbnail?: string;
}

/* ============================================================
   CLOUDINARY GALLERY CONTENT

   Add your Cloudinary URLs here.

   PHOTO:
   src = Cloudinary image URL

   VIDEO:
   src = Cloudinary video URL
   thumbnail = Cloudinary thumbnail URL (optional)
   ============================================================ */

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    type: "photo",
    title: "STG Pre-University College",
    category: "Campus",
    src: "https://res.cloudinary.com/fbjkpbsq/image/upload/v1786524753/slide1.jpg",
  },

  {
    id: 2,
    type: "photo",
    title: "STG Campus & Main Building",
    category: "Campus",
    src: "https://res.cloudinary.com/fbjkpbsq/image/upload/v1786524806/slide2.jpg",
  },

  {
    id: 3,
    type: "photo",
    title: "Gateway to STG",
    category: "Campus",
    src: "https://res.cloudinary.com/fbjkpbsq/image/upload/v1786525026/slide3.jpg",
  },

  {
    id: 4,
    type: "photo",
    title: "Student hostel",
    category: "campus",
    src: "https://res.cloudinary.com/fbjkpbsq/image/upload/v1786525395/slide4.jpg",
  },

  {
    id: 5,
    type: "photo",
    title: "Student Hostel",
    category: "campus",
    src: "https://res.cloudinary.com/fbjkpbsq/image/upload/v1786525678/slide5.jpg",
  },

  {
    id: 6,
    type: "video",
    title: "STG College Campus",
    category: "Videos",
    src: "YOUR_CLOUDINARY_VIDEO_URL_1",
    thumbnail: "YOUR_CLOUDINARY_VIDEO_THUMBNAIL_1",
  },

  {
    id: 7,
    type: "video",
    title: "College Activities",
    category: "Videos",
    src: "YOUR_CLOUDINARY_VIDEO_URL_2",
    thumbnail: "YOUR_CLOUDINARY_VIDEO_THUMBNAIL_2",
  },
  {
    id: 8,
    type: "photo",
    title: "Parent Interaction Session",
   category: "Campus",
    src: "https://res.cloudinary.com/fbjkpbsq/image/upload/v1786525864/slide6.jpg",
   
  },

  /*
  ============================================================
  ADD MORE IMAGES / VIDEOS LIKE THIS
  ============================================================

  {
    id: 8,
    type: "photo",
    title: "Annual Day",
    category: "Events",
    src: "CLOUDINARY_URL",
  },

  {
    id: 9,
    type: "video",
    title: "Annual Day Celebration",
    category: "Videos",
    src: "CLOUDINARY_VIDEO_URL",
    thumbnail: "CLOUDINARY_THUMBNAIL_URL",
  },
  */
];

const categories = [
  "All",
  "Campus",
  "Academic",
  "Students",
  "Events",
  "Videos",
];

const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [selectedItem, setSelectedItem] =
    useState<GalleryItem | null>(null);

  const [selectedIndex, setSelectedIndex] =
    useState<number>(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(false);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  /* ============================================================
     FILTER
     ============================================================ */

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") {
      return galleryItems;
    }

    return galleryItems.filter(
      (item) => item.category === activeCategory
    );
  }, [activeCategory]);

  /* ============================================================
     OPEN ITEM
     ============================================================ */

  const openItem = (
    item: GalleryItem,
    index: number
  ) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setIsPlaying(false);
    setIsMuted(false);
  };

  /* ============================================================
     CLOSE MODAL
     ============================================================ */

  const closeModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setSelectedItem(null);
    setIsPlaying(false);
  };

  /* ============================================================
     PREVIOUS
     ============================================================ */

  const previousItem = () => {
    if (!filteredItems.length) return;

    const newIndex =
      selectedIndex === 0
        ? filteredItems.length - 1
        : selectedIndex - 1;

    setSelectedIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
    setIsPlaying(false);
    setIsMuted(false);
  };

  /* ============================================================
     NEXT
     ============================================================ */

  const nextItem = () => {
    if (!filteredItems.length) return;

    const newIndex =
      selectedIndex === filteredItems.length - 1
        ? 0
        : selectedIndex + 1;

    setSelectedIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
    setIsPlaying(false);
    setIsMuted(false);
  };

  /* ============================================================
     PLAY / PAUSE
     ============================================================ */

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  /* ============================================================
     SKIP BACK 10 SECONDS
     ============================================================ */

  const skipBack10 = () => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 10
    );
  };

  /* ============================================================
     SKIP FORWARD 10 SECONDS
     ============================================================ */

  const skipForward10 = () => {
    if (!videoRef.current) return;

    const duration =
      videoRef.current.duration;

    videoRef.current.currentTime = Math.min(
      duration || Infinity,
      videoRef.current.currentTime + 10
    );
  };

  /* ============================================================
     MUTE / UNMUTE
     ============================================================ */

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted =
      !videoRef.current.muted;

    setIsMuted(videoRef.current.muted);
  };

  /* ============================================================
     FULLSCREEN
     ============================================================ */

  const openFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.requestFullscreen();
    } catch {
      // Fullscreen not supported
    }
  };

  return (
    <main className="stg-gallery-page">

      {/* ======================================================
          BACKGROUND
          ====================================================== */}

      <div className="stg-gallery-bg-glow glow-one" />

      <div className="stg-gallery-bg-glow glow-two" />

      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="stg-gallery-hero">

        <div className="stg-gallery-hero-inner">

          <Link
            to="/"
            className="stg-gallery-back"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="stg-gallery-label">
            <Images size={16} />
            STG COLLEGE
          </div>

          <h1>
            College
            <span> Gallery</span>
          </h1>

          <p>
            Explore campus life, academic activities,
            student moments, events and memorable
            experiences at STG Pre-University College.
          </p>

          <div className="stg-gallery-hero-line">

            <span />

            <div>
              Learn&nbsp; • &nbsp;Explore&nbsp; • &nbsp;Succeed
            </div>

            <span />

          </div>

        </div>

      </section>

      {/* ======================================================
          CATEGORY FILTER
          ====================================================== */}

      <section className="stg-gallery-controls">

        <div className="stg-gallery-filter">

          {categories.map((category) => (

            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveCategory(category)
              }
            >
              {category}
            </button>

          ))}

        </div>

      </section>

      {/* ======================================================
          GALLERY GRID
          ====================================================== */}

      <section className="stg-gallery-section">

        <div className="stg-gallery-grid">

          {filteredItems.map(
            (item, index) => (

              <article
                key={item.id}
                className={`stg-gallery-card ${
                  item.type === "video"
                    ? "video-card"
                    : ""
                }`}
                onClick={() =>
                  openItem(item, index)
                }
              >

                <div className="stg-gallery-media">

                  {/* PHOTO */}

                  {item.type === "photo" ? (

                    <img
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                    />

                  ) : (

                    /* VIDEO */

                    <>
                      {item.thumbnail ? (

                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          loading="lazy"
                        />

                      ) : (

                        <video
                          src={item.src}
                          muted
                          playsInline
                          preload="metadata"
                        />

                      )}

                      <div className="stg-video-play">

                        <Play
                          size={23}
                          fill="currentColor"
                        />

                      </div>

                    </>

                  )}

                  {/* HOVER OVERLAY */}

                  <div className="stg-gallery-overlay">

                    <div className="stg-gallery-overlay-icon">

                      {item.type === "video" ? (
                        <Play size={18} />
                      ) : (
                        <ArrowUpRight size={18} />
                      )}

                    </div>

                  </div>

                  {/* TYPE */}

                  <div className="stg-gallery-type">

                    {item.type === "video"
                      ? "VIDEO"
                      : "PHOTO"}

                  </div>

                </div>

                {/* CARD CONTENT */}

                <div className="stg-gallery-card-content">

                  <div>

                    <span>
                      {item.category}
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                  </div>

                  <ArrowUpRight
                    size={17}
                    className="stg-card-arrow"
                  />

                </div>

              </article>

            )
          )}

        </div>

        {/* ====================================================
            EMPTY STATE
            ==================================================== */}

        {filteredItems.length === 0 && (

          <div className="stg-gallery-empty">

            <div>
              <Images size={28} />
            </div>

            <h3>
              Gallery Coming Soon
            </h3>

            <p>
              Photos and videos for this
              category will appear here.
            </p>

          </div>

        )}

      </section>

      {/* ======================================================
          BOTTOM CTA
          ====================================================== */}

      <section className="stg-gallery-cta">

        <div className="stg-gallery-cta-card">

          <div className="stg-gallery-cta-icon">
            <Images size={25} />
          </div>

          <div>

            <span>
              STG PRE-UNIVERSITY COLLEGE
            </span>

            <h2>
              Moments that become memories.
            </h2>

            <p>
              Explore more about our college,
              academics and student life.
            </p>

          </div>

          <Link
            to="/about"
            className="stg-gallery-cta-btn"
          >
            About College
            <ArrowUpRight size={17} />
          </Link>

        </div>

      </section>

      {/* ======================================================
          LIGHTBOX
          ====================================================== */}

      {selectedItem && (

        <div
          className="stg-gallery-lightbox"
          onClick={closeModal}
        >

          {/* CLOSE */}

          <button
            type="button"
            className="stg-lightbox-close"
            onClick={closeModal}
            aria-label="Close gallery"
          >
            <X size={22} />
          </button>

          {/* PREVIOUS */}

          {filteredItems.length > 1 && (

            <button
              type="button"
              className="stg-lightbox-nav prev"
              onClick={(event) => {
                event.stopPropagation();
                previousItem();
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={28} />
            </button>

          )}

          {/* LIGHTBOX CONTENT */}

          <div
            className="stg-lightbox-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="stg-lightbox-media">

              {/* PHOTO */}

              {selectedItem.type === "photo" ? (

                <img
                  src={selectedItem.src}
                  alt={selectedItem.title}
                />

              ) : (

                /* ==================================================
                   PREMIUM VIDEO PLAYER
                   ================================================== */

                <div className="stg-video-player">

                  <video
                    ref={videoRef}
                    src={selectedItem.src}
                    playsInline
                    onPlay={() =>
                      setIsPlaying(true)
                    }
                    onPause={() =>
                      setIsPlaying(false)
                    }
                  />

                  <div className="stg-video-controls">

                    {/* PLAY / PAUSE */}

                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={
                        isPlaying
                          ? "Pause video"
                          : "Play video"
                      }
                    >

                      {isPlaying ? (

                        <Pause size={19} />

                      ) : (

                        <Play
                          size={19}
                          fill="currentColor"
                        />

                      )}

                    </button>

                    {/* BACK 10 */}

                    <button
                      type="button"
                      onClick={skipBack10}
                      className="skip-button"
                      aria-label="Skip back 10 seconds"
                    >

                      <SkipBack size={18} />

                      <span>
                        10
                      </span>

                    </button>

                    {/* FORWARD 10 */}

                    <button
                      type="button"
                      onClick={skipForward10}
                      className="skip-button"
                      aria-label="Skip forward 10 seconds"
                    >

                      <SkipForward size={18} />

                      <span>
                        10
                      </span>

                    </button>

                    <div className="video-control-spacer" />

                    {/* MUTE */}

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={
                        isMuted
                          ? "Unmute"
                          : "Mute"
                      }
                    >

                      {isMuted ? (
                        <VolumeX size={19} />
                      ) : (
                        <Volume2 size={19} />
                      )}

                    </button>

                    {/* FULLSCREEN */}

                    <button
                      type="button"
                      onClick={openFullscreen}
                      aria-label="Fullscreen"
                    >
                      <Maximize size={19} />
                    </button>

                  </div>

                </div>

              )}

            </div>

            {/* LIGHTBOX INFO */}

            <div className="stg-lightbox-info">

              <div>

                <span>
                  {selectedItem.category}
                </span>

                <h3>
                  {selectedItem.title}
                </h3>

              </div>

              <small>
                {selectedIndex + 1} /{" "}
                {filteredItems.length}
              </small>

            </div>

          </div>

          {/* NEXT */}

          {filteredItems.length > 1 && (

            <button
              type="button"
              className="stg-lightbox-nav next"
              onClick={(event) => {
                event.stopPropagation();
                nextItem();
              }}
              aria-label="Next"
            >
              <ChevronRight size={28} />
            </button>

          )}

        </div>

      )}

    </main>
  );
};

export default Gallery;