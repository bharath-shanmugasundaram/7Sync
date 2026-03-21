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
            <span style={{ color: "#1971c2" }}>7</span>sync
          </span>
        </div>
      }
      styles={{
        header: {
          borderBottom: "1px solid #e2e8f0",
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
            fontSize: 14,
            color: "#64748b",
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
              borderColor: "#e2e8f0",
              "&:focus": {
                borderColor: "#1971c2",
              },
            },
          }}
        />
        <Button
          fullWidth
          size="md"
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            background: name.trim() ? "#1971c2" : undefined,
            fontWeight: 600,
          }}
        >
          Join Room
        </Button>
      </div>
    </Modal>
  );
};
