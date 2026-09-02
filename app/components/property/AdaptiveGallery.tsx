'use client';
import PropertyImage from './PropertyImage';

type Props={images?:string[];alt:string};
export default function AdaptiveGallery({images=[],alt}:Props){
 const list=images.filter(Boolean).slice(0,5);
 if(!list.length) return <div className="sg-gallery-empty">Photos coming soon</div>;
 return <div className={`sg-gallery sg-gallery-${list.length}`}>
  {list.map((src,i)=><div key={`${src}-${i}`} className={`sg-gallery-item sg-gallery-item-${i}`}><PropertyImage src={src} alt={`${alt} ${i+1}`} priority={i===0}/></div>)}
 </div>;
}
