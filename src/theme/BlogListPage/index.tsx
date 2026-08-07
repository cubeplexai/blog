import { HtmlClassNameProvider, ThemeClassNames } from '@docusaurus/theme-common';
import BlogListPaginator from '@theme/BlogListPaginator';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import BlogPostItems from '@theme/BlogPostItems';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import AllPosts from '@site/src/components/AllPosts';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Props } from '@theme/BlogListPage';

function BlogListPageContent({ metadata, items, sidebar }: Props): ReactNode {
  return (
    <Layout
      title={metadata.permalink === '/' ? undefined : metadata.blogTitle}
      description={metadata.blogDescription}
    >
      <main>
        <div className="blog-feed-layout">
          <aside className="blog-feed-layout__sidebar">
            <AllPosts sidebar={sidebar} />
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
