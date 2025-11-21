import {
  Book,
  Home,
  Compass,
  PlusCircle,
  BookOpen,
  Code2,
  Database,
  Globe,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";

type Page = "home" | "explore" | "create-post" | "contributors" | "bookmarks" | "settings" | "help";

interface NavigationItem {
  title: string;
  icon: any;
  page: Page;
}

interface CategoryItem {
  title: string;
  icon: any;
  category: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface CategorySection {
  title: string;
  items: CategoryItem[];
}

const navigation: NavigationSection[] = [
  {
    title: "Main",
    items: [
      { title: "Home", icon: Home, page: "home" },
      { title: "Explore", icon: Compass, page: "explore" },
      { title: "Create Post", icon: PlusCircle, page: "create-post" },
    ],
  },
];

const categories: CategoryItem[] = [
  { title: "Web Development", icon: Globe, category: "Web Development" },
  { title: "Programming Languages", icon: Code2, category: "Programming Languages" },
  { title: "Databases", icon: Database, category: "Databases" },
  { title: "Frameworks & Libraries", icon: BookOpen, category: "Frameworks & Libraries" },
];

const communityItems: NavigationItem[] = [
  { title: "Contributors", icon: Users, page: "contributors" },
  { title: "My Bookmarks", icon: Book, page: "bookmarks" },
];

interface AppSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onNavigateWithCategory: (page: Page, category?: string) => void;
}

export function AppSidebar({ currentPage, onNavigate, onNavigateWithCategory }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <button 
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Code2 className="h-5 w-5" />
          </div>
          <span>TechDeep</span>
        </button>
      </SidebarHeader>
      
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.page)}
                      isActive={currentPage === item.page}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onNavigateWithCategory("explore", item.category)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.page)}
                    isActive={currentPage === item.page}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onNavigate("settings")}
              isActive={currentPage === "settings"}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onNavigate("help")}
              isActive={currentPage === "help"}
            >
              <HelpCircle />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}