import React, { useState, useCallback } from "react";
import {
  Button,
  Modal,
  TextInput,
  Switch,
  Text,
  Divider,
} from "@mantine/core";
import { getCurrentSettings, updateSettings } from "./LocalSettings";
import { Socket } from "socket.io-client";
import {
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import styles from "./Settings.module.css";

const roomTitleMaxCharLength = 50;
const roomDescriptionMaxCharLength = 120;

interface SettingsModalProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  roomLock: string;
  setRoomLock: (lock: boolean) => Promise<void>;
  socket: Socket;
  roomId: string;
  owner: string | undefined;
  setOwner: (owner: string) => void;
  vanity: string | undefined;
  setVanity: (vanity: string) => void;
  inviteLink: string;
  password: string | undefined;
  setPassword: (password: string) => void;
  isChatDisabled: boolean;
  setIsChatDisabled: (disabled: boolean) => void;
  clearChat: () => void;
  roomTitle: string | undefined;
  setRoomTitle: (title: string) => void;
  roomDescription: string | undefined;
  setRoomDescription: (desc: string) => void;
  roomTitleColor: string | undefined;
  setRoomTitleColor: (color: string) => void;
  mediaPath: string | undefined;
  setMediaPath: (path: string) => void;
}

export const SettingsModal = ({
  modalOpen,
  setModalOpen,
  roomLock,
  setRoomLock,
  socket,
  password,
  setPassword,
  isChatDisabled,
  setIsChatDisabled,
  clearChat,
  roomTitle,
  roomDescription,
  mediaPath,
  setMediaPath,
}: SettingsModalProps) => {
  const [updateTS, setUpdateTS] = useState(0);
  const [adminSettingsChanged, setAdminSettingsChanged] = useState(false);
  const [roomTitleInput, setRoomTitleInput] = useState<string | undefined>(
    undefined,
  );
  const [roomDescriptionInput, setRoomDescriptionInput] = useState<
    string | undefined
  >(undefined);

  const setRoomState = useCallback(
    async (data: any) => {
      socket.emit("CMD:setRoomState", {
        ...data,
      });
    },
    [socket],
  );

  return (
    <Modal
      opened={modalOpen}
      onClose={() => setModalOpen(false)}
      centered
      title={"Settings"}
    >
      <div>
        <div className={styles.sectionHeader}>Room Settings</div>
        <SettingRow
          toggle
          name={`Lock Room`}
          description="Only the person who locked the room can control the video."
          checked={Boolean(roomLock)}
          disabled={false}
          onChange={(e) => setRoomLock(Boolean(e.currentTarget.checked))}
        />
        <SettingRow
          toggle
          name={`Disable Chat`}
          description="Prevent users from sending messages in chat."
          checked={Boolean(isChatDisabled)}
          disabled={false}
          onChange={(e) => {
            setAdminSettingsChanged(true);
            setIsChatDisabled(Boolean(e.currentTarget.checked));
          }}
        />
      </div>

      <Divider my="lg" />
      <div className={styles.sectionHeader}>Local Settings</div>
      <SettingRow
        toggle
        updateTS={updateTS}
        name="Disable chat notification sound"
        description="Don't play a sound when a chat message is sent while you're on another tab"
        checked={Boolean(getCurrentSettings().disableChatSound)}
        disabled={false}
        onChange={(e) => {
          updateSettings(
            JSON.stringify({
              ...getCurrentSettings(),
              disableChatSound: e.currentTarget.checked,
            }),
          );
          setUpdateTS(Date.now());
        }}
      />

      <Divider my="lg" />
      <div className={styles.sectionHeader}>Room Customization</div>
      <SettingRow
        content={
          <TextInput
            label={`Set Room Password`}
            description="Users must know this password to join."
            value={password ?? ""}
            placeholder="Password"
            onChange={(e) => {
              setAdminSettingsChanged(true);
              setPassword(e.target.value);
            }}
          />
        }
        disabled={false}
      />
      <SettingRow
        content={
          <TextInput
            label={`Set Room Media Source`}
            description="Set a media source URL to replace the default examples"
            placeholder="YouTube playlist or link to text list of URLs"
            value={mediaPath ?? ""}
            onChange={(e) => {
              setAdminSettingsChanged(true);
              setMediaPath(e.target.value);
            }}
          />
        }
        disabled={false}
      />
      <SettingRow
        content={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "4px" }}
          >
            <TextInput
              label={`Room Title`}
              value={roomTitleInput ?? roomTitle ?? ""}
              maxLength={roomTitleMaxCharLength}
              onChange={(e) => {
                setAdminSettingsChanged(true);
                setRoomTitleInput(e.target.value);
              }}
              placeholder={`Title (max. ${roomTitleMaxCharLength} characters)`}
            />
            <TextInput
              label="Room Description"
              value={roomDescriptionInput ?? roomDescription ?? ""}
              maxLength={roomDescriptionMaxCharLength}
              onChange={(e: any) => {
                setAdminSettingsChanged(true);
                setRoomDescriptionInput(e.target.value);
              }}
              placeholder={`Description (max. ${roomDescriptionMaxCharLength} characters)`}
            />
          </div>
        }
        disabled={false}
      />
      <SettingRow
        disabled={false}
        content={
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Button color="red" size="compact-sm" onClick={() => clearChat()} leftSection={<IconTrash size={14} />}>
              Clear Chat
            </Button>
            <Text size="xs" c="grey">
              Delete all existing chat messages
            </Text>
          </div>
        }
      />
      <Button
        style={{ marginTop: "8px" }}
        disabled={!adminSettingsChanged}
        onClick={() => {
          setRoomState({
            password: password,
            isChatDisabled: isChatDisabled,
            roomTitle: roomTitleInput ?? roomTitle,
            roomDescription: roomDescriptionInput ?? roomDescription,
            mediaPath: mediaPath,
          });
          setAdminSettingsChanged(false);
        }}
        leftSection={<IconDeviceFloppy />}
      >
        Save Settings
      </Button>
    </Modal>
  );
};

const SettingRow = ({
  name,
  description,
  checked,
  disabled,
  onChange,
  content,
  toggle,
}: {
  name?: string;
  description?: React.ReactNode;
  checked?: boolean;
  disabled: boolean;
  updateTS?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  content?: React.ReactNode;
  toggle?: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: "4px",
        width: "100%",
      }}
    >
      <div>
        {toggle && (
          <Switch
            label={name}
            description={description}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
          />
        )}
        {content}
      </div>
    </div>
  );
};
