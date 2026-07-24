import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogListPaginator from '@theme/BlogListPaginator';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import BlogPostItems from '@theme/BlogPostItems';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import RecentPosts from '@site/src/components/RecentPosts';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Props } from '@theme/BlogListPage';

function BlogIntro(): ReactNode {
  return (
    <section className="blog-intro">
      <div className="blog-intro__copy">
        <p className="blog-intro__kicker">CubePlex Blog</p>
        <h1>Governed agent work.</h1>
        <p>Product and engineering notes for teams building governed, self-hosted agent workflows.</p>
        <a className="blog-intro__cta" href="https://cubeplex.ai/docs">
          Read the documentation
        </a>
      </div>
      <img
        className="blog-intro__image"
        src="/blog/img/blog/governed-work.png"
        alt="A calm technical workspace with a laptop and process diagrams"
        width={1536}
        height={1024}
      />
    </section>
  );
}

function BlogListPageContent({ metadata, items, sidebar }: Props): ReactNode {
  return (
    <Layout
      title={metadata.permalink === '/' ? undefined : metadata.blogTitle}
      description={metadata.blogDescription}
    >
      <main>
        <BlogIntro />
        <div className="blog-feed-layout">
          <aside className="blog-feed-layout__sidebar">
            <RecentPosts sidebar={sidebar} />
          </aside>
          <div className="blog-feed">
            <BlogPostItems items={items} />
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
