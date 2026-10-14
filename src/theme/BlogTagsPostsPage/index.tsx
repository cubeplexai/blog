import { type ReactNode } from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useBlogTagsPostsPageTitle } from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type { Props } from '@theme/BlogTagsPostsPage';
import Unlisted from '@theme/ContentVisibility/Unlisted';
import Layout from '@theme/Layout';
import BlogCard from '@site/src/components/BlogCard';
import BlogTopicBar from '@site/src/components/BlogTopicBar';
import '@site/src/css/blog-cards.css';

function BlogTagsPostsPageContent({ tag, items, listMetadata }: Props): ReactNode {
  const title = useBlogTagsPostsPageTitle(tag);

  return (
    <Layout title={title} description={tag.description}>
      <main className="blog-home">
        <div className="blog-home__inner">
          {tag.unlisted && <Unlisted />}
          <header className="blog-home__header">
            <div className="blog-home__header-main">
              <Link to="/" className="blog-home__back-link">
                ← <Translate id="blog.tagPage.backToAll">All articles</Translate>
              </Link>
              <h1 className="blog-home__title">{tag.label}</h1>
              <p className="blog-home__description">
                {tag.description ?? (
                  <Translate
                    id="blog.tagPage.articleCount"
                    values={{ count: tag.count }}
                  >
                    {'{count} articles tagged with this topic.'}
                  </Translate>
                )}
              </p>
            </div>
          </header>

          <BlogTopicBar currentTag={tag.label} />

          <section className="blog-home__grid-section" aria-label="Articles">
            <div className="blog-cards-grid">
              {items.map((post) => (
                <BlogCard key={post.content.metadata.permalink} post={post} />
              ))}
            </div>
          </section>

          <div className="blog-home__paginator">
            <BlogListPaginator metadata={listMetadata} />
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default function BlogTagsPostsPage(props: Props): ReactNode {
  const title = useBlogTagsPostsPageTitle(props.tag);
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagPostListPage,
      )}
    >
      <PageMetadata title={title} description={props.tag.description} />
      <SearchMetadata tag="blog_tags_posts" />
      <BlogTagsPostsPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
