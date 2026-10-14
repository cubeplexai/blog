import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { usePluralForm } from '@docusaurus/theme-common';
import { useDateTimeFormat } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
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

export default function BlogCard({ post }: Props): ReactNode {
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
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const readingTimePlural = useReadingTimePlural();
  const formattedDate = dateTimeFormat.format(new Date(date));
  const primaryTag = tags.length > 0 ? tags[0] : null;
  const author = authors.length > 0 ? authors[0] : null;

  return (
    <article className="blog-card">
      {imageUrl && (
        <Link
          to={permalink}
          className="blog-card__cover-wrap"
          data-cover-ratio={isLegacyCover ? '2:1' : '5:2'}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={imageUrl}
            alt={title}
            className="blog-card__cover"
            loading="lazy"
            width={640}
            height={isLegacyCover ? 320 : 256}
          />
        </Link>
      )}

      <div className="blog-card__content">
        <div className="blog-card__eyebrow">
          {primaryTag && (
            <Link to={primaryTag.permalink} className="blog-card__tag">
              {primaryTag.label}
            </Link>
          )}
          <span className="blog-card__meta">
            <time dateTime={new Date(date).toISOString()}>{formattedDate}</time>
            {typeof readingTime !== 'undefined' && ` · ${readingTimePlural(readingTime)}`}
          </span>
        </div>

        <h3 className="blog-card__title">
          <Link to={permalink}>{title}</Link>
        </h3>

        {description && <p className="blog-card__description">{description}</p>}

        <div className="blog-card__footer">
          {author ? (
            <div className="blog-card__author">
              {author.imageURL && (
                <img
                  src={author.imageURL}
                  alt={author.name ?? ''}
                  className="blog-card__author-avatar"
                  width={24}
                  height={24}
                  loading="lazy"
                />
              )}
              {author.name && <span className="blog-card__author-name">{author.name}</span>}
            </div>
          ) : <div />}

          <span className="blog-card__arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
}
