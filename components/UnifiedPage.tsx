import React from 'react';
export default function UnifiedPage({eyebrow,title,children}:{eyebrow:string,title:string,children:React.ReactNode}){return <div className="sg-shell min-h-screen"><main><p className="text-xs font-bold tracking-[.18em] uppercase text-[#237C73]">{eyebrow}</p><h1 className="text-4xl md:text-6xl font-black mt-2 mb-8">{title}</h1>{children}</main></div>}
