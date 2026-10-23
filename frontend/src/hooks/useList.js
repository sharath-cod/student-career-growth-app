import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { parseError } from '../services/api.js';

// Loads a list from the API and gives save / remove helpers.
export function useList(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { data } = await api.get(endpoint);
      setItems(data.items);
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { reload(); }, [reload]);

  // Throws on failure so the form can show field errors.
  const save = useCallback(async (id, payload) => {
    const res = id ? await api.put(`${endpoint}/${id}`, payload) : await api.post(endpoint, payload);
    await reload();
    return res.data.item;
  }, [endpoint, reload]);

  const remove = useCallback(async (id) => {
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success('Deleted');
      await reload();
    } catch (err) {
      toast.error(parseError(err).message);
    }
  }, [endpoint, reload]);

  return { items, loading, reload, save, remove };
}
