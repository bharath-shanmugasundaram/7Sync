import React, { RefObject, useContext } from "react";
import {
  ActionIcon,
  Avatar,
  Button,
  HoverCard,
  TextInput,
} from "@mantine/core";
// import data from '@emoji-mart/data';
import Picker from "@emoji-mart/react";
import { init } from "emoji-mart";
// import onClickOutside from 'react-onclickoutside';
//@ts-expect-error
import Linkify from "react-linkify";
import { SecureLink } from "react-secure-link";
import styles from "./Chat.module.css";

import {
  formatTimestamp,
  getColorForStringHex,
  getDefaultPicture,
  getOrCreateClientId,
  isEmojiString,
} from "../../utils/utils";
import { UserMenu } from "../UserMenu/UserMenu";
import { Socket } from "socket.io-client";
import {
  CSSTransition,
  SwitchTransition,
  TransitionGroup,
} from "react-transition-group";
import { MetadataContext } from "../../MetadataContext";
import VoiceChat, { VoiceChatHandle } from "../VoiceChat/VoiceChat";
import { VoiceMessageItem } from "../App/App";

const clientId = getOrCreateClientId();

interface ChatProps {
  chat: ChatMessage[];
  nameMap: StringDict;
  pictureMap: StringDict;
  socket: Socket;
  scrollTimestamp: number;
  className?: string;
  getMediaDisplayName: (input?: string) => string;
  hide?: boolean;
  isChatDisabled?: boolean;
  owner: string | undefined;
  ref: RefObject<Chat>;
  voiceMessages: VoiceMessageItem[];
}

export class Chat extends React.Component<ChatProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  public state = {
    chatMsg: "",
    isNearBottom: true,
    isPickerOpen: false,
    isVoiceRecording: false,
    voiceSeconds: 0,
    reactionMenu: {
      isOpen: false,
      selectedMsgId: "",
      selectedMsgTimestamp: "",
      yPosition: 0,
      xPosition: 0,
    },
  };
  messagesRef = React.createRef<HTMLDivElement>();
  voiceChatRef = React.createRef<VoiceChatHandle>();

  handleVoiceRecordingChange = (isRecording: boolean, seconds: number) => {
    this.setState({ isVoiceRecording: isRecording, voiceSeconds: seconds });
  };

  fmtVoiceTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async componentDidMount() {
    this.scrollToBottom();
    this.messagesRef.current?.addEventListener("scroll", this.onScroll);
    init({});
  }

  componentDidUpdate(prevProps: ChatProps) {
    if (this.props.scrollTimestamp !== prevProps.scrollTimestamp) {
      if (prevProps.scrollTimestamp === 0 || this.state.isNearBottom) {
        this.scrollToBottom();
      }
    }
    if (this.props.hide !== prevProps.hide) {
      this.scrollToBottom();
    }
  }

  setReactionMenu = (
    isOpen: boolean,
    selectedMsgId?: string,
    selectedMsgTimestamp?: string,
    yPosition?: number,
    xPosition?: number,
  ) => {
    this.setState({
      reactionMenu: {
        isOpen,
        selectedMsgId,
        selectedMsgTimestamp,
        yPosition,
        xPosition,
      },
    });
  };

  handleReactionClick = (value: string, id?: string, timestamp?: string) => {
    const msg = this.props.chat.find(
      (m) => m.id === id && m.timestamp === timestamp,
    );
    const data = {
      value,
      msgId: id || this.state.reactionMenu.selectedMsgId,
      msgTimestamp: timestamp || this.state.reactionMenu.selectedMsgTimestamp,
    };
    if (msg?.reactions?.[value].includes(clientId)) {
      this.props.socket.emit("CMD:removeReaction", data);
    } else {
      this.props.socket.emit("CMD:addReaction", data);
    }
  };

  updateChatMsg = (e: any) => {
    // console.log(e.target.selectionStart);
    this.setState({ chatMsg: e.target.value });
  };

  sendChatMsg = () => {
    if (!this.state.chatMsg) {
      return;
    }
    if (this.chatTooLong()) {
      return;
    }
    this.setState({ chatMsg: "" });
    this.props.socket.emit("CMD:chat", this.state.chatMsg);
  };

  chatTooLong = () => {
    return Boolean(this.state.chatMsg?.length > 10000);
  };

  onScroll = () => {
    this.setState({ isNearBottom: this.isChatNearBottom() });
  };

  isChatNearBottom = () => {
    return (
      this.messagesRef.current &&
      this.messagesRef.current.scrollHeight -
      this.messagesRef.current.scrollTop -
      this.messagesRef.current.offsetHeight <
      50
    );
  };

  scrollToBottom = () => {
    if (this.messagesRef.current) {
      this.messagesRef.current.scrollTop =
        this.messagesRef.current.scrollHeight;
    }
  };

  formatMessage = (cmd: string, msg?: string): React.ReactNode | string => {
    if (cmd === "host") {
      return (
        <React.Fragment>
          {`changed the video to `}
          <span style={{ textTransform: "initial" }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === "playlistAdd") {
      return (
        <React.Fragment>
          {`added to the playlist: `}
          <span style={{ textTransform: "initial" }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === "seek") {
      return `jumped to ${formatTimestamp(msg)}`;
    } else if (cmd === "play") {
      return `started the video at ${formatTimestamp(msg)}`;
    } else if (cmd === "pause") {
      return `paused the video at ${formatTimestamp(msg)}`;
    } else if (cmd === "playbackRate") {
      return `set the playback rate to ${msg === "0" ? "auto" : `${msg}x`}`;
    } else if (cmd === "lock") {
      return `locked the room`;
    } else if (cmd === "unlock") {
      return "unlocked the room";
    } else if (cmd === "vBrowserTimeout") {
      return (
        <React.Fragment>
          The VBrowser shut down automatically.
          <br />
          Subscribe for longer sessions.
        </React.Fragment>
      );
    } else if (cmd === "vBrowserAlmostTimeout") {
      return (
        <React.Fragment>
          The VBrowser will shut down soon.
          <br />
          Subscribe for longer sessions.
        </React.Fragment>
      );
    }
    return cmd;
  };

  addEmoji = (emoji: any) => {
    this.setState({ chatMsg: this.state.chatMsg + emoji.native });
  };

  render() {
    return (
      <div
        className={this.props.className}
        style={{
          display: this.props.hide ? "none" : "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0,
          marginTop: 0,
          marginBottom: 0,
          padding: "8px",
          backgroundColor: "var(--chat-bg)",
          borderLeft: "1px solid var(--chat-border)",
        }}
      >
        <div
          className={styles.chatContainer}
          ref={this.messagesRef}
          style={{ position: "relative" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(() => {
              // Merge and sort chat + voice messages by timestamp
              type Item =
                | { kind: "chat"; data: ChatMessage }
                | { kind: "voice"; data: VoiceMessageItem };
              const items: Item[] = [
                ...this.props.chat.map((m) => ({ kind: "chat" as const, data: m })),
                ...this.props.voiceMessages.map((m) => ({ kind: "voice" as const, data: m })),
              ].sort((a, b) =>
                a.data.timestamp < b.data.timestamp ? -1 : a.data.timestamp > b.data.timestamp ? 1 : 0,
              );

              return items.map((item, i) => {
                if (item.kind === "voice") {
                  const msg = item.data;
                  const isMine = msg.from === clientId;
                  const label = isMine ? "You" : (msg.name || "?").split(" ")[0];
                  const time = new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={"voice-" + msg.timestamp + msg.from + i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                        gap: "3px",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "var(--mantine-color-dimmed, #888)", paddingInline: "4px" }}>
                        {label} · {time}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 12px",
                          borderRadius: isMine ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                          background: isMine ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "var(--mantine-color-dark-6, #2C2E33)",
                          color: isMine ? "white" : "inherit",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                          maxWidth: "88%",
                        }}
                      >
                        <VoicePlayer src={`data:${msg.mimeType};base64,${msg.audio}`} isMine={isMine} />
                      </div>
                    </div>
                  );
                }

                const msg = item.data;
                const isMine = Boolean(msg.id && msg.id === clientId && !msg.system && !msg.cmd);
                return (
                  <ChatMessage
                    key={msg.timestamp + msg.id}
                    isMine={isMine}
                    className={
                      msg.id === this.state.reactionMenu.selectedMsgId &&
                        msg.timestamp === this.state.reactionMenu.selectedMsgTimestamp
                        ? styles.selected
                        : ""
                    }
                    message={msg}
                    pictureMap={this.props.pictureMap}
                    nameMap={this.props.nameMap}
                    formatMessage={this.formatMessage}
                    owner={this.props.owner}
                    socket={this.props.socket}
                    isChatDisabled={this.props.isChatDisabled}
                    setReactionMenu={this.setReactionMenu}
                    handleReactionClick={this.handleReactionClick}
                  />
                );
              });
            })()}
          </div>
          {!this.state.isNearBottom && (
            <Button
              size="xs"
              onClick={this.scrollToBottom}
              style={{
                position: "sticky",
                bottom: 0,
                display: "block",
                margin: "0 auto",
              }}
            >
              Jump to bottom
            </Button>
          )}
        </div>
        {this.state.isPickerOpen && (
          <div style={{ position: "absolute", bottom: "60px" }}>
            <Picker
              theme="light"
              previewPosition="none"
              maxFrequentRows={1}
              onEmojiSelect={this.addEmoji}
              onClickOutside={() => this.setState({ isPickerOpen: false })}
            />
          </div>
        )}
        <CSSTransition
          in={this.state.reactionMenu.isOpen}
          timeout={300}
          classNames={{
            enter: styles["reactionMenu-enter"],
            enterActive: styles["reactionMenu-enter-active"],
            exit: styles["reactionMenu-exit"],
            exitActive: styles["reactionMenu-exit-active"],
          }}
          unmountOnExit
        >
          <div
            style={{
              position: "fixed",
              top: Math.min(
                this.state.reactionMenu.yPosition - 150,
                window.innerHeight - 450,
              ),
              left: this.state.reactionMenu.xPosition - 240,
            }}
          >
            <Picker
              theme="light"
              previewPosition="none"
              maxFrequentRows={1}
              perLine={6}
              onClickOutside={() => this.setReactionMenu(false)}
              onEmojiSelect={(emoji: any) => {
                this.handleReactionClick(emoji.native);
                this.setReactionMenu(false);
              }}
            />
          </div>
          {/* <ReactionMenu
            handleReactionClick={this.handleReactionClick}
            closeMenu={() => this.setReactionMenu(false)}
            yPosition={this.state.reactionMenu.yPosition}
            xPosition={this.state.reactionMenu.xPosition}
          /> */}
        </CSSTransition>
        <VoiceChat
          ref={this.voiceChatRef}
          socket={this.props.socket}
          clientId={clientId}
          onRecordingChange={this.handleVoiceRecordingChange}
        />

        {/* Input row: recording badge + text field + emoji + mic */}
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {this.state.isVoiceRecording && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "20px",
                background: "rgba(231,76,60,0.12)",
                border: "1px solid rgba(231,76,60,0.3)",
                width: "fit-content",
                fontSize: "12px",
                color: "#e74c3c",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#e74c3c",
                  animation: "vcPulse 1s ease-in-out infinite",
                }}
              />
              {this.fmtVoiceTime(this.state.voiceSeconds)}
            </div>
          )}
          <TextInput
            onKeyDown={(e: any) => e.key === "Enter" && this.sendChatMsg()}
            onChange={this.updateChatMsg}
            value={this.state.chatMsg}
            error={this.chatTooLong()}
            disabled={this.props.isChatDisabled}
            placeholder={
              this.props.isChatDisabled
                ? "The chat was disabled by the room owner."
                : "Enter a message..."
            }
            rightSectionWidth={60}
            rightSection={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  paddingRight: "2px",
                }}
              >
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    const curr = this.state.isPickerOpen;
                    setTimeout(
                      () => this.setState({ isPickerOpen: !curr }),
                      100,
                    );
                  }}
                  disabled={this.props.isChatDisabled}
                >
                  <span role="img" aria-label="Emoji" style={{ fontSize: "16px" }}>
                    😀
                  </span>
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant={this.state.isVoiceRecording ? "filled" : "subtle"}
                  color={this.state.isVoiceRecording ? "red" : undefined}
                  onClick={() => this.voiceChatRef.current?.toggle()}
                  title={this.state.isVoiceRecording ? "Stop recording" : "Record voice message"}
                  style={{
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  <span role="img" aria-label="Voice" style={{ fontSize: "15px" }}>
                    🎤
                  </span>
                </ActionIcon>
              </div>
            }
          />
        </div>
        <style>{`
          @keyframes vcPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }
}

const ChatMessage = ({
  message,
  nameMap,
  pictureMap,
  formatMessage,
  socket,
  owner,
  isChatDisabled,
  setReactionMenu,
  handleReactionClick,
  className,
  isMine,
}: {
  message: ChatMessage;
  nameMap: StringDict;
  pictureMap: StringDict;
  formatMessage: (cmd: string, msg?: string) => React.ReactNode;
  socket: Socket;
  owner: string | undefined;
  isChatDisabled: boolean | undefined;
  setReactionMenu: (
    isOpen: boolean,
    selectedMsgId?: string,
    selectedMsgTimestamp?: string,
    yPosition?: number,
    xPosition?: number,
  ) => void;
  handleReactionClick: (value: string, id?: string, timestamp?: string) => void;
  className: string;
  isMine?: boolean;
}) => {
  const { user } = useContext(MetadataContext);
  const { id, timestamp, cmd, msg, system, isSub, reactions, videoTS } =
    message;
  const spellFull = 5; // the number of people whose names should be written out in full in the reaction popup
  const imageMsg = renderImageString(msg);
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        position: "relative",
        overflowWrap: "anywhere",
        flexDirection: isMine ? "row-reverse" : "row",
      }}
      className={`${styles.comment} ${className}`}
    >
      {id ? (
        <Avatar
          src={
            pictureMap[id] ||
            getDefaultPicture(nameMap[id], getColorForStringHex(id))
          }
        />
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "flex-end",
            fontSize: 14,
            flexDirection: isMine ? "row-reverse" : "row",
          }}
        >
          <UserMenu
            displayName={nameMap[id] || id}
            timestamp={timestamp}
            socket={socket}
            userToManage={id}
            isChatMessage
            disabled={!Boolean(owner && owner === user?.uid)}
            trigger={
              <div
                style={{ cursor: "pointer", fontWeight: 700 }}
                title={isSub ? "7sync Plus subscriber" : ""}
                className={`${isSub ? styles.subscriber : styles.light} ${styles.hoverEffect}`}
              >
                {Boolean(system) && "System"}
                {nameMap[id] || id}
              </div>
            }
          />
          <div className={styles.small + " " + styles.dark}>
            <div title={new Date(timestamp).toLocaleDateString()}>
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {Boolean(videoTS) && " @ "}
              {formatTimestamp(videoTS)}
            </div>
          </div>
        </div>
        <div className={styles.light + " " + styles.system}>
          {cmd && formatMessage(cmd, msg)}
        </div>
        <Linkify
          componentDecorator={(
            decoratedHref: string,
            decoratedText: string,
            key: string,
          ) => (
            <SecureLink href={decoratedHref} key={key}>
              {decoratedText}
            </SecureLink>
          )}
        >
          <div
            className={`${styles.light} ${isEmojiString(msg) ? styles.emoji : ""
              }`}
          >
            {!cmd && msg}
          </div>
        </Linkify>
        {imageMsg}
        <div className={styles.commentMenu}>
          <ActionIcon
            onClick={(e) => {
              //@ts-expect-error
              const viewportOffset = e.target.getBoundingClientRect();
              setTimeout(() => {
                setReactionMenu(
                  true,
                  id,
                  timestamp,
                  viewportOffset.top,
                  viewportOffset.right,
                );
              }, 100);
            }}
            disabled={isChatDisabled}
            style={{
              opacity: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 0,
              margin: 0,
            }}
          >
            <span
              role="img"
              aria-label="React"
              style={{ margin: 0, fontSize: 18 }}
            >
              😀
            </span>
          </ActionIcon>
        </div>
        <TransitionGroup>
          {Object.keys(reactions ?? []).map((key) =>
            reactions?.[key].length ? (
              <CSSTransition
                key={key}
                timeout={200}
                classNames={{
                  enter: styles["reaction-enter"],
                  enterActive: styles["reaction-enter-active"],
                  exit: styles["reaction-exit"],
                  exitActive: styles["reaction-exit-active"],
                }}
                unmountOnExit
              >
                <HoverCard>
                  <HoverCard.Target>
                    <div
                      className={`${styles.reactionContainer} ${reactions[key].includes(clientId)
                        ? styles.highlighted
                        : ""
                        }`}
                      onClick={() =>
                        handleReactionClick(key, message.id, message.timestamp)
                      }
                    >
                      <span
                        style={{
                          fontSize: 17,
                          position: "relative",
                          bottom: 1,
                        }}
                      >
                        {key}
                      </span>
                      <SwitchTransition>
                        <CSSTransition
                          key={key + "-" + reactions[key].length}
                          classNames={{
                            enter: styles["reactionCounter-enter"],
                            enterActive: styles["reactionCounter-enter-active"],
                            exit: styles["reactionCounter-exit"],
                            exitActive: styles["reactionCounter-exit-active"],
                          }}
                          addEndListener={(node, done) =>
                            node.addEventListener("transitionend", done, false)
                          }
                          unmountOnExit
                        >
                          <span
                            className={styles.reactionCounter}
                            style={{
                              color: "var(--accent)",
                              marginLeft: 3,
                            }}
                          >
                            {reactions[key].length}
                          </span>
                        </CSSTransition>
                      </SwitchTransition>
                    </div>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    {`${reactions[key]
                      .slice(0, spellFull)
                      .map((id) => nameMap[id] || "Unknown")
                      .concat(
                        reactions[key].length > spellFull
                          ? [`${reactions[key].length - spellFull} more`]
                          : [],
                      )
                      .reduce(
                        (text, value, i, array) =>
                          text +
                          (i < array.length - 1 ? ", " : " and ") +
                          value,
                      )} reacted.`}
                  </HoverCard.Dropdown>
                </HoverCard>
              </CSSTransition>
            ) : null,
          )}
        </TransitionGroup>
      </div>
    </div>
  );
};

export const renderImageString = (
  input: string | undefined,
): React.ReactNode | null => {
  // If a valid image string, return an image
  let regex =
    /^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|heic|heif|jfif)\??.*$/gim;
  if (String(input)?.match(regex)) {
    return <img style={{ maxWidth: "100%" }} src={input} />;
  }
  return null;
};

// class ReactionMenuInner extends React.Component<{
//   handleReactionClick: (value: string, id?: string, timestamp?: string) => void;
//   closeMenu: () => void;
//   yPosition: number;
//   xPosition: number;
// }> {
//   state = {
//     containerWidth: 0,
//   };
//   handleClickOutside = () => {
//     this.props.closeMenu();
//   };
//   containerRef = React.createRef<HTMLDivElement>();
//   componentDidMount() {
//     this.setState({ containerWidth: this.containerRef.current?.offsetWidth });
//   }
//   render() {
//     return (
//       <div
//         ref={this.containerRef}
//         className={styles.reactionMenuContainer}
//         style={{
//           top: this.props.yPosition - 9,
//           left: this.props.xPosition - this.state.containerWidth - 35,
//         }}
//       >
//         {reactionEmojis.map((reaction) => (
//           <div
//             onClick={() => {
//               this.props.handleReactionClick(reaction);
//               this.props.closeMenu();
//             }}
//             style={{ cursor: 'pointer' }}
//           >
//             {reaction}
//           </div>
//         ))}
//       </div>
//     );
//   }
// }
// const ReactionMenu = onClickOutside(ReactionMenuInner);

export function VoicePlayer({ src, isMine }: { src: string; isMine?: boolean }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isCalculated, setIsCalculated] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(current);
      if (dur > 0) {
        setProgress((current / dur) * 100);
      }
    }
  };

  const handleLoadedMetadata = (e: any) => {
    const audio = e.currentTarget;
    if (audio.duration === Infinity || isNaN(audio.duration) || audio.duration === 0) {
      audio.currentTime = Number.MAX_SAFE_INTEGER;
      audio.ontimeupdate = () => {
        audio.ontimeupdate = null;
        setDuration(audio.duration);
        audio.currentTime = 0;
        setIsCalculated(true);
        // reattach the normal timeupdate handler
        audio.addEventListener("timeupdate", handleTimeUpdate);
      };
    } else {
      setDuration(audio.duration);
      setIsCalculated(true);
      audio.addEventListener("timeupdate", handleTimeUpdate);
    }
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      });
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, []);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const cColor = isMine ? "rgba(255,255,255,0.9)" : "var(--mantine-color-blue-4, #4dabf7)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", minWidth: "160px" }}>
      <audio ref={audioRef} src={src} onLoadedMetadata={handleLoadedMetadata} preload="metadata" hidden />
      
      <div 
        onClick={togglePlay}
        style={{
          width: "36px", height: "36px", borderRadius: "50%",
          display: "flex", justifyContent: "center", alignItems: "center",
          cursor: "pointer", flexShrink: 0,
          background: isMine ? "rgba(255,255,255,0.2)" : "rgba(37,99,235,0.1)",
          transition: "background 0.2s"
        }}
      >
        {isPlaying ? (
          <span style={{ fontSize: "14px", color: cColor }}>⏸️</span>
        ) : (
          <span style={{ fontSize: "14px", color: cColor, marginLeft: "2px" }}>▶️</span>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* Progress Bar Container */}
        <div style={{
           height: "4px", borderRadius: "2px", position: "relative",
           background: isMine ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
           cursor: "pointer", overflow: "hidden"
        }}>
          {/* Active Progress */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${progress}%`,
            background: cColor,
            transition: isPlaying ? "width 0.1s linear" : "none"
          }} />
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 500, fontFamily: "monospace", color: isMine ? "rgba(255,255,255,0.8)" : "var(--mantine-color-dimmed, #888)" }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(isCalculated ? duration : 0)}</span>
        </div>
      </div>
{/* 
      <span style={{ fontSize: "15px", filter: isMine ? "drop-shadow(0 0 2px rgba(255,255,255,0.4))" : "none" }}>
        🎤
      </span> */}
    </div>
  );
};
