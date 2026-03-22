import React, { useState } from "react";
import { Modal, TextInput, Button } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

interface NameEntryModalProps {
  isOpen: boolean;
  onSubmit: (name: string) => void;
}

export const NameEntryModal = ({ isOpen, onSubmit }: NameEntryModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed);
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
          Enter your display name to join this room.
          <br />
          This name will be visible to other participants.
        </div>
        <TextInput
          placeholder="Your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          leftSection={<IconUser size={16} />}
          size="md"
          autoFocus
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
          }}
        >
          Join Room
        </Button>
      </div>
    </Modal>
  );
};
