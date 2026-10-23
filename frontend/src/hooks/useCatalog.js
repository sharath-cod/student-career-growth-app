import { useEffect, useState } from 'react';
import api from '../services/api.js';

let cache = null;
// Dropdown data from the server (loaded once per page visit).
export function useCatalog() {
  const [catalog, setCatalog] = useState(cache);
  useEffect(() => {
    if (cache) return;
    api.get('/meta/catalog').then(({ data }) => { cache = data; setCatalog(data); }).catch(() => {});
  }, []);
  return catalog;
}
