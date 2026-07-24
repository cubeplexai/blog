import Link from '@docusaurus/Link';
import type { BlogSidebar } from '@docusaurus/plugin-content-blog';
import type { ReactNode } from 'react';

type Props = {
  sidebar?: BlogSidebar;
};

export default function RecentPosts({ sidebar }: Props): ReactNode {
  if (!sidebar?.items.length) return null;

  return (
    <nav className="recent-posts" aria-label="Recent posts">
      <p className="recent-posts__title">Recent posts</p>
      <ul className="recent-posts__list">
        {sidebar.items.map((item) => (
          <li key={item.permalink}>
            <Link to={item.permalink}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
