import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { Button } from "../ui/button";

const Menu = () => {
  return (
    <div className="p-2 flex flex-row justify-evenly">
      <div>
        MedBot
      </div>
      <div>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Button variant="link">Overview</Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="link">Team</Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="link">Enterprise</Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="link">Education</Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button variant="link">Pricing</Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      </div>
    </div>
  );
}

export default Menu;