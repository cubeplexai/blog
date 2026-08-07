import AllPosts from '@site/src/components/AllPosts';
import type { Props } from '@theme/BlogSidebar';
import type { ReactNode } from 'react';

export default function BlogSidebar({ sidebar }: Props): ReactNode {
  if (!sidebar?.items.length) return null;

  return (
    <aside className="col col--3 blog-recent-posts">
      <AllPosts sidebar={sidebar} />
    </aside>
  );
}
