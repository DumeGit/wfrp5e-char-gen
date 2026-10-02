import {readFile} from 'node:fs/promises';
import {loadBookLibrary} from '../dist/books.mjs';
const library=await loadBookLibrary(async url=>JSON.parse(await readFile(url,'utf8')));
console.log(`Validated ${library.packs.length} book pack(s), including dependencies, references and conversion reviews.`);
