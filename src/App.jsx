import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Moon,
} from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { debounce } from "lodash";
import { formatSubscribers } from "./lib/utils";
import { RedditService } from "./lib/reddit";
import { Lane } from "./components/Lane";
import PropTypes from "prop-types";


// Settings Context and Provider
const SettingsContext = React.createContext({});

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Check for saved settings in localStorage
    const savedSettings = localStorage.getItem("appSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
        theme: "light",
        showAwards: true,
        showThumbnails: true,
        compactMode: false,
        autoRefresh: false,
        refreshInterval: 300000, // 5 minutes
      };
  });

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
  const App = () => {
    const [subreddits, setSubreddits] = useState(() => {
      const saved = localStorage.getItem("subreddits");
      return saved ? JSON.parse(saved) : ["programming", "javascript"];
    });

    const [newSubreddit, setNewSubreddit] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [currentLaneOffset, setCurrentLaneOffset] = useState(0);
    const { settings, setSettings } = React.useContext(SettingsContext);

    // Media query hook
    const isMobile = useMediaQuery("(max-width: 768px)");
    const containerRef = useRef(null);

    // Local storage sync
    useEffect(() => {
      localStorage.setItem("subreddits", JSON.stringify(subreddits));
    }, [subreddits]);

    // Debounced subreddit search
    const debouncedSearchSubreddits = debounce(async (query) => {
      if (query.length < 2) return;
      try {
        const results = await RedditService.searchSubreddits(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Failed to search subreddits:", error);
      }
    }, 300);

    const handleSearchSubreddits = useCallback(
      (query) => {
        debouncedSearchSubreddits(query);
      },
      [debouncedSearchSubreddits]
    );

    const handleAddSubreddit = async (subreddit) => {
      try {
        if (subreddits.includes(subreddit)) {
          alert(`Subreddit r/${subreddit} is already added.`);
          return;
        }

        await RedditService.fetchPosts(subreddit);
        setSubreddits((prev) => [...new Set([...prev, subreddit])]);
        setNewSubreddit("");
        setIsDialogOpen(false);
        setSearchResults([]);
      } catch (error) {
        alert(`Subreddit "${subreddit}" not found or is private.`);
        console.error(`${error}`);
      }
    };

    // Lane navigation handlers
    const handlePrevLanes = () => {
      setCurrentLaneOffset(Math.max(0, currentLaneOffset - 1));
    };

    const handleNextLanes = () => {
      setCurrentLaneOffset(Math.min(subreddits.length - 1, currentLaneOffset + 1));
    };

    // Render lane addition dialog/drawer
    const renderSubredditAddModal = () => {
      const SearchContent = (
        <div className="space-y-4">
          <Input
            placeholder="Search subreddits..."
            value={newSubreddit}
            onChange={(e) => {
              setNewSubreddit(e.target.value);
              handleSearchSubreddits(e.target.value);
            }}
            className="w-full"
          />

          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2 max-h-[50vh] overflow-y-auto"
              >
                {searchResults.map((result) => (
                  <Button
                    key={result.name}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleAddSubreddit(result.name)}
                  >
                    <div className="flex items-center">
                      r/{result.name}
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-gray-200 text-gray-700"
                      >
                        {formatSubscribers(result.subscribers)}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );

      return isMobile ? (
        <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DrawerTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Subreddit
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-xl">Add New Subreddit</DrawerTitle>
            </DrawerHeader>
            {SearchContent}
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Subreddit
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Subreddit</DialogTitle>
            </DialogHeader>
            {SearchContent}
          </DialogContent>
        </Dialog>
      );
    };

    return (
      <div
        className={`
        min-h-screen 
        ${settings.theme === 'dark'
            ? 'bg-gray-900 text-gray-100'
            : 'bg-gray-50 text-gray-900'}
        transition-colors duration-300
      `}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl md:text-3xl font-bold">
              Multi-Lane Reddit Client
            </h1>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    theme: prev.theme === "light" ? "dark" : "light",
                  }))
                }
                className="hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {settings.theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              {renderSubredditAddModal()}
            </div>
          </div>

          <div className="relative">
            {subreddits.length > 3 && !isMobile && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevLanes}
                  disabled={currentLaneOffset === 0}
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
            )}

            <LayoutGroup>
              <motion.div
                layout
                ref={containerRef}
                className={`
                flex flex-row 
                overflow-x-auto 
                pb-4 
                space-x-4 
                min-h-[calc(100vh-8rem)]
                ${isMobile ? 'snap-x snap-mandatory' : ''}
                scrollbar-thin 
                scrollbar-thumb-gray-300 
                scrollbar-track-gray-100
              `}
              >
                <AnimatePresence>
                  {subreddits
                    .slice(
                      isMobile ? 0 : currentLaneOffset,
                      isMobile ? undefined : currentLaneOffset + 3
                    )
                    .map((subreddit) => (
                      <Lane
                        key={subreddit}
                        subreddit={subreddit}
                        onDelete={(sub) => {
                          setSubreddits((prev) => prev.filter((s) => s !== sub));
                        }}
                        settings={settings}
                        className={isMobile ? 'snap-center w-full flex-shrink-0' : ''}
                      />
                    ))
                  }
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>

            {subreddits.length > 3 && !isMobile && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextLanes}
                  disabled={currentLaneOffset >= subreddits.length - 3}
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default function AppWrapper() {
    return (
      <SettingsProvider>
        <App />
      </SettingsProvider>
    );
  }