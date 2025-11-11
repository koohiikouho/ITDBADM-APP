import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import {
  Share2,
  Facebook,
  Twitter,
  Link2,
  Mail,
  MessageCircle,
  Linkedin,
} from "lucide-react";

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "solid" | "light" | "ghost";
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "Check this out!",
  description = "",
  className,
  size = "md",
  variant = "flat",
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const shareOptions = [
    {
      key: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      key: "twitter",
      name: "Twitter",
      icon: Twitter,
      color: "text-sky-500",
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      key: "whatsapp",
      name: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-500",
      shareUrl: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    },
    {
      key: "email",
      name: "Email",
      icon: Mail,
      color: "text-red-500",
      shareUrl: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + "\n\n" + url)}`,
    },
    {
      key: "copy",
      name: "Copy Link",
      icon: Link2,
      color: "text-gray-500",
      action: "copy",
    },
  ];

  const handleShare = (option: (typeof shareOptions)[0]) => {
    if (option.action === "copy") {
      navigator.clipboard.writeText(url);
      setIsCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } else if (option.shareUrl) {
      window.open(option.shareUrl, "_blank", "width=600,height=400");
    }
  };

  const buttonSize = {
    sm: "h-8 w-8 min-w-8",
    md: "h-10 w-10 min-w-10",
    lg: "h-12 w-12 min-w-12",
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Dropdown placement="top-start">
      <DropdownTrigger>
        <Button
          isIconOnly
          variant={variant}
          className={cn(
            "transition-all duration-200",
            buttonSize[size],
            className
          )}
        >
          <Share2 size={iconSize[size]} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Share options"
        variant="flat"
        className="min-w-[200px]"
      >
        {shareOptions.map((option) => {
          const IconComponent = option.icon;
          const displayName =
            isCopied && option.key === "copy" ? "Copied!" : option.name;

          return (
            <DropdownItem
              key={option.key}
              startContent={
                <IconComponent
                  size={18}
                  className={cn(
                    option.color,
                    isCopied && option.key === "copy" && "text-green-600"
                  )}
                />
              }
              className={cn(
                "transition-colors",
                isCopied && option.key === "copy" && "!text-green-600"
              )}
              onPress={() => handleShare(option)}
            >
              {displayName}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

export default ShareButton;
