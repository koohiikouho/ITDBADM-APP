import React, { useState, useRef, useEffect } from "react";
import { Button, cn } from "@heroui/react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SeeMoreProps {
  text: string;
  maxLines?: number;
  className?: string;
  seeMoreText?: string;
  seeLessText?: string;
  buttonVariant?: "flat" | "light" | "solid" | "ghost";
  buttonSize?: "sm" | "md" | "lg";
}

const SeeMore: React.FC<SeeMoreProps> = ({
  text,
  maxLines = 3,
  className,
  seeMoreText = "See more",
  seeLessText = "See less",
  buttonVariant = "light",
  buttonSize = "sm",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [lineHeight, setLineHeight] = useState(24); // Default line height
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const element = textRef.current;
      const computedStyle = getComputedStyle(element);
      const calculatedLineHeight = parseInt(computedStyle.lineHeight) || 24;
      setLineHeight(calculatedLineHeight);

      const maxHeight = calculatedLineHeight * maxLines;
      setNeedsTruncation(element.scrollHeight > maxHeight);
    }
  }, [text, maxLines]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const maxHeight = lineHeight * maxLines;

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {/* Text Content with Fade Effect */}
      <div className="relative">
        <div
          ref={textRef}
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden text-gray-600 dark:text-gray-400 leading-relaxed"
          )}
          style={{
            maxHeight: isExpanded ? "none" : `${maxHeight}px`,
          }}
        >
          {text}
        </div>

        {/* Fade Overlay */}
        {!isExpanded && needsTruncation && (
          <div
            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-background dark:via-background/80 dark:to-transparent pointer-events-none"
            style={{ bottom: "0" }}
          />
        )}
      </div>

      {/* See More/Less Button */}
      {needsTruncation && (
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onPress={toggleExpanded}
          className="mt-2 px-0 min-w-0 h-auto text-sm font-normal text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          endContent={
            isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          }
        >
          {isExpanded ? seeLessText : seeMoreText}
        </Button>
      )}
    </div>
  );
};

export default SeeMore;
