import React, { useCallback, useContext, useState } from "react";
import {
  IconBrandYoutubeFilled,
  IconScreenShare,
  IconFileUpload,
  IconLink,
} from "@tabler/icons-react";
import { createRoom } from "../TopBar/TopBar";
import styles from "./Home.module.css";
import { MetadataContext } from "../../MetadataContext";

const features = [
  {
    Icon: IconBrandYoutubeFilled,
    title: "YouTube",
    text: "Watch videos together from YouTube in perfect sync.",
  },
  {
    Icon: IconScreenShare,
    title: "Screen Share",
    text: "Share your screen or a browser tab with everyone.",
  },
  {
    Icon: IconFileUpload,
    title: "File Upload",
    text: "Upload and stream your own video files.",
  },
  {
    Icon: IconLink,
    title: "URL Stream",
    text: "Paste a video URL for everyone to watch.",
  },
];

export const Home = () => {
  const { user } = useContext(MetadataContext);
  const [joinCode, setJoinCode] = useState("");

  const handleCreateRoom = useCallback(async () => {
    await createRoom(user, false);
  }, [user]);

  const handleJoinRoom = useCallback(() => {
    let code = joinCode.trim();
    if (!code) return;
    // Accept full URLs like https://host/watch/roomname or just the room code
    const match = code.match(/\/watch\/(.+)/);
    if (match) {
      window.location.assign("/watch/" + match[1]);
    } else {
      // Treat as raw room code
      code = code.replace(/^\/+/, "");
      window.location.assign("/watch/" + code);
    }
  }, [joinCode]);

  return (
    <div className={styles.container}>
      {/* Ambient glow */}
      <div className={styles.ambientGlow} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Watch Together.
          <br />
          <span className={styles.heroAccent}>Stay in Sync.</span>
        </h1>
        <p className={styles.heroSub}>
          No login. No download. Just share a link.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.ctaButton} onClick={handleCreateRoom}>
            <span className={styles.ctaGlow} />
            Create Room
          </button>
          <div className={styles.joinRow}>
            <input
              className={styles.joinInput}
              type="text"
              placeholder="Paste room link or code..."
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            />
            <button
              className={styles.joinButton}
              onClick={handleJoinRoom}
              disabled={!joinCode.trim()}
            >
              Join Room
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        {features.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <f.Icon size={28} className={styles.featureIcon} />
            <div className={styles.featureTitle}>{f.title}</div>
            <div className={styles.featureText}>{f.text}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How it works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepText}>Create a room</div>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepText}>Share the link</div>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepText}>Pick something to watch</div>
          </div>
          <div className={styles.stepDivider} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>✓</div>
            <div className={styles.stepText}>Enjoy together</div>
          </div>
        </div>
      </section>
    </div>
  );
};
