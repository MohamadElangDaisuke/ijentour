"use client";

import React from "react";
import MenuChatbot from "./MenuChatbot/MenuChatbot";

interface TravelAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function TravelAssistantModal({
  isOpen,
  onClose,
  initialPrompt,
}: TravelAssistantModalProps) {
  return (
    <MenuChatbot
      isOpen={isOpen}
      onClose={onClose}
      initialPrompt={initialPrompt}
    />
  );
}
