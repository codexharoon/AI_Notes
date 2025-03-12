import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  currentInput: string;
  onSubmit: () => void;
  className?: string;
}

export function VoiceInput({ 
  onTranscript, 
  currentInput, 
  onSubmit,
  className 
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");

  // Initialize speech recognition on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0].transcript)
          .join('');
        
        onTranscript(transcript);
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (silenceTimer) clearTimeout(silenceTimer);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
        if (silenceTimer) clearTimeout(silenceTimer);
      };
  
      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, []);

  // Reset silence timer when input changes
  useEffect(() => {
    if (isRecording && currentInput && currentInput !== lastTranscriptRef.current) {
      lastTranscriptRef.current = currentInput;
      resetSilenceTimer();
    }
  }, [currentInput, isRecording]);

  const resetSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }
    
    const timer = setTimeout(() => {
      if (isRecording && currentInput.trim() !== "") {
        // Stop recording and submit the form
        if (recognition) {
          recognition.stop();
          setIsRecording(false);
        }
        onSubmit();
      }
    }, 2500); // 2.5 seconds of silence
    
    setSilenceTimer(timer);
  };

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      if (silenceTimer) clearTimeout(silenceTimer);
    } else {
      lastTranscriptRef.current = currentInput;
      recognition.start();
      resetSilenceTimer();
    }
    setIsRecording(!isRecording);
  };

  return (
    <Button 
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      className={className}
      onClick={toggleRecording}
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isRecording ? <MicOff /> : <Mic />}
    </Button>
  );
}