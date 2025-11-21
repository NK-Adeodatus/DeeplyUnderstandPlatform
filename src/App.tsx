import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { Header } from "./components/header";
import { HomePage } from "./components/home-page";
import { ExplorePage } from "./components/explore-page";
import { CreatePostPage } from "./components/create-post-page";
import { ContributorsPage } from "./components/contributors-page";
import { BookmarksPage } from "./components/bookmarks-page";
import { SettingsPage } from "./components/settings-page";
import { HelpSupportPage } from "./components/help-support-page";
import { SearchResultsPage } from "./components/search-results-page";
import { AuthDialog } from "./components/auth-dialog";
import { Toaster } from "./components/ui/sonner";
import { getCurrentUser, signout, type User } from "./utils/api";

type Page = "home" | "explore" | "create-post" | "contributors" | "bookmarks" | "settings" | "help" | "search";

export default function App() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { user } = await getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('accessToken');
        }
      }
      setIsLoadingUser(false);
    };
    checkSession();
  }, []);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setAuthDialogOpen(false);
  };

  const handleSignout = () => {
    signout();
    setCurrentUser(null);
    setCurrentPage("home");
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleNavigateWithCategory = (page: Page, category?: string) => {
    setCurrentPage(page);
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage("search");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onAuthClick={handleAuthClick} currentUser={currentUser} onNavigate={handleNavigate} />;
      case "explore":
        return <ExplorePage currentUser={currentUser} onAuthClick={handleAuthClick} initialCategory={selectedCategory} />;
      case "create-post":
        return <CreatePostPage currentUser={currentUser} onNavigate={handleNavigate} />;
      case "contributors":
        return <ContributorsPage currentUser={currentUser} onAuthClick={handleAuthClick} />;
      case "bookmarks":
        return <BookmarksPage currentUser={currentUser} onAuthClick={handleAuthClick} />;
      case "settings":
        return <SettingsPage currentUser={currentUser} onSignout={handleSignout} />;
      case "help":
        return <HelpSupportPage />;
      case "search":
        return searchQuery ? <SearchResultsPage currentUser={currentUser} onAuthClick={handleAuthClick} searchQuery={searchQuery} /> : null;
      default:
        return <HomePage onAuthClick={handleAuthClick} currentUser={currentUser} onNavigate={handleNavigate} />;
    }
  };

  if (isLoadingUser) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="techdeep-theme">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="techdeep-theme">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onNavigateWithCategory={handleNavigateWithCategory}
          />
          <div className="flex-1 flex flex-col">
            <Header 
              onAuthClick={handleAuthClick} 
              currentUser={currentUser}
              onSignout={handleSignout}
              onSearch={handleSearch}
            />
            <main className="flex-1">
              {renderPage()}
            </main>
          </div>
        </div>
        
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          defaultTab={authMode}
          onAuthSuccess={handleAuthSuccess}
        />
        
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}