import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { Socket } from "socket.io-client";

export interface VoiceChatHandle {
  toggle: () => void;
}

interface Props {
  socket: Socket | null;
  clientId: string;
  onRecordingChange?: (isRecording: boolean, seconds: number) => void;
}

/** Headless recording component — exposes toggle() via ref.
 *  Voice messages are rendered inside the main chat stream in Chat.tsx. */
const VoiceChat = forwardRef<VoiceChatHandle, Props>(
  ({ socket, clientId, onRecordingChange }, ref) => {
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
      onRecordingChange?.(recording, seconds);
    }, [recording, seconds]);

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            if (socket) socket.emit("CMD:voiceMessage", { audio: base64, mimeType });
          };
          reader.readAsDataURL(blob);
          streamRef.current?.getTracks().forEach((t) => t.stop());
        };

        recorder.start(100);
        setRecording(true);
        setSeconds(0);
        timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } catch {
        alert("Microphone access denied.");
      }
    };

    const stopRecording = () => {
      mediaRecorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      setSeconds(0);
    };

    useImperativeHandle(
      ref,
      () => ({ toggle: () => { if (recording) stopRecording(); else startRecording(); } }),
      [recording],
    );

    return null; // rendering is handled by the unified chat list in Chat.tsx
  },
);

export default VoiceChat;