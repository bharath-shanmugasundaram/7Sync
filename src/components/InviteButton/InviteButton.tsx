import React, { useState } from "react";
import { Button } from "@mantine/core";
import { InviteModal } from "../Modal/InviteModal";
import { IconShare2 } from "@tabler/icons-react";

export const InviteButton = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <>
      {inviteModalOpen && (
        <InviteModal closeInviteModal={() => setInviteModalOpen(false)} />
      )}
      <Button
        size="compact-md"
        color="blue"
        title="Invite friends"
        onClick={() => setInviteModalOpen(true)}
        leftSection={<IconShare2 size={14} />}
        style={{
          fontWeight: 600,
          borderRadius: 8,
          fontSize: 13,
        }}
      >
        Invite
      </Button>
    </>
  );
};
