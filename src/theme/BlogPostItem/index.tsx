import Translate from '@docusaurus/Translate';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { Props } from '@theme/BlogPostItem';

function ProductCallout(): ReactNode {
  return (
    <section className="blog-product-callout" aria-labelledby="blog-product-callout-title">
      <p className="blog-product-callout__eyebrow">
        <Translate id="blog.productCallout.eyebrow">Open-source projects</Translate>
      </p>
      <h2 id="blog-product-callout-title">
        <Translate id="blog.productCallout.title">
          Bring agents into your team's day-to-day work
        </Translate>
      </h2>
      <div className="blog-product-callout__products">
        <section className="blog-product-callout__product">
          <h3>CubePlex</h3>
          <p>
            <Translate id="blog.productCallout.cubeplexDescription">
              A self-hosted AI agent workspace for teams to handle document, data, and cross-system
              work with centralized access control and execution records.
            </Translate>
          </p>
          <a
            className="blog-product-callout__link"
            href="https://github.com/cubeplexai/cubeplex">
            <Translate id="blog.productCallout.cubeplexCta">View CubePlex source</Translate>
          </a>
        </section>
        <section className="blog-product-callout__product">
          <h3>CubePi</h3>
          <p>
            <Translate id="blog.productCallout.cubepiDescription">
              A high-performance, traceable, async-native Python agent framework with
              production-grade persistence.
            </Translate>
          </p>
          <a className="blog-product-callout__link" href="https://github.com/cubeplexai/cubepi">
            <Translate id="blog.productCallout.cubepiCta">View CubePi source</Translate>
          </a>
        </section>
      </div>
    </section>
  );
}

function useContainerClassName(): string | undefined {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

export default function BlogPostItem({ children, className }: Props): ReactNode {
  const { isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();

  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
      {isBlogPostPage && <ProductCallout />}
    </BlogPostItemContainer>
  );
}
