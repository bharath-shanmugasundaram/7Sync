import React, { useCallback, useContext, useEffect, useState } from "react";
import { serverPath } from "../../utils/utils";
import { ActionIcon, Button } from "@mantine/core";
import { MetadataContext } from "../../MetadataContext";
import { IconCirclePlusFilled, IconMoon, IconSun } from "@tabler/icons-react";
import styles from "./TopBar.module.css";

export async function createRoom(
  user: any,
  openNewTab: boolean | undefined,
  video: string = "",
) {
  const uid = user?.uid;
  const token = await user?.getIdToken?.();
  const response = await fetch(serverPath + "/createRoom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid,
      token,
      video,
    }),
  });
  const data = await response.json();
  const { name } = data;
  if (openNewTab) {
    window.open("/watch" + name);
  } else {
    window.location.assign("/watch" + name);
  }
}

export const NewRoomButton = (props: {
  size?: string;
  openNewTab?: boolean;
}) => {
  const context = useContext(MetadataContext);
  const onClick = useCallback(async () => {
    await createRoom(context.user, props.openNewTab);
  }, [context.user, props.openNewTab]);
  return (
    <Button
      size={props.size}
      onClick={onClick}
      className={styles.newRoomBtn}
      leftSection={<IconCirclePlusFilled size={18} />}
    >
      New Room
    </Button>
  );
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem("7sync-theme") === "dark" ||
      (!localStorage.getItem("7sync-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    localStorage.setItem("7sync-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      onClick={() => setIsDark((prev) => !prev)}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={styles.themeToggle}
    >
      {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
};

export const TopBar = (props: {
  hideNewRoom?: boolean;
  roomTitle?: string;
  roomDescription?: string;
  roomTitleColor?: string;
}) => {
  return (
    <div className={styles.topBar}>
      <a href="/" className={styles.logoLink}>
        <span className={styles.logoAccent}>7</span>
        <span className={styles.logoText}>sync</span>
      </a>
      {props.roomTitle ? (
        <div className={styles.roomInfo}>
          <div
            className={styles.roomTitle}
            style={{ color: props.roomTitleColor || undefined }}
          >
            {props.roomTitle}
          </div>
          {props.roomDescription && (
            <div className={styles.roomDescription}>
              {props.roomDescription}
            </div>
          )}
        </div>
      ) : null}
      <div className={styles.actions}>
        <ThemeToggle />
        {!props.hideNewRoom && <NewRoomButton openNewTab />}
      </div>
    </div>
  );
};
