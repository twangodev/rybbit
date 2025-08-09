'use client';

import { useMDXComponent } from 'fumadocs-ui/mdx/client';

interface MDXContentProps {
  children: string;
}

export function MDXContent({ children }: MDXContentProps) {
  const Component = useMDXComponent(children);
  return <Component />;
}