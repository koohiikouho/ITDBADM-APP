import React from "react";
import { Button, cn } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import { Music, Calendar, Guitar } from "lucide-react";

interface BookBandButtonProps {
  variant?: "solid" | "flat" | "shadow" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  theme?: "default" | "music" | "premium";
  bandId?: string;
}

const BookBandButton: React.FC<BookBandButtonProps> = ({
  variant = "solid",
  size = "md",
  className,
  theme = "default",
  bandId = "",
}) => {
  const navigate = useNavigate();

  const handleBookBand = () => {
    navigate("/book/" + bandId);
  };

  const getButtonStyles = () => {
    switch (theme) {
      case "music":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600";
      case "premium":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (theme) {
      case "music":
        return <Music size={20} />;
      case "premium":
        return <Guitar size={20} />;
      default:
        return <Calendar size={20} />;
    }
  };

  const buttonSize = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <Button
      variant={theme === "default" ? variant : "solid"}
      size={size}
      onPress={handleBookBand}
      className={cn(
        "font-semibold transition-all duration-200",
        buttonSize[size],
        getButtonStyles(),
        className
      )}
      startContent={getIcon()}
    >
      Book Band
    </Button>
  );
};

export default BookBandButton;
