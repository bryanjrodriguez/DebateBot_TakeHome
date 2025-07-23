"use client";

import { useState, useRef, useEffect } from "react";
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
} from "../types/speech-recognition";
import { Mic, Square, Send, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useConversationContext } from "../providers/conversation-provider";

interface ChatInputProps {
  onSendMessage: (message: string, images?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSendMessage, disabled, placeholder = "Type a message..." }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selected, setSelected] = useState<File[]>([]);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null); 
  const recRef = useRef<SpeechRecognition | null>(null);
  
  const { 
    isHistoryLoading,
    isResponseLoading 
  } = useConversationContext();
  
  const isDisabled = disabled || isHistoryLoading || isResponseLoading;

  const send = () => {
    if (isRecording) {
      stopRec();
    }
    
    if (!input.trim() && !selected.length) return;
  
    onSendMessage(input, selected.length ? selected : undefined);
    setInput('');
    setSelected([]);
  
    if (textRef.current) {
      textRef.current.style.height = 'auto';   
      textRef.current.focus();                 
    }
  };

  const startRec = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported.");

    const rec = new SR();
    recRef.current = rec;
    rec.lang = navigator.language || "en-US";
    rec.continuous = true;

    rec.onstart = () => {
      setIsRecording(true);
      setInput("");
    };
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const txt = Array.from(e.results)
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript)
        .join("");
      setInput(txt);
    };
    rec.onend = () => {
      setIsRecording(false);
    };
    rec.onerror = () => {
      setIsRecording(false);
    };
    rec.start();
  };

  const stopRec = () => {
    recRef.current?.stop();
    setIsRecording(false);
  };

  const addImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgs = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    setSelected((p) => [...p, ...imgs]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    return () => {
      stopRec();
    };
  }, []);

  return (
    <div className="w-full flex justify-center bg-background">
      <div className="w-full max-w-3xl pb-3">
        {!!selected.length && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selected.map((f, i) => (
              <div key={i} className="relative group">
                <img
                  src={URL.createObjectURL(f)}
                  alt={`img-${i}`}
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
                <button
                  onClick={() =>
                    setSelected((sel) => sel.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border shadow bg-background px-4 pt-3 pb-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : placeholder}
            disabled={isDisabled}
            ref={textRef}
          />
       
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={isRecording ? stopRec : startRec}
                disabled={isDisabled}
                className={cn(
                  "p-1 hover:bg-muted rounded-full disabled:opacity-50 text-muted-foreground transition-colors",
                  isRecording && "border border-red-500 text-red-500 animate-pulse"
                )}
              >
                {isRecording ? (
                  <Square className="h-5 w-5 fill-current" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={send}
                disabled={isDisabled || (!input.trim() && !selected.length)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={addImages}
          className="hidden"
        />
      </div>
    </div>
  );
}
