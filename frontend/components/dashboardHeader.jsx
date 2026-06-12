import React from "react";
import { SearchBox } from "./searchbox";
import { Download, Bell, Sun, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-between gap-4 p-4 bg-white border-b sticky top-0 z-1">
      {/* <div className="relative"> */}
        <SearchBox />
      {/* </div> */}
      <div className="flex items-center gap-4">
        <Button>  
          <Bell className="h-4 w-4" />
        </Button>
        <Button>
          <Sun className="h-4 w-4" />
        </Button>
        <Button>
          <Settings className="h-4 w-4" />
        </Button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>SS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default DashboardHeader;
