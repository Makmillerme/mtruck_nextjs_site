'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '../ui/button';
import { LuShare2 } from 'react-icons/lu';
import { useMemo, useState } from 'react';

import {
  TwitterShareButton,
  EmailShareButton,
  LinkedinShareButton,
  TwitterIcon,
  EmailIcon,
  LinkedinIcon,
} from 'react-share';

function ShareButton({ productId, name }: { productId: string; name: string }) {
  const configuredUrl = process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, '');
  const [origin, setOrigin] = useState(configuredUrl ?? '');

  const shareLink = useMemo(
    () => `${origin || configuredUrl || ''}/products/${productId}`,
    [origin, configuredUrl, productId]
  );

  return (
    <Popover
      onOpenChange={(open) => {
        if (open && !origin && typeof window !== 'undefined') {
          setOrigin(window.location.origin);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='p-2'>
          <LuShare2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side='top'
        align='end'
        sideOffset={10}
        className='flex items-center gap-x-2 justify-center w-full'
      >
        <TwitterShareButton url={shareLink} title={name}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton url={shareLink} title={name}>
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <EmailShareButton url={shareLink} title={name}>
          <EmailIcon size={32} round />
        </EmailShareButton>
      </PopoverContent>
    </Popover>
  );
}
export default ShareButton;
