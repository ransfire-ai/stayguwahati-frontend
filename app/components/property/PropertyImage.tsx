'use client';
import { useState } from 'react';

type Props = { src?: string; alt: string; priority?: boolean; className?: string };

function optimize(src: string) {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    return src.replace('/upload/', '/upload/f_auto,q_auto,w_1200,c_limit/');
  }
  return src;
}

export default function PropertyImage({ src, alt, priority = false, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`sg-property-image ${className}`}>
      {src && !failed ? (
        <img src={optimize(src)} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} onError={() => setFailed(true)} />
      ) : (
        <div style={{padding:20,color:'#66727B'}}>StayGuwahati photo</div>
      )}
    </div>
  );
}
