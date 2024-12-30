import { supabase } from '../supabase';
import type { Database } from '../database.types';
import type { Site } from '../../types';

type SiteRow = Database['public']['Tables']['sites']['Row'];

const mapSiteFromDb = (site: SiteRow): Site => ({
  id: site.id,
  siteId: site.site_id,
  location: site.location,
  gpsCoordinates: site.gps_coordinates || undefined,
  acctUrl: site.acct_url || undefined,
  notes: site.notes || undefined,
  connectivity: site.connectivity as 'radio' | 'optical',
  createdAt: site.created_at
});

export const getSites = async (): Promise<Site[]> => {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('site_id');

  if (error) {
    throw new Error('Chyba při načítání sites: ' + error.message);
  }

  return (data || []).map(mapSiteFromDb);
};

export const getSite = async (id: string): Promise<Site> => {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Site nebyl nalezen');
  }

  return mapSiteFromDb(data);
};

export const createSite = async (site: Omit<Site, 'id' | 'createdAt'>): Promise<Site> => {
  const { data, error } = await supabase
    .from('sites')
    .insert([{
      site_id: site.siteId,
      location: site.location,
      gps_coordinates: site.gpsCoordinates,
      acct_url: site.acctUrl,
      notes: site.notes,
      connectivity: site.connectivity
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při vytváření site: ' + error.message);
  }

  return mapSiteFromDb(data);
};

export const updateSite = async (id: string, site: Partial<Omit<Site, 'id' | 'createdAt'>>): Promise<Site> => {
  const { data, error } = await supabase
    .from('sites')
    .update({
      site_id: site.siteId,
      location: site.location,
      gps_coordinates: site.gpsCoordinates,
      acct_url: site.acctUrl,
      notes: site.notes,
      connectivity: site.connectivity
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Chyba při aktualizaci site: ' + error.message);
  }

  return mapSiteFromDb(data);
};

export const deleteSite = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Chyba při mazání site: ' + error.message);
  }
};
