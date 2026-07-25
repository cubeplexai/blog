import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import type { Props } from '@theme/Footer/LinkItem';

export default function FooterLinkItem({ item }: Props): ReactNode {
  const { to, href, label, prependBaseUrlToHref, className, ...props } = item;
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, { forcePrependBaseUrl: true });
  const opensNewTab = props.target === '_blank';
  const isExternalLink = href && !isInternalUrl(href) && opensNewTab;

  return (
    <Link
      className={clsx('footer__link-item', className)}
      {...(href
        ? { href: prependBaseUrlToHref ? normalizedHref : href }
        : { to: toUrl })}
      {...props}>
      {label}
      {isExternalLink && <IconExternalLink />}
    </Link>
  );
}
