import clsx from 'clsx';
import type { Props } from '@theme/BlogPostItem/Container';
import type { ReactNode } from 'react';

export default function BlogPostItemContainer({ children, className }: Props): ReactNode {
  return <article className={clsx('blog-post', className)}>{children}</article>;
}
