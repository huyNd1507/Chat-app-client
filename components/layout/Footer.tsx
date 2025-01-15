import { Button } from "@/components/ui/button";
import { IconIconEmotionHappy } from "@/components/icons/icon-emotion-happy";
import { IconSend } from "@/components/icons/send";
import { IconLink } from "@/components/icons/link";
import { Textarea } from "@/components/ui/textarea";

const Footer = () => {
  return (
    <div className="border-t-2 flex items-center sticky bottom-0 left-0 right-0">
      <div className="flex w-full flex-1 gap-3 p-6  items-center space-x-2">
        <Textarea placeholder="Enter message..." className="flex-1" />
        <IconIconEmotionHappy />
        <IconLink />
        <Button type="submit">
          <IconSend />
        </Button>
      </div>
    </div>
  );
};

export default Footer;
