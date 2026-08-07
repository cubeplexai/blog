import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import { useVisibleBlogSidebarItems } from '@docusaurus/plugin-content-blog/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { BlogSidebar, BlogSidebarItem } from '@docusaurus/plugin-content-blog';
import { useMemo, useState, type ReactNode } from 'react';

const INITIAL_VISIBLE_COUNT = 8;

type Props = {
  sidebar?: BlogSidebar;
};

type PostGroup = {
  key: string;
  label: string;
  items: BlogSidebarItem[];
};

function groupPostsByMonth(items: BlogSidebarItem[], locale: string): PostGroup[] {
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return items.reduce<PostGroup[]>((groups, item) => {
    const date = new Date(item.date);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const currentGroup = groups.at(-1);

    if (currentGroup?.key === key) {
      currentGroup.items.push(item);
    } else {
      groups.push({ key, label: monthFormatter.format(date), items: [item] });
    }

    return groups;
  }, []);
}

function PostGroups({ groups }: { groups: PostGroup[] }): ReactNode {
  return (
    <div className="all-posts__groups">
      {groups.map((group) => (
        <section className="all-posts__group" key={group.key} aria-labelledby={`posts-${group.key}`}>
          <h2 className="all-posts__month" id={`posts-${group.key}`}>
            {group.label}
          </h2>
          <ol className="all-posts__list">
            {group.items.map((item) => {
              const date = new Date(item.date);

              return (
                <li key={item.permalink}>
                  <time dateTime={date.toISOString()}>
                    {String(date.getUTCDate()).padStart(2, '0')}
                  </time>
                  <Link isNavLink to={item.permalink} activeClassName="all-posts__link--active">
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

export default function AllPosts({ sidebar }: Props): ReactNode {
  const { i18n } = useDocusaurusContext();
  const visibleItems = useVisibleBlogSidebarItems(sidebar?.items ?? []);
  const [expanded, setExpanded] = useState(false);
  const locale = i18n.currentLocale === 'zh-Hans' ? 'zh-CN' : i18n.currentLocale;
  const sortedItems = useMemo(
    () => [...visibleItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [visibleItems],
  );

  if (!sortedItems.length) return null;

  const displayedItems = expanded ? sortedItems : sortedItems.slice(0, INITIAL_VISIBLE_COUNT);
  const desktopGroups = groupPostsByMonth(displayedItems, locale);
  const mobileGroups = groupPostsByMonth(sortedItems, locale);
  const hasMore = sortedItems.length > INITIAL_VISIBLE_COUNT;
  const title = <Translate id="blog.allPosts.title">All articles</Translate>;

  return (
    <nav
      className="all-posts"
      aria-label={translate({ id: 'blog.allPosts.ariaLabel', message: 'All articles' })}
    >
      <div className="all-posts__desktop">
        <p className="all-posts__title">{title}</p>
        <PostGroups groups={desktopGroups} />
        {hasMore ? (
          <button className="all-posts__toggle" type="button" onClick={() => setExpanded(!expanded)}>
            {expanded
              ? translate({ id: 'blog.allPosts.showLess', message: 'Show fewer' })
              : translate(
                  { id: 'blog.allPosts.showAll', message: 'View all {count} articles' },
                  { count: sortedItems.length },
                )}
          </button>
        ) : null}
      </div>

      <details className="all-posts__mobile">
        <summary>
          <span>{title}</span>
          <span className="all-posts__count">{sortedItems.length}</span>
        </summary>
        <PostGroups groups={mobileGroups} />
      </details>
    </nav>
  );
}
