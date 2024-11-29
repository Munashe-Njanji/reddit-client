import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpIcon,
  ExternalLink,
  Clock,
  MessageSquare,
  Award,
  Share2,
  Bookmark,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useInView } from "react-intersection-observer";
import { timeAgo } from "@/lib/utils";
import React, { useCallback, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import PropTypes from "prop-types";

export const Post = React.memo(({ post, onRefresh, settings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    // Implement bookmark storage logic here
  }, [isBookmarked]);

  const handleShare = useCallback(() => {
    navigator
      .share?.({
        title: post.title,
        url: post.permalink,
      })
      .catch(console.error);
  }, [post]);

  const postVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <motion.div
      ref={ref}
      variants={postVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      exit="exit"
      layout
      className="mb-4"
    >
      <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden">
        <CardHeader className="pb-2 bg-gray-50 border-b border-gray-100">
          <div className="flex justify-between items-start gap-2">
            <CardTitle
              className="
                text-base font-semibold text-gray-800 
                cursor-pointer hover:text-blue-600 
                transition-colors duration-200
              "
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {post.title}
            </CardTitle>
            <div className="flex gap-2">
              {settings.showAwards && post.awards > 0 && (
                <Badge 
                  variant="secondary" 
                  className="
                    bg-yellow-100 text-yellow-800 
                    animate-pulse
                    flex items-center
                  "
                >
                  <Award className="h-3 w-3 mr-1" />
                  {post.awards}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <AnimatePresence>
            {isExpanded && post.selftext && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="
                  mt-2 text-sm text-gray-700 
                  bg-gray-50 p-3 rounded-md
                  prose prose-sm max-w-none
                "
              >
                {post.selftext}
              </motion.div>
            )}
          </AnimatePresence>

          {post.thumbnail &&
            post.thumbnail !== "self" &&
            settings.showThumbnails && (
              <img
                src={post.thumbnail}
                alt=""
                className="
                  mt-4 rounded-md max-h-56 w-full 
                  object-cover shadow-sm
                  transition-transform hover:scale-[1.02]
                "
                loading="lazy"
              />
            )}

          <div 
            className="
              flex items-center gap-4 text-sm 
              text-gray-600 mt-4 pb-2 
              border-b border-gray-100
            "
          >
            <motion.div
              className="
                flex items-center gap-1 
                hover:text-blue-600 
                transition-colors
              "
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUpIcon className="h-4 w-4" />
              {post.score.toLocaleString()}
              <span className="text-xs text-gray-500 ml-1">
                ({(post.upvoteRatio * 100).toFixed(0)}%)
              </span>
            </motion.div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {post.numComments.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {timeAgo(post.created)}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 border-t border-gray-100 p-4">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-500">
              by u/{post.author} • {post.domain}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`
                  ${isBookmarked ? "text-blue-600" : "text-gray-600"} 
                  hover:bg-gray-100 
                  transition-colors
                `}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="hover:bg-gray-100 text-gray-600"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="hover:bg-gray-100 text-gray-600"
              >
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

// Define prop types
Post.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    selftext: PropTypes.string,
    thumbnail: PropTypes.string,
    permalink: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    upvoteRatio: PropTypes.number.isRequired,
    numComments: PropTypes.number.isRequired,
    created: PropTypes.number.isRequired,
    author: PropTypes.string.isRequired,
    domain: PropTypes.string.isRequired,
    awards: PropTypes.number,
  }).isRequired,

  settings: PropTypes.shape({
    showAwards: PropTypes.bool,
    showThumbnails: PropTypes.bool,
  }).isRequired,
  onRefresh: PropTypes.func,
};

Post.displayName = "Post";

export default Post;