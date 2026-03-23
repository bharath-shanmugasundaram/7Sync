import React, { useState, useEffect } from "react";
import { Modal, TextInput, Button, ActionIcon } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

interface NameEntryModalProps {
  isOpen: boolean;
  onSubmit: (name: string, avatarUrl: string) => void;
}

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Bear",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Rocky",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Max",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy",
];

export const NameEntryModal = ({ isOpen, onSubmit }: NameEntryModalProps) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (isOpen) {
      const savedName = window.localStorage.getItem("watchparty-username");
      const savedAvatar = window.localStorage.getItem("watchparty-avatar");
      if (savedName) setName(savedName);
      if (savedAvatar) setAvatar(savedAvatar);
      else setAvatar(PRESET_AVATARS[0]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed, avatar);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => {}}
      centered
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      size="sm"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            <span style={{ color: "var(--accent)" }}>7</span>sync
          </span>
        </div>
      }
      styles={{
        header: {
          borderBottom: "1px solid var(--border-card)",
          paddingBottom: 12,
        },
        body: {
          paddingTop: 20,
        },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Choose your avatar and enter your display name to join this room.
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Select Avatar</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {PRESET_AVATARS.map((url) => (
              <ActionIcon
                key={url}
                size={48}
                radius="xl"
                variant={avatar === url ? "filled" : "light"}
                color={avatar === url ? "blue" : "gray"}
                onClick={() => setAvatar(url)}
                style={{
                  border: avatar === url ? "2px solid #1971c2" : "2px solid transparent",
                  transition: "all 0.2s ease",
                  backgroundColor: avatar === url ? "#e7f5ff" : "#f8fafc",
                }}
              >
                <img src={url} alt="avatar" style={{ width: "36px", height: "36px", borderRadius: "50%" }} />
              </ActionIcon>
            ))}
          </div>
        </div>

        <TextInput
          placeholder="Your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          leftSection={<IconUser size={16} />}
          size="md"
          styles={{
            input: {
              borderColor: "var(--border-card)",
            },
          }}
        />
        <Button
          fullWidth
          size="md"
          color="blue"
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            fontWeight: 600,
            marginTop: "8px",
          }}
        >
          Join Room
        </Button>
      </div>
    </Modal>
  );
};
