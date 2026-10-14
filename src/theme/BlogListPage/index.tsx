import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogListPaginator from '@theme/BlogListPaginator';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate from '@docusaurus/Translate';
import BlogFeaturedCard from '@site/src/components/BlogFeaturedCard';
import BlogCard from '@site/src/components/BlogCard';
import BlogTopicBar from '@site/src/components/BlogTopicBar';
import '@site/src/css/blog-cards.css';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Props } from '@theme/BlogListPage';

function BlogListPageContent({ metadata, items }: Props): ReactNode {
  const isFirstPage = metadata.page === 1;
  const rssUrl = useBaseUrl('/rss.xml');

  const featuredPost = isFirstPage && items.length > 0 ? items[0] : null;
  const gridPosts = isFirstPage ? items.slice(1) : items;

  return (
    <Layout
      title={isFirstPage ? undefined : metadata.blogTitle}
      description={metadata.blogDescription}
    >
      <main className="blog-home">
        <div className="blog-home__inner">
          <header className="blog-home__header">
            <div className="blog-home__header-main">
              <h1 className="blog-home__title">{metadata.blogTitle}</h1>
              <p className="blog-home__description">{metadata.blogDescription}</p>
            </div>
            <a
              className="blog-home__rss-button"
              href={rssUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RSS Feed"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93v-2.83Z" />
              </svg>
              <span>
                <Translate id="blog.home.rssFeed">RSS Feed</Translate>
              </span>
            </a>
          </header>

          <BlogTopicBar />

          {featuredPost && (
            <section className="blog-home__featured-section" aria-label="Featured Article">
              <BlogFeaturedCard post={featuredPost} />
            </section>
          )}

          <section className="blog-home__grid-section" aria-label="Articles">
            <h2 className="blog-home__section-heading">
              {isFirstPage ? (
                <Translate id="blog.home.recentArticles">Recent Articles</Translate>
              ) : (
                <Translate
                  id="blog.home.pageArticles"
                  values={{ page: metadata.page }}
                >
                  {'Page {page} Articles'}
                </Translate>
              )}
            </h2>

            <div className="blog-cards-grid">
              {gridPosts.map((post) => (
                <BlogCard key={post.content.metadata.permalink} post={post} />
              ))}
            </div>
          </section>

          <div className="blog-home__paginator">
            <BlogListPaginator metadata={metadata} />
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default function BlogListPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}
    >
      <SearchMetadata tag="blog_posts_list" />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
