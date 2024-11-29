export const RedditService = {
  async fetchPosts(subreddit, sort = "hot", limit = 25, after = "") {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}&after=${after}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch posts from r/${subreddit}`);
    const data = await response.json();
    return {
      posts: data.data.children.map((post) => ({
        ...post.data,
        id: post.data.id,
        title: post.data.title,
        author: post.data.author,
        score: post.data.score,
        numComments: post.data.num_comments,
        created: post.data.created_utc,
        url: post.data.url,
        permalink: `https://reddit.com${post.data.permalink}`,
        thumbnail: post.data.thumbnail,
        awards: post.data.total_awards_received,
        isVideo: post.data.is_video,
        postHint: post.data.post_hint,
        selftext: post.data.selftext,
        preview: post.data.preview,
        domain: post.data.domain,
        upvoteRatio: post.data.upvote_ratio,
      })),
      after: data.data.after,
    };
  },

  async searchSubreddits(query) {
    const response = await fetch(
      `https://www.reddit.com/subreddits/search.json?q=${query}&limit=5`
    );
    if (!response.ok) throw new Error("Failed to search subreddits");
    const data = await response.json();
    return data.data.children.map((subreddit) => ({
      name: subreddit.data.display_name,
      subscribers: subreddit.data.subscribers,
      description: subreddit.data.public_description,
    }));
  },
};
