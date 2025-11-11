import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
} from "@heroui/react";
import { MoreVertical, Flag } from "lucide-react";

interface ReportMenuProps {
  onReport?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "light" | "ghost" | "solid";
}

const ReportMenu: React.FC<ReportMenuProps> = ({
  onReport,
  className,
  size = "md",
  variant = "light",
}) => {
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

  return (
    <Dropdown placement="bottom-end">
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
          <MoreVertical size={iconSize[size]} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Report options"
        variant="flat"
        className="min-w-[180px]"
      >
        <DropdownItem
          key="report"
          startContent={<Flag size={18} className="text-red-500" />}
          className="text-danger"
          color="danger"
          onPress={onReport}
        >
          Report a Problem
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ReportMenu;
