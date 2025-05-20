import { IconEllipsisVertical } from "@/components/icons/ellipsis-vertical";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatContent = () => {
  return (
    <div className="h-[75vh] flex-1 p-4 lg:p-6 overflow-y-scroll box-chat bg-background">
      <div className="simplebar-wrapper">
        <div className="simplebar-mask">
          <div>
            <div className="simplebar-content-wrapper">
              <div className="simplebar-content">
                <ul className="mb-0">
                  <li className="clear-both py-4">
                    <div className="flex items-end gap-3">
                      <div>
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </div>

                      <div>
                        <div className="flex gap-2 mb-2">
                          <div className="relative px-5 py-3 text-primary-foreground rounded-lg ltr:rounded-bl-none rtl:rounded-br-none bg-primary">
                            <p className="mb-0">Good morning</p>
                            <p className="mt-1 mb-0 text-xs text-right text-primary-foreground/50">
                              <i className="align-middle ri-time-line"></i>{" "}
                              <span className="align-middle">10:00</span>
                            </p>
                          </div>
                          <div className="relative self-start dropdown">
                            <IconEllipsisVertical className="text-muted-foreground hover:text-foreground transition-colors" />
                          </div>
                        </div>
                        <div className="font-medium text-foreground text-14">
                          Doris Brown
                        </div>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="relative inline-flex items-end gap-2 mb-6 text-right float-right">
                      <div className="order-3 mr-0 ltr:ml-4 rtl:mr-4">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </div>

                      <div>
                        <div className="flex gap-2 mb-2 justify-end">
                          <div className="relative lg:w-[50%] sm:w-[100%] order-2 px-5 py-3 text-foreground rounded-lg ltr:rounded-br-none rtl:rounded-bl-none bg-muted">
                            <p className="mb-0">
                              Good morning, How are you? What about our next
                              meeting? Good morning, How are you? What about our
                              next meeting? Good morning, How are you? What
                              about our next meeting? Good morning, How are you?
                              What about our next meeting?
                            </p>
                            <p className="mt-1 mb-0 text-xs text-left text-muted-foreground">
                              <i className="align-middle ri-time-line"></i>{" "}
                              <span className="align-middle">10:02</span>
                            </p>
                          </div>

                          <div className="relative self-start order-1 dropstart">
                            <IconEllipsisVertical className="text-muted-foreground hover:text-foreground transition-colors" />
                          </div>
                        </div>

                        <div className="font-medium text-foreground rtl:text-left text-14">
                          Văn Lâm
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContent;
