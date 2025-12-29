import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, LogOut, User, Moon, Sun, Plus, Heart, Calendar } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { getAuthUser, clearAuthUser, isOwner } from "@/lib/auth";
import { useState, useEffect } from "react";

export function Header() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  // Initialize user immediately from localStorage, not null
  const [user, setUser] = useState<any>(() => getAuthUser());

  useEffect(() => {
    // Sync user state when localStorage changes
    const authUser = getAuthUser();
    setUser(authUser);
  }, []);

  useEffect(() => {
    // Update user state when localStorage changes
    const handleStorageChange = () => {
      const authUser = getAuthUser();
      setUser(authUser);
    };

    // Listen to storage changes from other tabs/windows and page visibility
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        handleStorageChange();
      }
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
      document.removeEventListener("visibilitychange", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    clearAuthUser();
    setUser(null);
    setLocation("/");
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md transition-transform" data-testid="link-home">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden md:inline">DirectConnect</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                {isOwner(user) ? (
                  <Button
                    onClick={() => setLocation("/list-property")}
                    className="hidden md:flex"
                    data-testid="button-list-property"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    List Property
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/saved")}
                    className="hidden md:flex"
                    data-testid="button-saved"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Saved
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")} data-testid="menu-dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    {!isOwner(user) && (
                      <>
                        <DropdownMenuItem onClick={() => setLocation("/saved")} data-testid="menu-saved">
                          <Heart className="mr-2 h-4 w-4" />
                          Saved Properties
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation("/appointments")} data-testid="menu-appointments">
                          <Calendar className="mr-2 h-4 w-4" />
                          My Appointments
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setLocation("/auth")} data-testid="button-login">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
