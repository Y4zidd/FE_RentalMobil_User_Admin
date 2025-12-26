'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Images } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CarImageGalleryProps = {
  mainImage: string;
  images?: string[];
  alt: string;
};

export function CarImageGallery({
  mainImage,
  images,
  alt
}: CarImageGalleryProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const allImages = (images && images.length > 0 ? images : [mainImage]).map(
    (src) => src || mainImage
  );
  const activeImage = allImages[activeIndex] ?? allImages[0];

  const handleOpenWithIndex = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  return (
    <>
      <div className='relative grid gap-2 grid-cols-[2fr_1fr]'>
        <div
          className='group relative h-40 w-full cursor-zoom-in overflow-hidden rounded-md bg-muted sm:h-48'
          onDoubleClick={() => handleOpenWithIndex(0)}
        >
          <Image
            src={activeImage}
            alt={alt}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
          />
        </div>
        <div className='grid h-40 gap-2 sm:h-48'>
          <div
          className='relative h-full cursor-zoom-in overflow-hidden rounded-md bg-muted'
            onDoubleClick={() => handleOpenWithIndex(1)}
          >
            <Image
              src={allImages[1] ?? activeImage}
              alt={alt}
              fill
              className='object-cover'
            />
          </div>
          <div
            className='relative h-full cursor-zoom-in overflow-hidden rounded-md bg-muted'
            onDoubleClick={() => handleOpenWithIndex(2)}
          >
            <Image
              src={allImages[2] ?? allImages[1] ?? activeImage}
              alt={alt}
              fill
              className='object-cover'
            />
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
            <div className='pointer-events-none absolute bottom-3 right-3'>
              <Button
                size='sm'
                variant='secondary'
                className='pointer-events-auto flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm'
                onClick={() => handleOpenWithIndex(activeIndex)}
              >
                <Images className='h-4 w-4' />
                View photos
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-3xl border-0 bg-background/95 p-0 sm:p-0'>
          <DialogHeader className='px-6 pt-6'>
            <DialogTitle className='text-lg font-semibold'>
              Photo gallery
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 px-6 pb-6 pt-2'>
            <div className='relative h-[260px] w-full overflow-hidden rounded-md bg-muted sm:h-[340px]'>
              <Image
                src={activeImage}
                alt={alt}
                fill
                className='object-cover'
              />
            </div>
            <div className='grid grid-cols-4 gap-2'>
              {allImages.map((src, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative h-16 overflow-hidden rounded-md bg-muted',
                    index === activeIndex && 'ring-2 ring-primary'
                  )}
                >
                  <Image src={src} alt={alt} fill className='object-cover' />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
