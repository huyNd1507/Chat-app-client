import { Button } from "@/components/ui/button";
import { IconIconEmotionHappy } from "@/components/icons/icon-emotion-happy";
import { IconSend } from "@/components/icons/send";
import { IconLink } from "@/components/icons/link";
import { Textarea } from "@/components/ui/textarea";

const Footer = () => {
  return (
    <div className="border-t border-border flex items-center sticky bottom-0 left-0 right-0 bg-background">
      <div className="flex w-full flex-1 gap-3 p-6 items-center space-x-2">
        <Textarea 
          placeholder="Enter message..." 
          className="flex-1 bg-background text-foreground placeholder:text-muted-foreground" 
        />
        <IconIconEmotionHappy className="text-muted-foreground hover:text-foreground transition-colors" />
        <IconLink className="text-muted-foreground hover:text-foreground transition-colors" />
        <Button type="submit" variant="ghost" size="icon">
          <IconSend className="text-muted-foreground hover:text-foreground transition-colors" />
        </Button>
      </div>
    </div>
  );
};

export default Footer;
