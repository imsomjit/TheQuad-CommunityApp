import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | The Quad` : 'The Quad';
  }, [title]);
}
