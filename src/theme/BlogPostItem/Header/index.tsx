import Link from '@docusaurus/Link';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import type { ReactNode } from 'react';

function PostImage(): ReactNode {
  const { frontMatter, metadata, isBlogPostPage } = useBlogPost();
  const image = frontMatter.image;
  const imageUrl = useBaseUrl(typeof image === 'string' ? image : '');

  if (typeof image !== 'string') return null;

  const visual = (
    <img
      className="blog-post__image"
      src={imageUrl}
      alt={metadata.title}
      width={1536}
      height={1024}
      loading={isBlogPostPage ? 'eager' : 'lazy'}
    />
  );

  return isBlogPostPage ? (
    <div className="blog-post__visual">{visual}</div>
  ) : (
    <Link className="blog-post__visual" to={metadata.permalink} aria-label={metadata.title}>
      {visual}
    </Link>
  );
}

export default function BlogPostItemHeader(): ReactNode {
  const { isBlogPostPage } = useBlogPost();

  if (isBlogPostPage) {
    return (
      <header className="blog-post__header">
        <BlogPostItemHeaderInfo />
        <BlogPostItemHeaderTitle />
        <BlogPostItemHeaderAuthors />
        <PostImage />
      </header>
    );
  }

  return (
    <header className="blog-post__header">
      <PostImage />
      <BlogPostItemHeaderInfo />
      <BlogPostItemHeaderTitle />
      <BlogPostItemHeaderAuthors />
    </header>
  );
}
