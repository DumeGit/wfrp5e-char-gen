// Source formatting is shared by the interface and PDF exports.
export const CORE_BOOK='core';
export function sourceLabel(R,entry,{short=true}={}){
 const source=entry?.source||{book:CORE_BOOK,page:entry?.page??'—'};
 const book=R.books?.find(x=>x.id===source.book);
 return `${book?(short?book.shortTitle||book.title:book.title):'Core'} · p. ${source.page}`;
}
export function contentReference(R,kind,name){
 const entries=kind==='species'?Object.values(R.species):R[kind]||[];
 return entries.find(x=>x.name===name||x.id===name);
}
