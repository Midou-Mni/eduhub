import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-700">{title}</h1>
          {description && (
            <p className="text-neutral-400 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {action}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="relative"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
