import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, { translate } from '@docusaurus/Translate';
import { usePluralForm } from '@docusaurus/theme-common';
import { useDateTimeFormat } from '@docusaurus/theme-common/internal';
import type { ReactNode } from 'react';
import type { PropBlogPostContent } from '@docusaurus/plugin-content-blog';

type Props = {
  post: {
    content: PropBlogPostContent;
  };
};

function useReadingTimePlural() {
  const { selectMessage } = usePluralForm();
  return (readingTimeFloat: number) => {
    const readingTime = Math.ceil(readingTimeFloat);
    return selectMessage(
      readingTime,
      translate(
        {
          id: 'theme.blog.post.readingTime.plurals',
          description:
            'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support',
          message: 'One min read|{readingTime} min read',
        },
        { readingTime },
      ),
    );
  };
}

export default function BlogFeaturedCard({ post }: Props): ReactNode {
  const { metadata } = post.content;
  const { title, description, permalink, date, readingTime, tags, authors, frontMatter } = metadata;

  const image = frontMatter.image;
  const imageUrl = useBaseUrl(typeof image === 'string' ? image : '');
  const { coverAspectRatio } = frontMatter as typeof frontMatter & {
    coverAspectRatio?: string;
  };
  const isLegacyCover = coverAspectRatio === '2:1';

  const dateTimeFormat = useDateTimeFormat({
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const readingTimePlural = useReadingTimePlural();
  const formattedDate = dateTimeFormat.format(new Date(date));
  const primaryTag = tags.length > 0 ? tags[0] : null;
  const author = authors.length > 0 ? authors[0] : null;

  return (
    <article className="blog-featured-card">
      {imageUrl && (
        <Link
          to={permalink}
          className="blog-featured-card__cover-wrap"
          data-cover-ratio={isLegacyCover ? '2:1' : '5:2'}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={imageUrl}
            alt={title}
            className="blog-featured-card__cover"
            loading="eager"
            width={1280}
            height={isLegacyCover ? 640 : 512}
          />
        </Link>
      )}

      <div className="blog-featured-card__content">
        <div>
          <div className="blog-featured-card__eyebrow">
            <span className="blog-featured-card__badge">
              <Translate id="blog.featured.badge">Latest Post</Translate>
            </span>
            {primaryTag && (
              <Link to={primaryTag.permalink} className="blog-featured-card__tag">
                {primaryTag.label}
              </Link>
            )}
            <span className="blog-featured-card__meta">
              <time dateTime={new Date(date).toISOString()}>{formattedDate}</time>
              {typeof readingTime !== 'undefined' && ` · ${readingTimePlural(readingTime)}`}
            </span>
          </div>

          <h2 className="blog-featured-card__title">
            <Link to={permalink}>{title}</Link>
          </h2>

          {description && <p className="blog-featured-card__description">{description}</p>}
        </div>

        <div className="blog-featured-card__footer">
          {author ? (
            <div className="blog-featured-card__author">
              {author.imageURL && (
                <img
                  src={author.imageURL}
                  alt={author.name ?? ''}
                  className="blog-featured-card__author-avatar"
                  width={32}
                  height={32}
                />
              )}
              <div className="blog-featured-card__author-info">
                {author.name && <span className="blog-featured-card__author-name">{author.name}</span>}
                {author.title && <span className="blog-featured-card__author-title">{author.title}</span>}
              </div>
            </div>
          ) : <div />}

          <Link to={permalink} className="blog-featured-card__cta">
            <Translate id="blog.featured.readArticle">Read article</Translate>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
