import { useCallback, useEffect, useState } from "react";
import { Post } from "./Post";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCcw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { RedditService } from "@/lib/reddit";

export const Lane = ({ subreddit, onDelete, settings }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("hot");
  const [after, setAfter] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (loadMore = false) => {
      if (!loadMore) setLoading(true);
      else setLoadingMore(true);

      setError(null);
      try {
        const response = await RedditService.fetchPosts(
          subreddit,
          sortBy,
          25,
          loadMore ? after : ""
        );

        setPosts((prev) =>
          loadMore ? [...prev, ...response.posts] : response.posts
        );
        setAfter(response.after);
        setHasMore(!!response.after);
      } catch (err) {
        setError(err);
      } finally {
        if (!loadMore) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [subreddit, sortBy, after]
  );

  useEffect(() => {
    fetchPosts();

    if (settings.autoRefresh) {
      const interval = setInterval(fetchPosts, settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchPosts, settings.autoRefresh, settings.refreshInterval]);

  // Error handling
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        <Alert variant="destructive" className="mb-4 shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700">Error Fetching Posts</AlertTitle>
          <AlertDescription className="text-red-600">
            {error.message || "Unable to load subreddit posts"}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto sm:w-80 flex-shrink-0"
    >
      <Card className="shadow-xl border-2 border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center">
              <span className="mr-2">r/</span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-700 dark:text-gray-300"
              >
                {subreddit}
              </motion.span>
            </CardTitle>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-24 bg-white/70 dark:bg-gray-700/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="rising">Rising</SelectItem>
                </SelectContent>
              </Select>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fetchPosts()}
                      className={`
                        ${loading ? "animate-spin" : ""}
                        bg-blue-50 dark:bg-gray-700 
                        hover:bg-blue-100 dark:hover:bg-gray-600
                        transition-all duration-300
                      `}
                    >
                      <RefreshCcw className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh Subreddit</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(subreddit)}
                      className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Lane</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-2 bg-gray-50 dark:bg-gray-900">
          <ScrollArea className="h-[calc(100vh-12rem)] pr-2">
            <AnimatePresence>
              {loading
                ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Skeleton 
                        className="h-24 w-full mb-4 bg-gray-200 dark:bg-gray-700" 
                      />
                    </motion.div>
                  ))
                : posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Post
                      post={post}
                      onRefresh={fetchPosts}
                      settings={settings}
                    />
                  </motion.div>
                ))}
            </AnimatePresence>

            {hasMore && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outline"
                  className="w-full mt-4 
                    bg-white dark:bg-gray-800 
                    border-blue-200 dark:border-gray-700
                    hover:bg-blue-50 dark:hover:bg-gray-700
                    transition-all duration-300"
                  onClick={() => fetchPosts(true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </motion.div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Define prop types
Lane.propTypes = {
  subreddit: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    autoRefresh: PropTypes.bool,
    refreshInterval: PropTypes.number,
  }).isRequired,
};