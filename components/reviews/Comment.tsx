'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

function Comment({ comment }: { comment: string }) {
  const t = useTranslations('Reviews');
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const longComment = comment.length > 130;
  const displayComment =
    longComment && !isExpanded ? `${comment.slice(0, 130)}...` : comment;

  return (
    <div>
      <p className='text-sm'>{displayComment}</p>
      {longComment && (
        <Button
          variant='link'
          className='pl-0 text-muted-foreground'
          onClick={toggleExpanded}
        >
          {isExpanded ? t('showLess') : t('showMore')}
        </Button>
      )}
    </div>
  );
}
export default Comment;
